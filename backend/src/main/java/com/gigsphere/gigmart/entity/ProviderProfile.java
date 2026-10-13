package com.gigsphere.gigmart.entity;

import com.gigsphere.gigmart.enums.ProviderType;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "provider_profiles")
public class ProviderProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_type", nullable = false, length = 20)
    private ProviderType providerType = ProviderType.INDIVIDUAL;

    @Column(name = "business_name")
    private String businessName;

    @Column(name = "avg_rating", nullable = false)
    private Float avgRating = 0.0f;

    @OneToMany(mappedBy = "providerProfile")
    private List<Gig> gigs = new ArrayList<>();

    public ProviderProfile() {
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

    public List<Gig> getGigs() {
        return gigs;
    }

    public void setGigs(List<Gig> gigs) {
        this.gigs = gigs;
    }
}
