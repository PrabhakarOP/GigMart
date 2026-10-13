package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.BookingResponse;
import com.gigsphere.gigmart.dto.BookingStatusUpdateRequest;
import com.gigsphere.gigmart.entity.Application;
import com.gigsphere.gigmart.entity.Booking;
import com.gigsphere.gigmart.entity.Gig;
import com.gigsphere.gigmart.enums.ApplicationStatus;
import com.gigsphere.gigmart.enums.BookingStatus;
import com.gigsphere.gigmart.enums.GigStatus;
import com.gigsphere.gigmart.exception.BadRequestException;
import com.gigsphere.gigmart.exception.ConflictException;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.ApplicationRepository;
import com.gigsphere.gigmart.repository.BookingRepository;
import com.gigsphere.gigmart.repository.GigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final GigRepository gigRepository;
    private final ApplicationRepository applicationRepository;

    public BookingService(BookingRepository bookingRepository,
                          GigRepository gigRepository,
                          ApplicationRepository applicationRepository) {
        this.bookingRepository = bookingRepository;
        this.gigRepository = gigRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional
    public BookingResponse acceptApplication(UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        Gig gig = application.getGig();

        if (gig.getStatus() != GigStatus.OPEN) {
            throw new BadRequestException("Cannot accept application for gig with status: " + gig.getStatus());
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("Application is not in PENDING status: " + application.getStatus());
        }

        if (bookingRepository.findByGigId(gig.getId()).isPresent()) {
            throw new ConflictException("A booking already exists for this gig");
        }

        // Accept this application
        application.setStatus(ApplicationStatus.ACCEPTED);
        applicationRepository.save(application);

        // Reject other pending applications for the same gig
        List<Application> otherApps = applicationRepository.findByGigId(gig.getId());
        for (Application otherApp : otherApps) {
            if (!otherApp.getId().equals(application.getId()) && otherApp.getStatus() == ApplicationStatus.PENDING) {
                otherApp.setStatus(ApplicationStatus.REJECTED);
                applicationRepository.save(otherApp);
            }
        }

        // Update gig status to ASSIGNED
        gig.setStatus(GigStatus.ASSIGNED);
        gigRepository.save(gig);

        // Create booking
        Booking booking = new Booking(gig, application, application.getQuotedPrice());
        booking.setStatus(BookingStatus.SCHEDULED);
        Booking saved = bookingRepository.save(booking);

        return toResponse(saved);
    }

    @Transactional
    public BookingResponse updateBookingStatus(UUID id, BookingStatusUpdateRequest request) {
        Booking booking = getEntityById(id);
        BookingStatus newStatus = request.getStatus();
        Gig gig = booking.getGig();

        switch (newStatus) {
            case IN_PROGRESS:
                if (booking.getStatus() != BookingStatus.SCHEDULED) {
                    throw new BadRequestException("Only SCHEDULED bookings can be transitioned to IN_PROGRESS");
                }
                booking.setStartedAt(LocalDateTime.now());
                gig.setStatus(GigStatus.IN_PROGRESS);
                break;

            case COMPLETED:
                if (booking.getStatus() != BookingStatus.IN_PROGRESS && booking.getStatus() != BookingStatus.SCHEDULED) {
                    throw new BadRequestException("Only IN_PROGRESS or SCHEDULED bookings can be marked COMPLETED");
                }
                if (booking.getStartedAt() == null) {
                    booking.setStartedAt(LocalDateTime.now());
                }
                booking.setCompletedAt(LocalDateTime.now());
                gig.setStatus(GigStatus.COMPLETED);
                break;

            case CANCELLED:
                if (booking.getStatus() == BookingStatus.COMPLETED) {
                    throw new BadRequestException("Completed bookings cannot be cancelled");
                }
                gig.setStatus(GigStatus.CANCELLED);
                break;

            default:
                break;
        }

        booking.setStatus(newStatus);
        gigRepository.save(gig);
        Booking updated = bookingRepository.save(booking);

        return toResponse(updated);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(UUID id) {
        return toResponse(getEntityById(id));
    }

    @Transactional(readOnly = true)
    public Booking getEntityById(UUID id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByProvider(UUID providerProfileId) {
        return bookingRepository.findByProviderProfileId(providerProfileId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByWorker(UUID workerProfileId) {
        return bookingRepository.findByWorkerProfileId(workerProfileId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse toResponse(Booking booking) {
        String gigTitle = booking.getGig() != null ? booking.getGig().getTitle() : "";
        UUID providerId = booking.getGig() != null && booking.getGig().getProviderProfile() != null
                ? booking.getGig().getProviderProfile().getId() : null;
        String providerName = booking.getGig() != null && booking.getGig().getProviderProfile() != null
                && booking.getGig().getProviderProfile().getUser() != null
                ? booking.getGig().getProviderProfile().getUser().getFullName() : "";

        UUID workerId = booking.getApplication() != null && booking.getApplication().getWorkerProfile() != null
                ? booking.getApplication().getWorkerProfile().getId() : null;
        String workerName = booking.getApplication() != null && booking.getApplication().getWorkerProfile() != null
                && booking.getApplication().getWorkerProfile().getUser() != null
                ? booking.getApplication().getWorkerProfile().getUser().getFullName() : "";

        return new BookingResponse(
                booking.getId(),
                booking.getGig().getId(),
                gigTitle,
                booking.getApplication().getId(),
                workerId,
                workerName,
                providerId,
                providerName,
                booking.getAgreedPrice(),
                booking.getStartedAt(),
                booking.getCompletedAt(),
                booking.getStatus()
        );
    }
}
