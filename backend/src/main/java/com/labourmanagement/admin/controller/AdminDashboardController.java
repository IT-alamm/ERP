package com.labourmanagement.admin.controller;

import com.labourmanagement.admin.dto.DashboardStatsResponse;
import com.labourmanagement.admin.service.AdminService;
import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.security.entity.User;
import com.labourmanagement.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> stats(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = userRepository.findByUsername(userDetails.getUsername()).map(User::getId).orElse(null);
        return ResponseEntity.ok(ApiResponse.success("Stats", adminService.stats(adminId)));
    }
}
