package com.gigsphere.gigmart.repository;

import com.gigsphere.gigmart.entity.Gig;
import com.gigsphere.gigmart.enums.GigStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GigRepository extends JpaRepository<Gig, UUID> {
    List<Gig> findByProviderProfileId(UUID providerProfileId);
    List<Gig> findByCategoryId(UUID categoryId);
    List<Gig> findByStatus(GigStatus status);
    List<Gig> findByCategoryIdAndStatus(UUID categoryId, GigStatus status);

    @Query("SELECT g FROM Gig g WHERE " +
           "(:status IS NULL OR g.status = :status) AND " +
           "(:categoryId IS NULL OR g.category.id = :categoryId) AND " +
           "(:keyword IS NULL OR LOWER(g.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Gig> searchGigs(@Param("status") GigStatus status,
                         @Param("categoryId") UUID categoryId,
                         @Param("keyword") String keyword);
}
