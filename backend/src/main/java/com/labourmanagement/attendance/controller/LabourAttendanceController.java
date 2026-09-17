package com.labourmanagement.attendance.controller;

import com.labourmanagement.attendance.dto.AttendanceResponse;
import com.labourmanagement.attendance.service.AttendanceService;
import com.labourmanagement.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/labour/attendance")
@RequiredArgsConstructor
public class LabourAttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AttendanceResponse>>> mine(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Attendance fetched",
                attendanceService.myAttendance(user.getUsername(),
                        PageRequest.of(page, size, Sort.by("attendanceDate").descending()))));
    }

    @GetMapping("/month")
    public ResponseEntity<ApiResponse<java.util.List<AttendanceResponse>>> myMonth(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success("Monthly attendance fetched",
                attendanceService.myMonthly(user.getUsername(), year, month)));
    }
}
