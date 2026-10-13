package com.gigsphere.gigmart.entity;

import com.gigsphere.gigmart.enums.VerificationStatus;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "worker_profiles")
public class WorkerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "experience_years")
    private Integer experienceYears = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 20)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "avg_rating", nullable = false)
    private Float avgRating = 0.0f;

    @Column(name = "service_radius_km")
    private Integer serviceRadiusKm = 10;

    @OneToMany(mappedBy = "workerProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkerService> services = new ArrayList<>();

    @OneToMany(mappedBy = "workerProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkerDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "workerProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AvailabilitySlot> availabilitySlots = new ArrayList<>();

    public WorkerProfile() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public List<WorkerService> getServices() {
        return services;
    }

    public void setServices(List<WorkerService> services) {
        this.services = services;
    }

    public List<WorkerDocument> getDocuments() {
        return documents;
    }

    public void setDocuments(List<WorkerDocument> documents) {
        this.documents = documents;
    }

    public List<AvailabilitySlot> getAvailabilitySlots() {
        return availabilitySlots;
    }

    public void setAvailabilitySlots(List<AvailabilitySlot> availabilitySlots) {
        this.availabilitySlots = availabilitySlots;
    }
}
