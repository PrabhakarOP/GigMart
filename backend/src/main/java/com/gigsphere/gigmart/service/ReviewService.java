package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.ReviewCreateRequest;
import com.gigsphere.gigmart.dto.ReviewResponse;
import com.gigsphere.gigmart.entity.Booking;
import com.gigsphere.gigmart.entity.ProviderProfile;
import com.gigsphere.gigmart.entity.Review;
import com.gigsphere.gigmart.entity.User;
import com.gigsphere.gigmart.entity.WorkerProfile;
import com.gigsphere.gigmart.enums.BookingStatus;
import com.gigsphere.gigmart.exception.BadRequestException;
import com.gigsphere.gigmart.exception.ConflictException;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.BookingRepository;
import com.gigsphere.gigmart.repository.ProviderProfileRepository;
import com.gigsphere.gigmart.repository.ReviewRepository;
import com.gigsphere.gigmart.repository.UserRepository;
import com.gigsphere.gigmart.repository.WorkerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final ProviderProfileRepository providerProfileRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         BookingRepository bookingRepository,
                         UserRepository userRepository,
                         WorkerProfileRepository workerProfileRepository,
                         ProviderProfileRepository providerProfileRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.providerProfileRepository = providerProfileRepository;
    }

    @Transactional
    public ReviewResponse createReview(ReviewCreateRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + request.getBookingId()));

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Reviews can only be submitted for completed bookings");
        }

        User reviewer = userRepository.findById(request.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found: " + request.getReviewerId()));

        User providerUser = booking.getGig().getProviderProfile().getUser();
        User workerUser = booking.getApplication().getWorkerProfile().getUser();

        // Validate that reviewer is part of this booking
        if (!reviewer.getId().equals(providerUser.getId()) && !reviewer.getId().equals(workerUser.getId())) {
            throw new BadRequestException("Reviewer is not a participant in this booking");
        }

        // Determine reviewee automatically if not matching
        User reviewee = reviewer.getId().equals(providerUser.getId()) ? workerUser : providerUser;

        if (reviewRepository.existsByBookingIdAndReviewerId(booking.getId(), reviewer.getId())) {
            throw new ConflictException("You have already submitted a review for this booking");
        }

        Review review = new Review(
                booking,
                reviewer,
                reviewee,
                request.getRating(),
                request.getComment()
        );

        Review saved = reviewRepository.save(review);

        // Recalculate average rating for reviewee
        updateRevieweeAverageRating(reviewee.getId());

        return toResponse(saved);
    }

    private void updateRevieweeAverageRating(UUID revieweeUserId) {
        Double avg = reviewRepository.calculateAverageRatingByRevieweeId(revieweeUserId);
        if (avg == null) {
            avg = 0.0;
        }
        float roundedAvg = BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).floatValue();

        // Check if reviewee is worker
        Optional<WorkerProfile> workerProfile = workerProfileRepository.findByUserId(revieweeUserId);
        if (workerProfile.isPresent()) {
            WorkerProfile wp = workerProfile.get();
            wp.setAvgRating(roundedAvg);
            workerProfileRepository.save(wp);
            return;
        }

        // Check if reviewee is provider
        Optional<ProviderProfile> providerProfile = providerProfileRepository.findByUserId(revieweeUserId);
        if (providerProfile.isPresent()) {
            ProviderProfile pp = providerProfile.get();
            pp.setAvgRating(roundedAvg);
            providerProfileRepository.save(pp);
        }
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByBooking(UUID bookingId) {
        return reviewRepository.findByBookingId(bookingId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForUser(UUID userId) {
        return reviewRepository.findByRevieweeId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getBooking().getId(),
                review.getReviewer().getId(),
                review.getReviewer().getFullName(),
                review.getReviewee().getId(),
                review.getReviewee().getFullName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
