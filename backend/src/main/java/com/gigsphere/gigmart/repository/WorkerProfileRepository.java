package com.gigsphere.gigmart.repository;

import com.gigsphere.gigmart.entity.WorkerProfile;
import com.gigsphere.gigmart.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, UUID> {
    Optional<WorkerProfile> findByUserId(UUID userId);
    List<WorkerProfile> findByVerificationStatus(VerificationStatus status);
}
