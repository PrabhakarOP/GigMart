package com.gigsphere.gigmart.controller;

import com.gigsphere.gigmart.dto.ApiResponse;
import com.gigsphere.gigmart.dto.BookingResponse;
import com.gigsphere.gigmart.dto.BookingStatusUpdateRequest;
import com.gigsphere.gigmart.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/accept/{applicationId}")
    public ResponseEntity<ApiResponse<BookingResponse>> acceptApplication(@PathVariable UUID applicationId) {
        BookingResponse response = bookingService.acceptApplication(applicationId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Application accepted and booking confirmed"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getBookingById(id)));
    }

    @GetMapping("/provider/{providerProfileId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByProvider(@PathVariable UUID providerProfileId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getBookingsByProvider(providerProfileId)));
    }

    @GetMapping("/worker/{workerProfileId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByWorker(@PathVariable UUID workerProfileId) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getBookingsByWorker(workerProfileId)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable UUID id,
            @Valid @RequestBody BookingStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.updateBookingStatus(id, request), "Booking status updated"));
    }
}
