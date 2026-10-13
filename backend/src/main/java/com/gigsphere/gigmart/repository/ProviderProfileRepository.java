package com.gigsphere.gigmart.repository;

import com.gigsphere.gigmart.entity.ProviderProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, UUID> {
    Optional<ProviderProfile> findByUserId(UUID userId);
}
