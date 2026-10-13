package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.AddressRequest;
import com.gigsphere.gigmart.dto.AddressResponse;
import com.gigsphere.gigmart.entity.Address;
import com.gigsphere.gigmart.entity.User;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.AddressRepository;
import com.gigsphere.gigmart.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AddressResponse addAddress(AddressRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        Address address = new Address(
                user,
                request.getLine1(),
                request.getCity(),
                request.getPincode(),
                request.getLatitude(),
                request.getLongitude()
        );

        Address saved = addressRepository.save(address);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getAddressesByUserId(UUID userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AddressResponse getAddressById(UUID id) {
        Address address = getEntityById(id);
        return toResponse(address);
    }

    @Transactional(readOnly = true)
    public Address getEntityById(UUID id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
    }

    @Transactional
    public void deleteAddress(UUID id) {
        Address address = getEntityById(id);
        addressRepository.delete(address);
    }

    public AddressResponse toResponse(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getUser().getId(),
                address.getLine1(),
                address.getCity(),
                address.getPincode(),
                address.getLatitude(),
                address.getLongitude()
        );
    }
}
