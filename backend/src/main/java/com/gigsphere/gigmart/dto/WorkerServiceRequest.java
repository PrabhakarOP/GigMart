package com.gigsphere.gigmart.dto;

import com.gigsphere.gigmart.enums.RateType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class WorkerServiceRequest {

    @NotNull(message = "Worker profile ID is required")
    private UUID workerProfileId;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @NotNull(message = "Base rate is required")
    @DecimalMin(value = "0.01", message = "Base rate must be greater than zero")
    private BigDecimal baseRate;

    @NotNull(message = "Rate type is required (HOURLY or FIXED)")
    private RateType rateType;

    public WorkerServiceRequest() {
    }

    public UUID getWorkerProfileId() {
        return workerProfileId;
    }

    public void setWorkerProfileId(UUID workerProfileId) {
        this.workerProfileId = workerProfileId;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }

    public BigDecimal getBaseRate() {
        return baseRate;
    }

    public void setBaseRate(BigDecimal baseRate) {
        this.baseRate = baseRate;
    }

    public RateType getRateType() {
        return rateType;
    }

    public void setRateType(RateType rateType) {
        this.rateType = rateType;
    }
}
