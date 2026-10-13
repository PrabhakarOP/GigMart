package com.gigsphere.gigmart.repository;

import com.gigsphere.gigmart.entity.WorkerDocument;
import com.gigsphere.gigmart.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkerDocumentRepository extends JpaRepository<WorkerDocument, UUID> {
    List<WorkerDocument> findByWorkerProfileId(UUID workerProfileId);
    List<WorkerDocument> findByStatus(DocumentStatus status);
}
