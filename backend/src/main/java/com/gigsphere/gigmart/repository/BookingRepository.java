package com.gigsphere.gigmart.repository;

import com.gigsphere.gigmart.entity.Booking;
import com.gigsphere.gigmart.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Optional<Booking> findByGigId(UUID gigId);
    Optional<Booking> findByApplicationId(UUID applicationId);
    List<Booking> findByStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.gig.providerProfile.id = :providerProfileId")
    List<Booking> findByProviderProfileId(@Param("providerProfileId") UUID providerProfileId);

    @Query("SELECT b FROM Booking b WHERE b.application.workerProfile.id = :workerProfileId")
    List<Booking> findByWorkerProfileId(@Param("workerProfileId") UUID workerProfileId);
}
