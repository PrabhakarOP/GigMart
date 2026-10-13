package com.gigsphere.gigmart.repository;

import com.gigsphere.gigmart.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByBookingId(UUID bookingId);
    List<Review> findByRevieweeId(UUID revieweeId);
    List<Review> findByReviewerId(UUID reviewerId);
    boolean existsByBookingIdAndReviewerId(UUID bookingId, UUID reviewerId);
    Optional<Review> findByBookingIdAndReviewerId(UUID bookingId, UUID reviewerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :revieweeId")
    Double calculateAverageRatingByRevieweeId(@Param("revieweeId") UUID revieweeId);
}
