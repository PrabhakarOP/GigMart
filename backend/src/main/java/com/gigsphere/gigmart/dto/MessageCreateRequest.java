package com.gigsphere.gigmart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class MessageCreateRequest {

    @NotNull(message = "Gig ID is required")
    private UUID gigId;

    @NotNull(message = "Sender User ID is required")
    private UUID senderId;

    @NotNull(message = "Receiver User ID is required")
    private UUID receiverId;

    @NotBlank(message = "Message body cannot be empty")
    private String body;

    public MessageCreateRequest() {
    }

    public UUID getGigId() {
        return gigId;
    }

    public void setGigId(UUID gigId) {
        this.gigId = gigId;
    }

    public UUID getSenderId() {
        return senderId;
    }

    public void setSenderId(UUID senderId) {
        this.senderId = senderId;
    }

    public UUID getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(UUID receiverId) {
        this.receiverId = receiverId;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
}
