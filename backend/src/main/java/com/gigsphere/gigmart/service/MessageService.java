package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.MessageCreateRequest;
import com.gigsphere.gigmart.dto.MessageResponse;
import com.gigsphere.gigmart.entity.Gig;
import com.gigsphere.gigmart.entity.Message;
import com.gigsphere.gigmart.entity.User;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.GigRepository;
import com.gigsphere.gigmart.repository.MessageRepository;
import com.gigsphere.gigmart.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final GigRepository gigRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository,
                          GigRepository gigRepository,
                          UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.gigRepository = gigRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public MessageResponse sendMessage(MessageCreateRequest request) {
        Gig gig = gigRepository.findById(request.getGigId())
                .orElseThrow(() -> new ResourceNotFoundException("Gig not found: " + request.getGigId()));

        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new ResourceNotFoundException("Sender user not found: " + request.getSenderId()));

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver user not found: " + request.getReceiverId()));

        Message message = new Message(gig, sender, receiver, request.getBody());
        message.setSentAt(LocalDateTime.now());

        Message saved = messageRepository.save(message);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessagesByGig(UUID gigId) {
        return messageRepository.findByGigIdOrderBySentAtAsc(gigId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MessageResponse toResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getGig().getId(),
                message.getSender().getId(),
                message.getSender().getFullName(),
                message.getReceiver().getId(),
                message.getReceiver().getFullName(),
                message.getBody(),
                message.getSentAt()
        );
    }
}
