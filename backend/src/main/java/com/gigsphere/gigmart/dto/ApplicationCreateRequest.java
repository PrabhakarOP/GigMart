package com.gigsphere.gigmart.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class ApplicationCreateRequest {

    @NotNull(message = "Gig ID is required")
    private UUID gigId;

    @NotNull(message = "Worker profile ID is required")
    private UUID workerProfileId;

    @NotNull(message = "Quoted price is required")
    @DecimalMin(value = "0.01", message = "Quoted price must be greater than zero")
    private BigDecimal quotedPrice;

    private String coverNote;

    public ApplicationCreateRequest() {
    }

    public UUID getGigId() {
        return gigId;
    }

    public void setGigId(UUID gigId) {
        this.gigId = gigId;
    }

    public UUID getWorkerProfileId() {
        return workerProfileId;
    }

    public void setWorkerProfileId(UUID workerProfileId) {
        this.workerProfileId = workerProfileId;
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
}
