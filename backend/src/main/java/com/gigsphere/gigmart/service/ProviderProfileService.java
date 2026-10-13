package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.ProviderProfileCreateRequest;
import com.gigsphere.gigmart.dto.ProviderProfileResponse;
import com.gigsphere.gigmart.dto.ProviderProfileUpdateRequest;
import com.gigsphere.gigmart.entity.ProviderProfile;
import com.gigsphere.gigmart.entity.User;
import com.gigsphere.gigmart.enums.ProviderType;
import com.gigsphere.gigmart.enums.UserRole;
import com.gigsphere.gigmart.exception.BadRequestException;
import com.gigsphere.gigmart.exception.ConflictException;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.ProviderProfileRepository;
import com.gigsphere.gigmart.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProviderProfileService {

    private final ProviderProfileRepository providerProfileRepository;
    private final UserRepository userRepository;

    public ProviderProfileService(ProviderProfileRepository providerProfileRepository, UserRepository userRepository) {
        this.providerProfileRepository = providerProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProviderProfileResponse createProfile(ProviderProfileCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        if (user.getRole() != UserRole.PROVIDER) {
            throw new BadRequestException("User does not have the PROVIDER role");
        }

        if (providerProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new ConflictException("Provider profile already exists for user: " + request.getUserId());
        }

        ProviderProfile profile = new ProviderProfile();
        profile.setUser(user);
        profile.setProviderType(request.getProviderType() != null ? request.getProviderType() : ProviderType.INDIVIDUAL);
        profile.setBusinessName(request.getBusinessName());
        profile.setAvgRating(0.0f);

        ProviderProfile saved = providerProfileRepository.save(profile);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ProviderProfileResponse getProfileById(UUID id) {
        ProviderProfile profile = providerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found with id: " + id));
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public ProviderProfileResponse getProfileByUserId(UUID userId) {
        ProviderProfile profile = providerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for user: " + userId));
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public ProviderProfile getEntityById(UUID id) {
        return providerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found with id: " + id));
    }

    @Transactional
    public ProviderProfileResponse updateProfile(UUID id, ProviderProfileUpdateRequest request) {
        ProviderProfile profile = getEntityById(id);

        if (request.getProviderType() != null) {
            profile.setProviderType(request.getProviderType());
        }
        if (request.getBusinessName() != null) {
            profile.setBusinessName(request.getBusinessName());
        }

        ProviderProfile saved = providerProfileRepository.save(profile);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProviderProfileResponse> getAllProviders() {
        return providerProfileRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProviderProfileResponse toResponse(ProviderProfile profile) {
        return new ProviderProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getUser().getFullName(),
                profile.getUser().getEmail(),
                profile.getUser().getPhone(),
                profile.getProviderType(),
                profile.getBusinessName(),
                profile.getAvgRating()
        );
    }
}
