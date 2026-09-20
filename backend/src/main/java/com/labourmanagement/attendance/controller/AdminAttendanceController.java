package com.labourmanagement.attendance.controller;

import com.labourmanagement.attendance.dto.*;
import com.labourmanagement.attendance.service.AttendanceService;
import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.labour.dto.LabourResponse;
import com.labourmanagement.security.entity.User;
import com.labourmanagement.security.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/attendance")
@RequiredArgsConstructor
public class AdminAttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAuthority('ATTENDANCE_MARK')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> mark(@Valid @RequestBody MarkAttendanceRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Attendance marked", attendanceService.mark(req)));
    }

    @GetMapping("/labour/{labourId}")
    @PreAuthorize("hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<Page<AttendanceResponse>>> byLabour(
            @PathVariable Long labourId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Attendance fetched",
                attendanceService.byLabour(labourId, PageRequest.of(page, size, Sort.by("attendanceDate").descending()))));
    }

    @GetMapping("/labour/{labourId}/month")
    @PreAuthorize("hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<java.util.List<AttendanceResponse>>> byMonth(
            @PathVariable Long labourId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success("Monthly attendance fetched",
                attendanceService.monthly(labourId, year, month)));
    }

    @PostMapping("/toggle")
    @PreAuthorize("hasAuthority('ATTENDANCE_MARK')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> toggle(@Valid @RequestBody ToggleAttendanceRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Attendance toggled", attendanceService.toggle(req)));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<java.util.List<AttendanceSummaryResponse>>> summary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam int year,
            @RequestParam int month) {
        Long adminId = userRepository.findByUsername(userDetails.getUsername()).map(User::getId).orElse(null);
        return ResponseEntity.ok(ApiResponse.success("Monthly summary fetched",
                attendanceService.monthlySummaryForAdmin(year, month, adminId)));
    }

    @GetMapping("/today-present")
    @PreAuthorize("hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<java.util.List<LabourResponse>>> todayPresent(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = userRepository.findByUsername(userDetails.getUsername()).map(User::getId).orElse(null);
        return ResponseEntity.ok(ApiResponse.success("Today's present labours",
                attendanceService.todayPresent(adminId)));
    }

    @GetMapping("/month")
    @PreAuthorize("hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<java.util.List<AttendanceResponse>>> allMonthly(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success("Monthly register fetched",
                attendanceService.allMonthly(year, month)));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAuthority('ATTENDANCE_MARK')")
    public ResponseEntity<ApiResponse<java.util.List<AttendanceResponse>>> bulk(
            @Valid @RequestBody BulkToggleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Attendance saved",
                attendanceService.bulkToggle(request.items())));
    }
}
