package com.labourmanagement.leave.repository;

import com.labourmanagement.common.enums.LeaveStatus;
import com.labourmanagement.leave.entity.LeaveRequest;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    Page<LeaveRequest> findByLabourId(Long labourId, Pageable pageable);

    Page<LeaveRequest> findByStatus(LeaveStatus status, Pageable pageable);

    long countByStatus(LeaveStatus status);
}
