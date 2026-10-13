package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.CategoryRequest;
import com.gigsphere.gigmart.dto.CategoryResponse;
import com.gigsphere.gigmart.entity.ServiceCategory;
import com.gigsphere.gigmart.exception.ConflictException;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.ServiceCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final ServiceCategoryRepository categoryRepository;

    public CategoryService(ServiceCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Service category already exists: " + request.getName());
        }

        ServiceCategory category = new ServiceCategory(
                request.getName(),
                request.getIcon(),
                request.getIsActive() != null ? request.getIsActive() : true
        );

        ServiceCategory saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(Boolean activeOnly) {
        List<ServiceCategory> categories;
        if (Boolean.TRUE.equals(activeOnly)) {
            categories = categoryRepository.findByIsActiveTrue();
        } else {
            categories = categoryRepository.findAll();
        }
        return categories.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id) {
        return toResponse(getEntityById(id));
    }

    @Transactional(readOnly = true)
    public ServiceCategory getEntityById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        ServiceCategory category = getEntityById(id);

        if (request.getName() != null && !request.getName().equalsIgnoreCase(category.getName())) {
            if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
                throw new ConflictException("Category name already exists: " + request.getName());
            }
            category.setName(request.getName());
        }
        if (request.getIcon() != null) {
            category.setIcon(request.getIcon());
        }
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

        ServiceCategory updated = categoryRepository.save(category);
        return toResponse(updated);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        ServiceCategory category = getEntityById(id);
        categoryRepository.delete(category);
    }

    public CategoryResponse toResponse(ServiceCategory category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getIcon(),
                category.getIsActive()
        );
    }
}
