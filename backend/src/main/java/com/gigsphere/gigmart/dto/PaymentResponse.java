package com.gigsphere.gigmart.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gigsphere.gigmart.enums.PaymentMethod;
import com.gigsphere.gigmart.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class PaymentResponse {
    private UUID id;
    private UUID bookingId;
    private BigDecimal amount;
    private BigDecimal platformFee;
    private BigDecimal netWorkerAmount;
    private PaymentMethod method;
    private PaymentStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime paidAt;

    public PaymentResponse() {
    }

    public PaymentResponse(UUID id, UUID bookingId, BigDecimal amount, BigDecimal platformFee,
                           PaymentMethod method, PaymentStatus status, LocalDateTime paidAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.amount = amount;
        this.platformFee = platformFee;
        this.netWorkerAmount = amount != null && platformFee != null ? amount.subtract(platformFee) : amount;
        this.method = method;
        this.status = status;
        this.paidAt = paidAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getBookingId() {
        return bookingId;
    }

    public void setBookingId(UUID bookingId) {
        this.bookingId = bookingId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getPlatformFee() {
        return platformFee;
    }

    public void setPlatformFee(BigDecimal platformFee) {
        this.platformFee = platformFee;
    }

    public BigDecimal getNetWorkerAmount() {
        return netWorkerAmount;
    }

    public void setNetWorkerAmount(BigDecimal netWorkerAmount) {
        this.netWorkerAmount = netWorkerAmount;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}
