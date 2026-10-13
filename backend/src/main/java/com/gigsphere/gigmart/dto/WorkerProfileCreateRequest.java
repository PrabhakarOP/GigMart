package com.gigsphere.gigmart.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class WorkerProfileCreateRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    private String bio;

    private Integer experienceYears = 0;

    private Integer serviceRadiusKm = 10;

    public WorkerProfileCreateRequest() {
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public Integer getServiceRadiusKm() {
        return serviceRadiusKm;
    }

    public void setServiceRadiusKm(Integer serviceRadiusKm) {
        this.serviceRadiusKm = serviceRadiusKm;
    }
}
