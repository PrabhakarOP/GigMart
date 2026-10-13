package com.gigsphere.gigmart.service;

import com.gigsphere.gigmart.dto.AvailabilitySlotRequest;
import com.gigsphere.gigmart.dto.AvailabilitySlotResponse;
import com.gigsphere.gigmart.entity.AvailabilitySlot;
import com.gigsphere.gigmart.entity.WorkerProfile;
import com.gigsphere.gigmart.exception.BadRequestException;
import com.gigsphere.gigmart.exception.ResourceNotFoundException;
import com.gigsphere.gigmart.repository.AvailabilitySlotRepository;
import com.gigsphere.gigmart.repository.WorkerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AvailabilitySlotService {

    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final WorkerProfileRepository workerProfileRepository;

    public AvailabilitySlotService(AvailabilitySlotRepository availabilitySlotRepository,
                                  WorkerProfileRepository workerProfileRepository) {
        this.availabilitySlotRepository = availabilitySlotRepository;
        this.workerProfileRepository = workerProfileRepository;
    }

    @Transactional
    public AvailabilitySlotResponse addSlot(AvailabilitySlotRequest request) {
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        WorkerProfile workerProfile = workerProfileRepository.findById(request.getWorkerProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found: " + request.getWorkerProfileId()));

        AvailabilitySlot slot = new AvailabilitySlot(
                workerProfile,
                request.getDayOfWeek(),
                request.getStartTime(),
                request.getEndTime()
        );

        AvailabilitySlot saved = availabilitySlotRepository.save(slot);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AvailabilitySlotResponse> getSlotsByWorker(UUID workerProfileId) {
        return availabilitySlotRepository.findByWorkerProfileId(workerProfileId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSlot(UUID slotId) {
        AvailabilitySlot slot = availabilitySlotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Availability slot not found: " + slotId));
        availabilitySlotRepository.delete(slot);
    }

    public AvailabilitySlotResponse toResponse(AvailabilitySlot slot) {
        return new AvailabilitySlotResponse(
                slot.getId(),
                slot.getWorkerProfile().getId(),
                slot.getDayOfWeek(),
                slot.getStartTime(),
                slot.getEndTime()
        );
    }
}
