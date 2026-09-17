package com.labourmanagement.leave.controller;

import com.labourmanagement.common.enums.LeaveStatus;
import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.leave.dto.LeaveResponse;
import com.labourmanagement.leave.service.LeaveService;
import com.labourmanagement.security.entity.User;
import com.labourmanagement.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/leaves")
@RequiredArgsConstructor
public class AdminLeaveController {

    private final LeaveService leaveService;
    private final UserRepository userRepository;

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('LEAVE_APPROVE')")
    public ResponseEntity<ApiResponse<Page<LeaveResponse>>> pending(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Pending leaves",
                leaveService.pending(PageRequest.of(page, size))));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('LEAVE_APPROVE')")
    public ResponseEntity<ApiResponse<LeaveResponse>> decide(
            @PathVariable Long id, @RequestParam LeaveStatus decision,
            @AuthenticationPrincipal UserDetails user) {
        User admin = userRepository.findByUsername(user.getUsername()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success("Leave decided",
                leaveService.decide(id, decision, admin.getId())));
    }
}
