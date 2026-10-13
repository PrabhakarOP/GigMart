package com.gigsphere.gigmart.dto;

import com.gigsphere.gigmart.enums.RateType;
import java.math.BigDecimal;
import java.util.UUID;

public class WorkerServiceResponse {
    private UUID id;
    private UUID workerProfileId;
    private UUID categoryId;
    private String categoryName;
    private BigDecimal baseRate;
    private RateType rateType;

    public WorkerServiceResponse() {
    }

    public WorkerServiceResponse(UUID id, UUID workerProfileId, UUID categoryId, String categoryName, BigDecimal baseRate, RateType rateType) {
        this.id = id;
        this.workerProfileId = workerProfileId;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.baseRate = baseRate;
        this.rateType = rateType;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
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
