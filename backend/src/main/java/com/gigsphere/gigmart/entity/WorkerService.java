package com.gigsphere.gigmart.entity;

import com.gigsphere.gigmart.enums.RateType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "worker_services", uniqueConstraints = {
        @UniqueConstraint(name = "uk_worker_category", columnNames = {"worker_id", "category_id"})
})
public class WorkerService {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private WorkerProfile workerProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ServiceCategory category;

    @Column(name = "base_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "rate_type", nullable = false, length = 20)
    private RateType rateType = RateType.HOURLY;

    public WorkerService() {
    }

    public WorkerService(WorkerProfile workerProfile, ServiceCategory category, BigDecimal baseRate, RateType rateType) {
        this.workerProfile = workerProfile;
        this.category = category;
        this.baseRate = baseRate;
        this.rateType = rateType;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public WorkerProfile getWorkerProfile() {
        return workerProfile;
    }

    public void setWorkerProfile(WorkerProfile workerProfile) {
        this.workerProfile = workerProfile;
    }

    public ServiceCategory getCategory() {
        return category;
    }

    public void setCategory(ServiceCategory category) {
        this.category = category;
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
