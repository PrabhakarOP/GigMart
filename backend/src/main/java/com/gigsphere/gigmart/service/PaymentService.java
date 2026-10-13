package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.PaymentCreateRequest;
import com.gigsphere.gigmart.dto.PaymentResponse;
import com.gigsphere.gigmart.entity.Booking;
import com.gigsphere.gigmart.entity.Payment;
import com.gigsphere.gigmart.enums.PaymentStatus;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.BookingRepository;
import com.gigsphere.gigmart.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final BigDecimal PLATFORM_FEE_PERCENTAGE = new BigDecimal("0.10"); // 10% fee

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    public PaymentService(PaymentRepository paymentRepository, BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public PaymentResponse processPayment(PaymentCreateRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + request.getBookingId()));

        BigDecimal amount = request.getAmount();
        BigDecimal platformFee = amount.multiply(PLATFORM_FEE_PERCENTAGE).setScale(2, RoundingMode.HALF_UP);

        Payment payment = new Payment(
                booking,
                amount,
                platformFee,
                request.getMethod(),
                PaymentStatus.PAID
        );
        payment.setPaidAt(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByBooking(UUID bookingId) {
        return paymentRepository.findByBookingId(bookingId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return toResponse(payment);
    }

    public PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getBooking().getId(),
                payment.getAmount(),
                payment.getPlatformFee(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getPaidAt()
        );
    }
}
