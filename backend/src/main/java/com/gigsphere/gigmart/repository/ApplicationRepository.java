package com.gigsphere.gigmart.repository;

import com.gigsphere.gigmart.entity.Application;
import com.gigsphere.gigmart.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByGigId(UUID gigId);
    List<Application> findByWorkerProfileId(UUID workerProfileId);
    Optional<Application> findByGigIdAndWorkerProfileId(UUID gigId, UUID workerProfileId);
    boolean existsByGigIdAndWorkerProfileId(UUID gigId, UUID workerProfileId);
    List<Application> findByGigIdAndStatus(UUID gigId, ApplicationStatus status);
}
