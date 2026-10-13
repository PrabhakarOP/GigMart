package com.gigsphere.gigmart.dto;

import com.gigsphere.gigmart.enums.ProviderType;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ProviderProfileCreateRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    private ProviderType providerType = ProviderType.INDIVIDUAL;

    private String businessName;

    public ProviderProfileCreateRequest() {
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public ProviderType getProviderType() {
        return providerType;
    }

    public void setProviderType(ProviderType providerType) {
        this.providerType = providerType;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }
}
