package com.gigsphere.gigmart.controller;

import com.gigsphere.gigmart.dto.ApiResponse;
import com.gigsphere.gigmart.dto.UserResponse;
import com.gigsphere.gigmart.enums.UserRole;
import com.gigsphere.gigmart.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(@RequestParam(required = false) UserRole role) {
        List<UserResponse> users = role != null ? userService.getUsersByRole(role) : userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<UserResponse>> verifyUser(@PathVariable UUID id) {
        UserResponse response = userService.verifyUser(id);
        return ResponseEntity.ok(ApiResponse.ok(response, "User verified successfully"));
    }
}
