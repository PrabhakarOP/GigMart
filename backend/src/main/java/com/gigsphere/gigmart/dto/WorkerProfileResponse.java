package com.gigsphere.gigmart.dto;

import com.gigsphere.gigmart.enums.VerificationStatus;
import java.util.UUID;

public class WorkerProfileResponse {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String bio;
    private Integer experienceYears;
    private VerificationStatus verificationStatus;
    private Float avgRating;
    private Integer serviceRadiusKm;

    public WorkerProfileResponse() {
    }

    public WorkerProfileResponse(UUID id, UUID userId, String userName, String userEmail, String userPhone,
                                 String bio, Integer experienceYears, VerificationStatus verificationStatus,
                                 Float avgRating, Integer serviceRadiusKm) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userPhone = userPhone;
        this.bio = bio;
        this.experienceYears = experienceYears;
        this.verificationStatus = verificationStatus;
        this.avgRating = avgRating;
        this.serviceRadiusKm = serviceRadiusKm;
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

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public Float getAvgRating() {
        return avgRating;
    }

    public void setAvgRating(Float avgRating) {
        this.avgRating = avgRating;
    }

    public Integer getServiceRadiusKm() {
        return serviceRadiusKm;
    }

    public void setServiceRadiusKm(Integer serviceRadiusKm) {
        this.serviceRadiusKm = serviceRadiusKm;
    }
}
