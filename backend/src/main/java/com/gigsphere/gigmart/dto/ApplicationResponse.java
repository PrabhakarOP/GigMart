package com.gigsphere.gigmart.dto;

import com.gigsphere.gigmart.enums.ApplicationStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ApplicationResponse {
    private UUID id;
    private UUID gigId;
    private String gigTitle;
    private UUID workerProfileId;
    private String workerName;
    private Float workerRating;
    private BigDecimal quotedPrice;
    private String coverNote;
    private ApplicationStatus status;
    private LocalDateTime createdAt;

    public ApplicationResponse() {
    }

    public ApplicationResponse(UUID id, UUID gigId, String gigTitle, UUID workerProfileId, String workerName,
                               Float workerRating, BigDecimal quotedPrice, String coverNote,
                               ApplicationStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.gigId = gigId;
        this.gigTitle = gigTitle;
        this.workerProfileId = workerProfileId;
        this.workerName = workerName;
        this.workerRating = workerRating;
        this.quotedPrice = quotedPrice;
        this.coverNote = coverNote;
        this.status = status;
        this.createdAt = createdAt;
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

    public Float getWorkerRating() {
        return workerRating;
    }

    public void setWorkerRating(Float workerRating) {
        this.workerRating = workerRating;
    }

    public BigDecimal getQuotedPrice() {
        return quotedPrice;
    }

    public void setQuotedPrice(BigDecimal quotedPrice) {
        this.quotedPrice = quotedPrice;
    }

    public String getCoverNote() {
        return coverNote;
    }

    public void setCoverNote(String coverNote) {
        this.coverNote = coverNote;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
