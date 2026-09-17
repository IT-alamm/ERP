package com.labourmanagement.labour.controller;

import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.labour.dto.*;
import com.labourmanagement.labour.service.LabourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/labour/profile")
@RequiredArgsConstructor
public class LabourProfileController {

    private final LabourService labourService;

    @GetMapping
    public ResponseEntity<ApiResponse<LabourResponse>> myProfile(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", labourService.getMyProfile(user.getUsername())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<LabourResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody LabourUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", labourService.updateMyProfile(user.getUsername(), request)));
    }
}
