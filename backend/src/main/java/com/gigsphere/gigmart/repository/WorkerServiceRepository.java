package com.gigsphere.gigmart.repository;

import com.gigsphere.gigmart.entity.WorkerService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkerServiceRepository extends JpaRepository<WorkerService, UUID> {
    List<WorkerService> findByWorkerProfileId(UUID workerProfileId);
    List<WorkerService> findByCategoryId(UUID categoryId);
    Optional<WorkerService> findByWorkerProfileIdAndCategoryId(UUID workerProfileId, UUID categoryId);
    boolean existsByWorkerProfileIdAndCategoryId(UUID workerProfileId, UUID categoryId);
}
