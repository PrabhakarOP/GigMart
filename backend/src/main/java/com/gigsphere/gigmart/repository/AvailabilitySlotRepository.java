package com.gigsphere.gigmart.repository;

import com.gigsphere.gigmart.entity.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, UUID> {
    List<AvailabilitySlot> findByWorkerProfileId(UUID workerProfileId);
    List<AvailabilitySlot> findByWorkerProfileIdAndDayOfWeek(UUID workerProfileId, Integer dayOfWeek);
}
