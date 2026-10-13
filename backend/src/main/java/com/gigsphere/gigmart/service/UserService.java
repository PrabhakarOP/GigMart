package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.UserLoginRequest;
import com.gigsphere.gigmart.dto.UserRegisterRequest;
import com.gigsphere.gigmart.dto.UserResponse;
import com.gigsphere.gigmart.entity.ProviderProfile;
import com.gigsphere.gigmart.entity.User;
import com.gigsphere.gigmart.entity.WorkerProfile;
import com.gigsphere.gigmart.enums.ProviderType;
import com.gigsphere.gigmart.enums.UserRole;
import com.gigsphere.gigmart.enums.VerificationStatus;
import com.gigsphere.gigmart.exception.BadRequestException;
import com.gigsphere.gigmart.exception.ConflictException;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.ProviderProfileRepository;
import com.gigsphere.gigmart.repository.UserRepository;
import com.gigsphere.gigmart.repository.WorkerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final ProviderProfileRepository providerProfileRepository;

    public UserService(UserRepository userRepository,
                       WorkerProfileRepository workerProfileRepository,
                       ProviderProfileRepository providerProfileRepository) {
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.providerProfileRepository = providerProfileRepository;
    }

    @Transactional
    public UserResponse register(UserRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered: " + request.getEmail());
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone number is already registered: " + request.getPhone());
        }

        String passwordHash = hashPassword(request.getPassword());
        User user = new User(
                request.getFullName(),
                request.getEmail(),
                request.getPhone(),
                passwordHash,
                request.getRole()
        );

        User savedUser = userRepository.save(user);

        // Auto-initialize profile based on role
        if (request.getRole() == UserRole.WORKER) {
            WorkerProfile workerProfile = new WorkerProfile();
            workerProfile.setUser(savedUser);
            workerProfile.setVerificationStatus(VerificationStatus.PENDING);
            workerProfile.setAvgRating(0.0f);
            workerProfile.setExperienceYears(0);
            workerProfile.setServiceRadiusKm(15);
            workerProfileRepository.save(workerProfile);
        } else if (request.getRole() == UserRole.PROVIDER) {
            ProviderProfile providerProfile = new ProviderProfile();
            providerProfile.setUser(savedUser);
            providerProfile.setProviderType(ProviderType.INDIVIDUAL);
            providerProfile.setAvgRating(0.0f);
            providerProfileRepository.save(providerProfile);
        }

        return toResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponse login(UserLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        String hash = hashPassword(request.getPassword());
        if (!user.getPasswordHash().equals(hash)) {
            throw new BadRequestException("Invalid email or password");
        }

        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public User getEntityById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse verifyUser(UUID id) {
        User user = getEntityById(id);
        user.setVerified(true);
        User updated = userRepository.save(user);
        return toResponse(updated);
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isVerified(),
                user.getCreatedAt()
        );
    }

    private String hashPassword(String rawPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encoded);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
