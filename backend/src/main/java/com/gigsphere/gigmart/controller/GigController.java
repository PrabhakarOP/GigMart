package com.gigsphere.gigmart.controller;

import com.gigsphere.gigmart.dto.ApiResponse;
import com.gigsphere.gigmart.dto.GigCreateRequest;
import com.gigsphere.gigmart.dto.GigResponse;
import com.gigsphere.gigmart.dto.GigUpdateRequest;
import com.gigsphere.gigmart.enums.GigStatus;
import com.gigsphere.gigmart.service.GigService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gigs")
public class GigController {

    private final GigService gigService;

    public GigController(GigService gigService) {
        this.gigService = gigService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GigResponse>> createGig(@Valid @RequestBody GigCreateRequest request) {
        GigResponse response = gigService.createGig(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Gig posted successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GigResponse>>> getAllGigs(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) GigStatus status,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.ok(gigService.getAllGigs(categoryId, status, keyword)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GigResponse>> getGigById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(gigService.getGigById(id)));
    }

    @GetMapping("/provider/{providerProfileId}")
    public ResponseEntity<ApiResponse<List<GigResponse>>> getGigsByProvider(@PathVariable UUID providerProfileId) {
        return ResponseEntity.ok(ApiResponse.ok(gigService.getGigsByProvider(providerProfileId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GigResponse>> updateGig(
            @PathVariable UUID id,
            @RequestBody GigUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(gigService.updateGig(id, request), "Gig updated successfully"));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<GigResponse>> cancelGig(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(gigService.cancelGig(id), "Gig cancelled successfully"));
    }
}
