package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.WorkerProfileCreateRequest;
import com.gigsphere.gigmart.dto.WorkerProfileResponse;
import com.gigsphere.gigmart.dto.WorkerProfileUpdateRequest;
import com.gigsphere.gigmart.entity.User;
import com.gigsphere.gigmart.entity.WorkerProfile;
import com.gigsphere.gigmart.enums.UserRole;
import com.gigsphere.gigmart.enums.VerificationStatus;
import com.gigsphere.gigmart.exception.BadRequestException;
import com.gigsphere.gigmart.exception.ConflictException;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.UserRepository;
import com.gigsphere.gigmart.repository.WorkerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkerProfileService {

    private final WorkerProfileRepository workerProfileRepository;
    private final UserRepository userRepository;

    public WorkerProfileService(WorkerProfileRepository workerProfileRepository, UserRepository userRepository) {
        this.workerProfileRepository = workerProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WorkerProfileResponse createProfile(WorkerProfileCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        if (user.getRole() != UserRole.WORKER) {
            throw new BadRequestException("User does not have the WORKER role");
        }

        if (workerProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new ConflictException("Worker profile already exists for user: " + request.getUserId());
        }

        WorkerProfile profile = new WorkerProfile();
        profile.setUser(user);
        profile.setBio(request.getBio());
        profile.setExperienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0);
        profile.setServiceRadiusKm(request.getServiceRadiusKm() != null ? request.getServiceRadiusKm() : 10);
        profile.setVerificationStatus(VerificationStatus.PENDING);
        profile.setAvgRating(0.0f);

        WorkerProfile saved = workerProfileRepository.save(profile);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public WorkerProfileResponse getProfileById(UUID id) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found with id: " + id));
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public WorkerProfileResponse getProfileByUserId(UUID userId) {
        WorkerProfile profile = workerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found for user: " + userId));
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public WorkerProfile getEntityById(UUID id) {
        return workerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found with id: " + id));
    }

    @Transactional
    public WorkerProfileResponse updateProfile(UUID id, WorkerProfileUpdateRequest request) {
        WorkerProfile profile = getEntityById(id);

        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getExperienceYears() != null) {
            profile.setExperienceYears(request.getExperienceYears());
        }
        if (request.getServiceRadiusKm() != null) {
            profile.setServiceRadiusKm(request.getServiceRadiusKm());
        }
        if (request.getVerificationStatus() != null) {
            profile.setVerificationStatus(request.getVerificationStatus());
        }

        WorkerProfile saved = workerProfileRepository.save(profile);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<WorkerProfileResponse> getAllWorkers() {
        return workerProfileRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkerProfileResponse> getWorkersByStatus(VerificationStatus status) {
        return workerProfileRepository.findByVerificationStatus(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public WorkerProfileResponse toResponse(WorkerProfile profile) {
        return new WorkerProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getUser().getFullName(),
                profile.getUser().getEmail(),
                profile.getUser().getPhone(),
                profile.getBio(),
                profile.getExperienceYears(),
                profile.getVerificationStatus(),
                profile.getAvgRating(),
                profile.getServiceRadiusKm()
        );
    }
}
