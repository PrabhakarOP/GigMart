package com.gigsphere.gigmart.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gigsphere.gigmart.enums.GigStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class GigResponse {
    private UUID id;
    private UUID providerProfileId;
    private String providerName;
    private UUID categoryId;
    private String categoryName;
    private UUID addressId;
    private String addressSummary;
    private String title;
    private String description;
    private BigDecimal budget;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime scheduledAt;

    private GigStatus status;
    private int applicationCount;

    public GigResponse() {
    }

    public GigResponse(UUID id, UUID providerProfileId, String providerName, UUID categoryId, String categoryName,
                       UUID addressId, String addressSummary, String title, String description,
                       BigDecimal budget, LocalDateTime scheduledAt, GigStatus status, int applicationCount) {
        this.id = id;
        this.providerProfileId = providerProfileId;
        this.providerName = providerName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.addressId = addressId;
        this.addressSummary = addressSummary;
        this.title = title;
        this.description = description;
        this.budget = budget;
        this.scheduledAt = scheduledAt;
        this.status = status;
        this.applicationCount = applicationCount;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public UUID getAddressId() {
        return addressId;
    }

    public void setAddressId(UUID addressId) {
        this.addressId = addressId;
    }

    public String getAddressSummary() {
        return addressSummary;
    }

    public void setAddressSummary(String addressSummary) {
        this.addressSummary = addressSummary;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public GigStatus getStatus() {
        return status;
    }

    public void setStatus(GigStatus status) {
        this.status = status;
    }

    public int getApplicationCount() {
        return applicationCount;
    }

    public void setApplicationCount(int applicationCount) {
        this.applicationCount = applicationCount;
    }
}
