package com.gigsphere.gigmart.controller;

import com.gigsphere.gigmart.dto.ApiResponse;
import com.gigsphere.gigmart.dto.MessageCreateRequest;
import com.gigsphere.gigmart.dto.MessageResponse;
import com.gigsphere.gigmart.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(@Valid @RequestBody MessageCreateRequest request) {
        MessageResponse response = messageService.sendMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Message sent successfully"));
    }

    @GetMapping("/gig/{gigId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessagesByGig(@PathVariable UUID gigId) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.getMessagesByGig(gigId)));
    }
}
