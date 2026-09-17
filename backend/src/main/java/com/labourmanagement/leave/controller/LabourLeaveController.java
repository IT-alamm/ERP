package com.labourmanagement.leave.controller;

import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.leave.dto.*;
import com.labourmanagement.leave.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/labour/leaves")
@RequiredArgsConstructor
public class LabourLeaveController {

    private final LeaveService leaveService;

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveResponse>> apply(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody ApplyLeaveRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Leave applied", leaveService.apply(user.getUsername(), req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LeaveResponse>>> mine(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Leaves fetched",
                leaveService.myLeaves(user.getUsername(), PageRequest.of(page, size))));
    }
}
