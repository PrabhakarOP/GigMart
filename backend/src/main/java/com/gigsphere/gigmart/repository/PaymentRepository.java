package com.gigsphere.gigmart.repository;

import com.gigsphere.gigmart.entity.Payment;
import com.gigsphere.gigmart.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByBookingId(UUID bookingId);
    List<Payment> findByStatus(PaymentStatus status);
}
