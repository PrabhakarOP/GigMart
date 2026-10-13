package com.gigsphere.gigmart.controller;

import com.gigsphere.gigmart.dto.AddressRequest;
import com.gigsphere.gigmart.dto.AddressResponse;
import com.gigsphere.gigmart.dto.ApiResponse;
import com.gigsphere.gigmart.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(@Valid @RequestBody AddressRequest request) {
        AddressResponse response = addressService.addAddress(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Address added successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> getAddressById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(addressService.getAddressById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddressesByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(addressService.getAddressesByUserId(userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable UUID id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Address deleted successfully"));
    }
}
