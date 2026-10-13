package com.gigsphere.gigmart.dto;

import com.gigsphere.gigmart.enums.ProviderType;

public class ProviderProfileUpdateRequest {
    private ProviderType providerType;
    private String businessName;

    public ProviderProfileUpdateRequest() {
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
