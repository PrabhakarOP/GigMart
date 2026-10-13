package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.ApplicationCreateRequest;
import com.gigsphere.gigmart.dto.ApplicationResponse;
import com.gigsphere.gigmart.entity.Application;
import com.gigsphere.gigmart.entity.Gig;
import com.gigsphere.gigmart.entity.WorkerProfile;
import com.gigsphere.gigmart.enums.ApplicationStatus;
import com.gigsphere.gigmart.enums.GigStatus;
import com.gigsphere.gigmart.exception.BadRequestException;
import com.gigsphere.gigmart.exception.ConflictException;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.ApplicationRepository;
import com.gigsphere.gigmart.repository.GigRepository;
import com.gigsphere.gigmart.repository.WorkerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final GigRepository gigRepository;
    private final WorkerProfileRepository workerProfileRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              GigRepository gigRepository,
                              WorkerProfileRepository workerProfileRepository) {
        this.applicationRepository = applicationRepository;
        this.gigRepository = gigRepository;
        this.workerProfileRepository = workerProfileRepository;
    }

    @Transactional
    public ApplicationResponse applyForGig(ApplicationCreateRequest request) {
        Gig gig = gigRepository.findById(request.getGigId())
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found: " + request.getGigId()));

        if (gig.getStatus() != GigStatus.OPEN) {
            throw new BadRequestException("Cannot apply to gig with status: " + gig.getStatus());
        }

        WorkerProfile workerProfile = workerProfileRepository.findById(request.getWorkerProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found: " + request.getWorkerProfileId()));

        if (applicationRepository.existsByGigIdAndWorkerProfileId(gig.getId(), workerProfile.getId())) {
            throw new ConflictException("Worker has already submitted an application for this gig");
        }

        Application application = new Application(
                gig,
                workerProfile,
                request.getQuotedPrice(),
                request.getCoverNote()
        );

        Application saved = applicationRepository.save(application);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByGig(UUID gigId) {
        return applicationRepository.findByGigId(gigId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByWorker(UUID workerProfileId) {
        return applicationRepository.findByWorkerProfileId(workerProfileId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(UUID id) {
        return toResponse(getEntityById(id));
    }

    @Transactional(readOnly = true)
    public Application getEntityById(UUID id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
    }

    @Transactional
    public ApplicationResponse withdrawApplication(UUID id) {
        Application app = getEntityById(id);
        if (app.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("Only pending applications can be withdrawn");
        }
        app.setStatus(ApplicationStatus.WITHDRAWN);
        Application updated = applicationRepository.save(app);
        return toResponse(updated);
    }

    public ApplicationResponse toResponse(Application app) {
        String workerName = app.getWorkerProfile() != null && app.getWorkerProfile().getUser() != null
                ? app.getWorkerProfile().getUser().getFullName()
                : "";

        Float workerRating = app.getWorkerProfile() != null ? app.getWorkerProfile().getAvgRating() : 0.0f;
        String gigTitle = app.getGig() != null ? app.getGig().getTitle() : "";

        return new ApplicationResponse(
                app.getId(),
                app.getGig().getId(),
                gigTitle,
                app.getWorkerProfile().getId(),
                workerName,
                workerRating,
                app.getQuotedPrice(),
                app.getCoverNote(),
                app.getStatus(),
                app.getCreatedAt()
        );
    }
}
