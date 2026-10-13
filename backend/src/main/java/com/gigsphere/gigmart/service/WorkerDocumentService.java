package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.WorkerDocumentRequest;
import com.gigsphere.gigmart.dto.WorkerDocumentResponse;
import com.gigsphere.gigmart.entity.WorkerDocument;
import com.gigsphere.gigmart.entity.WorkerProfile;
import com.gigsphere.gigmart.enums.DocumentStatus;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.WorkerDocumentRepository;
import com.gigsphere.gigmart.repository.WorkerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkerDocumentService {

    private final WorkerDocumentRepository workerDocumentRepository;
    private final WorkerProfileRepository workerProfileRepository;

    public WorkerDocumentService(WorkerDocumentRepository workerDocumentRepository,
                                 WorkerProfileRepository workerProfileRepository) {
        this.workerDocumentRepository = workerDocumentRepository;
        this.workerProfileRepository = workerProfileRepository;
    }

    @Transactional
    public WorkerDocumentResponse uploadDocument(WorkerDocumentRequest request) {
        WorkerProfile workerProfile = workerProfileRepository.findById(request.getWorkerProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found: " + request.getWorkerProfileId()));

        WorkerDocument document = new WorkerDocument(
                workerProfile,
                request.getDocType(),
                request.getFileUrl(),
                DocumentStatus.PENDING
        );

        WorkerDocument saved = workerDocumentRepository.save(document);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<WorkerDocumentResponse> getDocumentsByWorker(UUID workerProfileId) {
        return workerDocumentRepository.findByWorkerProfileId(workerProfileId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkerDocumentResponse updateStatus(UUID documentId, DocumentStatus status) {
        WorkerDocument doc = workerDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker document not found: " + documentId));
        doc.setStatus(status);
        WorkerDocument updated = workerDocumentRepository.save(doc);
        return toResponse(updated);
    }

    public WorkerDocumentResponse toResponse(WorkerDocument doc) {
        return new WorkerDocumentResponse(
                doc.getId(),
                doc.getWorkerProfile().getId(),
                doc.getDocType(),
                doc.getFileUrl(),
                doc.getStatus()
        );
    }
}
