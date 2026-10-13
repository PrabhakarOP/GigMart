package com.gigsphere.gigmart.controller;

import com.gigsphere.gigmart.dto.ApiResponse;
import com.gigsphere.gigmart.dto.ReviewCreateRequest;
import com.gigsphere.gigmart.dto.ReviewResponse;
import com.gigsphere.gigmart.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(@Valid @RequestBody ReviewCreateRequest request) {
        ReviewResponse response = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Review submitted successfully"));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByBooking(@PathVariable UUID bookingId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviewsByBooking(bookingId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsForUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviewsForUser(userId)));
    }
}
