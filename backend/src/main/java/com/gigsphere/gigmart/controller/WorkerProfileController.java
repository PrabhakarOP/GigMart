package com.gigsphere.gigmart.controller;

import com.gigsphere.gigmart.dto.*;
import com.gigsphere.gigmart.enums.DocumentStatus;
import com.gigsphere.gigmart.enums.VerificationStatus;
import com.gigsphere.gigmart.service.AvailabilitySlotService;
import com.gigsphere.gigmart.service.WorkerDocumentService;
import com.gigsphere.gigmart.service.WorkerProfileService;
import com.gigsphere.gigmart.service.WorkerServiceCatalogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workers")
public class WorkerProfileController {

    private final WorkerProfileService workerProfileService;
    private final WorkerServiceCatalogService workerServiceCatalogService;
    private final WorkerDocumentService workerDocumentService;
    private final AvailabilitySlotService availabilitySlotService;

    public WorkerProfileController(WorkerProfileService workerProfileService,
                                   WorkerServiceCatalogService workerServiceCatalogService,
                                   WorkerDocumentService workerDocumentService,
                                   AvailabilitySlotService availabilitySlotService) {
        this.workerProfileService = workerProfileService;
        this.workerServiceCatalogService = workerServiceCatalogService;
        this.workerDocumentService = workerDocumentService;
        this.availabilitySlotService = availabilitySlotService;
    }

    // Profiles
    @PostMapping
    public ResponseEntity<ApiResponse<WorkerProfileResponse>> createProfile(@Valid @RequestBody WorkerProfileCreateRequest request) {
        WorkerProfileResponse response = workerProfileService.createProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Worker profile created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkerProfileResponse>> getProfileById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(workerProfileService.getProfileById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<WorkerProfileResponse>> getProfileByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(workerProfileService.getProfileByUserId(userId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkerProfileResponse>>> getAllWorkers(
            @RequestParam(required = false) VerificationStatus status) {
        List<WorkerProfileResponse> list = status != null
                ? workerProfileService.getWorkersByStatus(status)
                : workerProfileService.getAllWorkers();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkerProfileResponse>> updateProfile(
            @PathVariable UUID id,
            @RequestBody WorkerProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(workerProfileService.updateProfile(id, request), "Worker profile updated"));
    }

    // Services
    @PostMapping("/services")
    public ResponseEntity<ApiResponse<WorkerServiceResponse>> addService(@Valid @RequestBody WorkerServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(workerServiceCatalogService.addServiceToWorker(request), "Service added to worker"));
    }

    @GetMapping("/{id}/services")
    public ResponseEntity<ApiResponse<List<WorkerServiceResponse>>> getWorkerServices(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(workerServiceCatalogService.getServicesByWorker(id)));
    }

    @DeleteMapping("/services/{serviceId}")
    public ResponseEntity<ApiResponse<Void>> removeWorkerService(@PathVariable UUID serviceId) {
        workerServiceCatalogService.removeWorkerService(serviceId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Worker service deleted successfully"));
    }

    // Documents
    @PostMapping("/documents")
    public ResponseEntity<ApiResponse<WorkerDocumentResponse>> uploadDocument(@Valid @RequestBody WorkerDocumentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(workerDocumentService.uploadDocument(request), "Document uploaded"));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<ApiResponse<List<WorkerDocumentResponse>>> getWorkerDocuments(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(workerDocumentService.getDocumentsByWorker(id)));
    }

    @PutMapping("/documents/{documentId}/status")
    public ResponseEntity<ApiResponse<WorkerDocumentResponse>> updateDocumentStatus(
            @PathVariable UUID documentId,
            @RequestParam DocumentStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(workerDocumentService.updateStatus(documentId, status), "Document status updated"));
    }

    // Availability Slots
    @PostMapping("/slots")
    public ResponseEntity<ApiResponse<AvailabilitySlotResponse>> addSlot(@Valid @RequestBody AvailabilitySlotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(availabilitySlotService.addSlot(request), "Slot added"));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<ApiResponse<List<AvailabilitySlotResponse>>> getWorkerSlots(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(availabilitySlotService.getSlotsByWorker(id)));
    }

    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(@PathVariable UUID slotId) {
        availabilitySlotService.deleteSlot(slotId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Availability slot deleted"));
    }
}
