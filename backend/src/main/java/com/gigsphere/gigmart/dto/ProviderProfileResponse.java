package com.gigsphere.gigmart.dto;

import com.gigsphere.gigmart.enums.ProviderType;
import java.util.UUID;

public class ProviderProfileResponse {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private ProviderType providerType;
    private String businessName;
    private Float avgRating;

    public ProviderProfileResponse() {
    }

    public ProviderProfileResponse(UUID id, UUID userId, String userName, String userEmail, String userPhone,
                                   ProviderType providerType, String businessName, Float avgRating) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userPhone = userPhone;
        this.providerType = providerType;
        this.businessName = businessName;
        this.avgRating = avgRating;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserPhone() {
        return userPhone;
    }

    public void setUserPhone(String userPhone) {
        this.userPhone = userPhone;
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

    public Float getAvgRating() {
        return avgRating;
    }

    public void setAvgRating(Float avgRating) {
        this.avgRating = avgRating;
    }
}
