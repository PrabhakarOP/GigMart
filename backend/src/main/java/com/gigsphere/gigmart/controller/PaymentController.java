package com.gigsphere.gigmart.controller;

import com.gigsphere.gigmart.dto.ApiResponse;
import com.gigsphere.gigmart.dto.PaymentCreateRequest;
import com.gigsphere.gigmart.dto.PaymentResponse;
import com.gigsphere.gigmart.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@Valid @RequestBody PaymentCreateRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Payment processed successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getPaymentById(id)));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByBooking(@PathVariable UUID bookingId) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getPaymentsByBooking(bookingId)));
    }
}
