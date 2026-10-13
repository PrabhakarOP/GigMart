package com.gigsphere.gigmart.repository;

import com.gigsphere.gigmart.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, UUID> {
    Optional<ServiceCategory> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<ServiceCategory> findByIsActiveTrue();
}
