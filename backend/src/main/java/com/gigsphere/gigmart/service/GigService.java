package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.GigCreateRequest;
import com.gigsphere.gigmart.dto.GigResponse;
import com.gigsphere.gigmart.dto.GigUpdateRequest;
import com.gigsphere.gigmart.entity.Address;
import com.gigsphere.gigmart.entity.Gig;
import com.gigsphere.gigmart.entity.ProviderProfile;
import com.gigsphere.gigmart.entity.ServiceCategory;
import com.gigsphere.gigmart.enums.GigStatus;
import com.gigsphere.gigmart.exception.BadRequestException;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.AddressRepository;
import com.gigsphere.gigmart.repository.GigRepository;
import com.gigsphere.gigmart.repository.ProviderProfileRepository;
import com.gigsphere.gigmart.repository.ServiceCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GigService {

    private final GigRepository gigRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final AddressRepository addressRepository;

    public GigService(GigRepository gigRepository,
                      ProviderProfileRepository providerProfileRepository,
                      ServiceCategoryRepository categoryRepository,
                      AddressRepository addressRepository) {
        this.gigRepository = gigRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.categoryRepository = categoryRepository;
        this.addressRepository = addressRepository;
    }

    @Transactional
    public GigResponse createGig(GigCreateRequest request) {
        ProviderProfile provider = providerProfileRepository.findById(request.getProviderProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found: " + request.getProviderProfileId()));

        ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()));

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + request.getAddressId()));

        Gig gig = new Gig();
        gig.setProviderProfile(provider);
        gig.setCategory(category);
        gig.setAddress(address);
        gig.setTitle(request.getTitle());
        gig.setDescription(request.getDescription());
        gig.setBudget(request.getBudget());
        gig.setScheduledAt(request.getScheduledAt());
        gig.setStatus(GigStatus.OPEN);

        Gig saved = gigRepository.save(gig);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public GigResponse getGigById(UUID id) {
        return toResponse(getEntityById(id));
    }

    @Transactional(readOnly = true)
    public Gig getEntityById(UUID id) {
        return gigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<GigResponse> getAllGigs(UUID categoryId, GigStatus status, String keyword) {
        List<Gig> gigs = gigRepository.searchGigs(status, categoryId, keyword);
        return gigs.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GigResponse> getGigsByProvider(UUID providerProfileId) {
        return gigRepository.findByProviderProfileId(providerProfileId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GigResponse updateGig(UUID id, GigUpdateRequest request) {
        Gig gig = getEntityById(id);

        if (gig.getStatus() == GigStatus.COMPLETED || gig.getStatus() == GigStatus.CANCELLED) {
            throw new BadRequestException("Cannot update gig with status: " + gig.getStatus());
        }

        if (request.getTitle() != null) {
            gig.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            gig.setDescription(request.getDescription());
        }
        if (request.getBudget() != null) {
            gig.setBudget(request.getBudget());
        }
        if (request.getScheduledAt() != null) {
            gig.setScheduledAt(request.getScheduledAt());
        }
        if (request.getStatus() != null) {
            gig.setStatus(request.getStatus());
        }

        Gig updated = gigRepository.save(gig);
        return toResponse(updated);
    }

    @Transactional
    public GigResponse cancelGig(UUID id) {
        Gig gig = getEntityById(id);
        if (gig.getStatus() == GigStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed gig");
        }
        gig.setStatus(GigStatus.CANCELLED);
        Gig updated = gigRepository.save(gig);
        return toResponse(updated);
    }

    public GigResponse toResponse(Gig gig) {
        String addressSummary = gig.getAddress() != null
                ? gig.getAddress().getLine1() + ", " + gig.getAddress().getCity() + " - " + gig.getAddress().getPincode()
                : "";

        String providerName = gig.getProviderProfile() != null && gig.getProviderProfile().getUser() != null
                ? gig.getProviderProfile().getUser().getFullName()
                : "";

        return new GigResponse(
                gig.getId(),
                gig.getProviderProfile().getId(),
                providerName,
                gig.getCategory().getId(),
                gig.getCategory().getName(),
                gig.getAddress().getId(),
                addressSummary,
                gig.getTitle(),
                gig.getDescription(),
                gig.getBudget(),
                gig.getScheduledAt(),
                gig.getStatus(),
                gig.getApplications() != null ? gig.getApplications().size() : 0
        );
    }
}
