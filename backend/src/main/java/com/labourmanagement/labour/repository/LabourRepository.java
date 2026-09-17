package com.labourmanagement.labour.repository;

import com.labourmanagement.common.enums.LabourStatus;
import com.labourmanagement.labour.entity.Labour;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LabourRepository extends JpaRepository<Labour, Long> {

    Optional<Labour> findByEmployeeCode(String employeeCode);

    Optional<Labour> findByUserUsername(String username);

    Optional<Labour> findByUserId(Long userId);

    boolean existsByEmployeeCode(String employeeCode);

    @Query("SELECT l FROM Labour l WHERE " +
            "(:createdBy IS NULL OR l.createdBy = :createdBy) AND " +
            "(:status IS NULL OR l.status = :status) AND " +
            "(:search IS NULL OR LOWER(l.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(l.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(l.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Labour> search(@Param("createdBy") Long createdBy, @Param("search") String search, @Param("status") LabourStatus status, Pageable pageable);

    long countByCreatedBy(Long createdBy);

    long countByCreatedByAndStatus(Long createdBy, LabourStatus status);

    @Query("SELECT l.id FROM Labour l WHERE l.createdBy = :createdBy")
    List<Long> findIdsByCreatedBy(@Param("createdBy") Long createdBy);
}
