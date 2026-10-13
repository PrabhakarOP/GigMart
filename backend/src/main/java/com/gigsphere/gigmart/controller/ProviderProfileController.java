package com.gigsphere.gigmart.controller;

import com.gigsphere.gigmart.dto.ApiResponse;
import com.gigsphere.gigmart.dto.ProviderProfileCreateRequest;
import com.gigsphere.gigmart.dto.ProviderProfileResponse;
import com.gigsphere.gigmart.dto.ProviderProfileUpdateRequest;
import com.gigsphere.gigmart.service.ProviderProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/providers")
public class ProviderProfileController {

    private final ProviderProfileService providerProfileService;

    public ProviderProfileController(ProviderProfileService providerProfileService) {
        this.providerProfileService = providerProfileService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProviderProfileResponse>> createProfile(@Valid @RequestBody ProviderProfileCreateRequest request) {
        ProviderProfileResponse response = providerProfileService.createProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Provider profile created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProviderProfileResponse>> getProfileById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(providerProfileService.getProfileById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<ProviderProfileResponse>> getProfileByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(providerProfileService.getProfileByUserId(userId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProviderProfileResponse>>> getAllProviders() {
        return ResponseEntity.ok(ApiResponse.ok(providerProfileService.getAllProviders()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProviderProfileResponse>> updateProfile(
            @PathVariable UUID id,
            @RequestBody ProviderProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(providerProfileService.updateProfile(id, request), "Provider profile updated"));
    }
}
