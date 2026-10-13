package com.gigsphere.gigmart.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gigsphere.gigmart.enums.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class BookingResponse {
    private UUID id;
    private UUID gigId;
    private String gigTitle;
    private UUID applicationId;
    private UUID workerProfileId;
    private String workerName;
    private UUID providerProfileId;
    private String providerName;
    private BigDecimal agreedPrice;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime completedAt;

    private BookingStatus status;

    public BookingResponse() {
    }

    public BookingResponse(UUID id, UUID gigId, String gigTitle, UUID applicationId,
                           UUID workerProfileId, String workerName, UUID providerProfileId,
                           String providerName, BigDecimal agreedPrice, LocalDateTime startedAt,
                           LocalDateTime completedAt, BookingStatus status) {
        this.id = id;
        this.gigId = gigId;
        this.gigTitle = gigTitle;
        this.applicationId = applicationId;
        this.workerProfileId = workerProfileId;
        this.workerName = workerName;
        this.providerProfileId = providerProfileId;
        this.providerName = providerName;
        this.agreedPrice = agreedPrice;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getGigId() {
        return gigId;
    }

    public void setGigId(UUID gigId) {
        this.gigId = gigId;
    }

    public String getGigTitle() {
        return gigTitle;
    }

    public void setGigTitle(String gigTitle) {
        this.gigTitle = gigTitle;
    }

    public UUID getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(UUID applicationId) {
        this.applicationId = applicationId;
    }

    public UUID getWorkerProfileId() {
        return workerProfileId;
    }

    public void setWorkerProfileId(UUID workerProfileId) {
        this.workerProfileId = workerProfileId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public UUID getProviderProfileId() {
        return providerProfileId;
    }

    public void setProviderProfileId(UUID providerProfileId) {
        this.providerProfileId = providerProfileId;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public BigDecimal getAgreedPrice() {
        return agreedPrice;
    }

    public void setAgreedPrice(BigDecimal agreedPrice) {
        this.agreedPrice = agreedPrice;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
}
