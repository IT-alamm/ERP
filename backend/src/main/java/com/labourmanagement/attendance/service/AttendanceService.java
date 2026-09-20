package com.labourmanagement.attendance.service;

import com.labourmanagement.attendance.dto.*;
import com.labourmanagement.attendance.entity.Attendance;
import com.labourmanagement.attendance.repository.AttendanceRepository;
import com.labourmanagement.audit.service.AuditService;
import com.labourmanagement.common.enums.AttendanceStatus;
import com.labourmanagement.common.exception.*;
import com.labourmanagement.labour.dto.LabourResponse;
import com.labourmanagement.labour.entity.Labour;
import com.labourmanagement.labour.mapper.LabourMapper;
import com.labourmanagement.labour.repository.LabourRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final LabourRepository labourRepository;
    private final LabourMapper labourMapper;
    private final AuditService auditService;

    private AttendanceResponse toResponse(Attendance a) {
        return new AttendanceResponse(a.getId(), a.getLabourId(), a.getAttendanceDate(),
                a.getCheckIn(), a.getCheckOut(), a.getStatus(),
                a.getWorkingHours(), a.getOvertimeHours(), a.getRemarks());
    }

    private void validateMarkableDate(Labour labour, LocalDate date) {
        if (date == null) {
            throw new BadRequestException("Attendance date is required");
        }
        LocalDate today = LocalDate.now();
        if (date.isAfter(today)) {
            throw new BadRequestException("Future date par attendance mark nahi ho sakti: " + date);
        }
        if (labour.getJoiningDate() != null && date.isBefore(labour.getJoiningDate())) {
            throw new BadRequestException("Joining date (" + labour.getJoiningDate()
                    + ") se pehle attendance mark nahi ho sakti");
        }
    }

    @Transactional
    public AttendanceResponse mark(MarkAttendanceRequest req) {
        Labour labour = labourRepository.findById(req.labourId())
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found: " + req.labourId()));
        validateMarkableDate(labour, req.attendanceDate());
        if (attendanceRepository.findByLabourIdAndAttendanceDate(req.labourId(), req.attendanceDate()).isPresent()) {
            throw new DuplicateResourceException("Attendance already marked for this date");
        }
        Attendance a = Attendance.builder()
                .labourId(req.labourId()).attendanceDate(req.attendanceDate())
                .checkIn(req.checkIn()).checkOut(req.checkOut())
                .status(req.status() != null ? req.status() : AttendanceStatus.PRESENT)
                .overtimeHours(req.overtimeHours() != null ? req.overtimeHours() : BigDecimal.ZERO)
                .remarks(req.remarks()).build();

        if (a.getCheckIn() != null && a.getCheckOut() != null) {
            long minutes = Duration.between(a.getCheckIn(), a.getCheckOut()).toMinutes();
            a.setWorkingHours(BigDecimal.valueOf(minutes / 60.0));
        }
        a = attendanceRepository.save(a);
        log.info("Attendance marked labourId={} date={}", req.labourId(), req.attendanceDate());
        auditService.log("MARK_ATTENDANCE", "Attendance", a.getId(), null,
                "labourId=" + req.labourId() + " date=" + req.attendanceDate());
        return toResponse(a);
    }

    @Transactional(readOnly = true)
    public Page<AttendanceResponse> byLabour(Long labourId, Pageable pageable) {
        return attendanceRepository.findByLabourId(labourId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> monthly(Long labourId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return attendanceRepository.findByLabourIdAndAttendanceDateBetween(labourId, start, end)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> allMonthly(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return attendanceRepository.findByAttendanceDateBetween(start, end)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<AttendanceResponse> bulkToggle(List<ToggleAttendanceRequest> items) {
        return items.stream().map(this::toggle).toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceSummaryResponse> monthlySummary(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        var rows = attendanceRepository.countByMonthGrouped(start, end);
        var byLabour = new java.util.HashMap<Long, long[]>();
        for (Object[] r : rows) {
            Long labourId = (Long) r[0];
            AttendanceStatus status = (AttendanceStatus) r[1];
            long count = (Long) r[2];
            long[] c = byLabour.computeIfAbsent(labourId, k -> new long[3]);
            if (status == AttendanceStatus.PRESENT) c[0] = count;
            else if (status == AttendanceStatus.ABSENT) c[1] = count;
            c[2] += count;
        }
        return byLabour.entrySet().stream()
                .map(e -> new AttendanceSummaryResponse(e.getKey(), e.getValue()[0], e.getValue()[1], e.getValue()[2]))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceSummaryResponse> monthlySummaryForAdmin(int year, int month, Long createdBy) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        var rows = attendanceRepository.countByMonthGroupedForAdmin(start, end, createdBy);
        var byLabour = new java.util.HashMap<Long, long[]>();
        for (Object[] r : rows) {
            Long labourId = (Long) r[0];
            AttendanceStatus status = (AttendanceStatus) r[1];
            long count = (Long) r[2];
            long[] c = byLabour.computeIfAbsent(labourId, k -> new long[3]);
            if (status == AttendanceStatus.PRESENT) c[0] = count;
            else if (status == AttendanceStatus.ABSENT) c[1] = count;
            c[2] += count;
        }
        return byLabour.entrySet().stream()
                .map(e -> new AttendanceSummaryResponse(e.getKey(), e.getValue()[0], e.getValue()[1], e.getValue()[2]))
                .toList();
    }

    @Transactional
    public AttendanceResponse toggle(ToggleAttendanceRequest req) {
        Labour labour = labourRepository.findById(req.labourId())
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found: " + req.labourId()));
        validateMarkableDate(labour, req.attendanceDate());
        var existing = attendanceRepository.findByLabourIdAndAttendanceDate(req.labourId(), req.attendanceDate());
        if (existing.isPresent()) {
            Attendance a = existing.get();
            AttendanceStatus next = req.status() != null ? req.status()
                    : (a.getStatus() == AttendanceStatus.PRESENT ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT);
            a.setStatus(next);
            if (next == AttendanceStatus.PRESENT) {
                if (a.getCheckIn() == null) a.setCheckIn(LocalTime.of(9, 0));
                if (a.getCheckOut() == null) a.setCheckOut(LocalTime.of(18, 0));
            } else {
                a.setCheckIn(null);
                a.setCheckOut(null);
            }
            if (a.getCheckIn() != null && a.getCheckOut() != null) {
                long minutes = Duration.between(a.getCheckIn(), a.getCheckOut()).toMinutes();
                a.setWorkingHours(BigDecimal.valueOf(minutes / 60.0));
            } else {
                a.setWorkingHours(null);
            }
            a = attendanceRepository.save(a);
            log.info("Attendance toggled labourId={} date={} status={}", req.labourId(), req.attendanceDate(), next);
            auditService.log("TOGGLE_ATTENDANCE", "Attendance", a.getId(), null,
                    "labourId=" + req.labourId() + " date=" + req.attendanceDate() + " status=" + next);
            return toResponse(a);
        }
        AttendanceStatus status = req.status() != null ? req.status() : AttendanceStatus.PRESENT;
        Attendance a = Attendance.builder()
                .labourId(req.labourId()).attendanceDate(req.attendanceDate())
                .checkIn(status == AttendanceStatus.PRESENT ? LocalTime.of(9, 0) : null)
                .checkOut(status == AttendanceStatus.PRESENT ? LocalTime.of(18, 0) : null)
                .status(status)
                .overtimeHours(BigDecimal.ZERO).build();
        if (a.getCheckIn() != null && a.getCheckOut() != null) {
            long minutes = Duration.between(a.getCheckIn(), a.getCheckOut()).toMinutes();
            a.setWorkingHours(BigDecimal.valueOf(minutes / 60.0));
        }
        a = attendanceRepository.save(a);
        log.info("Attendance marked via toggle labourId={} date={} status={}", req.labourId(), req.attendanceDate(), status);
        auditService.log("MARK_ATTENDANCE", "Attendance", a.getId(), null,
                "labourId=" + req.labourId() + " date=" + req.attendanceDate());
        return toResponse(a);
    }

    @Transactional(readOnly = true)
    public Page<AttendanceResponse> myAttendance(String username, Pageable pageable) {
        var labour = labourRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Labour profile not found"));
        return byLabour(labour.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public List<LabourResponse> todayPresent(Long adminId) {
        // Sirf is admin ke labours me se aaj present - dusre admin ka data nahi.
        List<Long> ownIds = adminId == null ? List.of() : labourRepository.findIdsByCreatedBy(adminId);
        if (ownIds.isEmpty()) {
            return List.of();
        }
        List<Long> presentIds = attendanceRepository
                .findByAttendanceDateAndStatus(LocalDate.now(), AttendanceStatus.PRESENT)
                .stream().map(Attendance::getLabourId).filter(ownIds::contains).distinct().toList();
        if (presentIds.isEmpty()) {
            return List.of();
        }
        return labourRepository.findAllById(presentIds).stream().map(labourMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> myMonthly(String username, int year, int month) {
        var labour = labourRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Labour profile not found"));
        return monthly(labour.getId(), year, month);
    }
}
