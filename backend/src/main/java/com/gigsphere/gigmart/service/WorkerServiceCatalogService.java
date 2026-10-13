package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.WorkerServiceRequest;
import com.gigsphere.gigmart.dto.WorkerServiceResponse;
import com.gigsphere.gigmart.entity.ServiceCategory;
import com.gigsphere.gigmart.entity.WorkerProfile;
import com.gigsphere.gigmart.entity.WorkerService;
import com.gigsphere.gigmart.exception.ConflictException;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.ServiceCategoryRepository;
import com.gigsphere.gigmart.repository.WorkerProfileRepository;
import com.gigsphere.gigmart.repository.WorkerServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkerServiceCatalogService {

    private final WorkerServiceRepository workerServiceRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final ServiceCategoryRepository categoryRepository;

    public WorkerServiceCatalogService(WorkerServiceRepository workerServiceRepository,
                                      WorkerProfileRepository workerProfileRepository,
                                      ServiceCategoryRepository categoryRepository) {
        this.workerServiceRepository = workerServiceRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public WorkerServiceResponse addServiceToWorker(WorkerServiceRequest request) {
        WorkerProfile workerProfile = workerProfileRepository.findById(request.getWorkerProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found: " + request.getWorkerProfileId()));

        ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()));

        if (workerServiceRepository.existsByWorkerProfileIdAndCategoryId(workerProfile.getId(), category.getId())) {
            throw new ConflictException("Worker already offers this service category");
        }

        WorkerService workerService = new WorkerService(
                workerProfile,
                category,
                request.getBaseRate(),
                request.getRateType()
        );

        WorkerService saved = workerServiceRepository.save(workerService);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<WorkerServiceResponse> getServicesByWorker(UUID workerProfileId) {
        return workerServiceRepository.findByWorkerProfileId(workerProfileId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkerServiceResponse> getWorkersByService(UUID categoryId) {
        return workerServiceRepository.findByCategoryId(categoryId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeWorkerService(UUID id) {
        WorkerService ws = workerServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker service entry not found: " + id));
        workerServiceRepository.delete(ws);
    }

    public WorkerServiceResponse toResponse(WorkerService ws) {
        return new WorkerServiceResponse(
                ws.getId(),
                ws.getWorkerProfile().getId(),
                ws.getCategory().getId(),
                ws.getCategory().getName(),
                ws.getBaseRate(),
                ws.getRateType()
        );
    }
}
