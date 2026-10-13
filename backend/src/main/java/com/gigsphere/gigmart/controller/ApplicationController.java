package com.gigsphere.gigmart.controller;

import com.gigsphere.gigmart.dto.ApiResponse;
import com.gigsphere.gigmart.dto.ApplicationCreateRequest;
import com.gigsphere.gigmart.dto.ApplicationResponse;
import com.gigsphere.gigmart.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ApplicationResponse>> applyForGig(@Valid @RequestBody ApplicationCreateRequest request) {
        ApplicationResponse response = applicationService.applyForGig(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Application submitted successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplicationById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplicationById(id)));
    }

    @GetMapping("/gig/{gigId}")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getApplicationsByGig(@PathVariable UUID gigId) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplicationsByGig(gigId)));
    }

    @GetMapping("/worker/{workerProfileId}")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getApplicationsByWorker(@PathVariable UUID workerProfileId) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplicationsByWorker(workerProfileId)));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<ApiResponse<ApplicationResponse>> withdrawApplication(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.withdrawApplication(id), "Application withdrawn successfully"));
    }
}
