package com.labourmanagement.leave.service;

import com.labourmanagement.audit.service.AuditService;
import com.labourmanagement.common.enums.LeaveStatus;
import com.labourmanagement.common.exception.*;
import com.labourmanagement.labour.repository.LabourRepository;
import com.labourmanagement.leave.dto.*;
import com.labourmanagement.leave.entity.LeaveRequest;
import com.labourmanagement.leave.repository.LeaveRequestRepository;
import com.labourmanagement.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final LabourRepository labourRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    private LeaveResponse toResponse(LeaveRequest l) {
        return new LeaveResponse(l.getId(), l.getLabourId(), l.getLeaveType(),
                l.getStartDate(), l.getEndDate(), l.getReason(), l.getStatus());
    }

    @Transactional
    public LeaveResponse apply(String username, ApplyLeaveRequest req) {
        var labour = labourRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Labour profile not found"));
        if (req.endDate().isBefore(req.startDate())) throw new BadRequestException("End date must be after start date");
        LeaveRequest l = LeaveRequest.builder().labourId(labour.getId())
                .leaveType(req.leaveType()).startDate(req.startDate()).endDate(req.endDate())
                .reason(req.reason()).status(LeaveStatus.PENDING).build();
        l = leaveRepository.save(l);
        auditService.log("APPLY_LEAVE", "Leave", l.getId(), null, "labourId=" + labour.getId());
        return toResponse(l);
    }

    @Transactional(readOnly = true)
    public Page<LeaveResponse> myLeaves(String username, Pageable pageable) {
        var labour = labourRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Labour profile not found"));
        return leaveRepository.findByLabourId(labour.getId(), pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<LeaveResponse> pending(Pageable pageable) {
        return leaveRepository.findByStatus(LeaveStatus.PENDING, pageable).map(this::toResponse);
    }

    @Transactional
    public LeaveResponse decide(Long id, LeaveStatus decision, Long adminUserId) {
        LeaveRequest l = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found: " + id));
        if (l.getStatus() != LeaveStatus.PENDING) throw new BusinessException("Leave already decided", "LEAVE_ALREADY_DECIDED");
        if (decision != LeaveStatus.APPROVED && decision != LeaveStatus.REJECTED)
            throw new BadRequestException("Decision must be APPROVED or REJECTED");
        l.setStatus(decision);
        l.setApprovedBy(adminUserId);
        l.setApprovedAt(java.time.LocalDateTime.now());
        auditService.log("DECIDE_LEAVE", "Leave", id, "PENDING", decision.name());
        // Labour ko DB notification (Email/SMS baad me)
        labourRepository.findById(l.getLabourId()).ifPresent(lab ->
                        notificationService.notify(lab.getUser().getId(),
                                "Leave " + decision.name().toLowerCase(),
                                "Your leave " + l.getStartDate() + " to " + l.getEndDate() + " is " + decision.name(),
                                "LEAVE"));
        return toResponse(leaveRepository.save(l));
    }
}
