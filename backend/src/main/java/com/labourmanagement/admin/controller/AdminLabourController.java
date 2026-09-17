package com.labourmanagement.admin.controller;

import com.labourmanagement.common.enums.LabourStatus;
import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.labour.dto.*;
import com.labourmanagement.labour.service.LabourService;
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
@RequestMapping("/api/v1/admin/labours")
@RequiredArgsConstructor
public class AdminLabourController {

    private final LabourService labourService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAuthority('LABOUR_CREATE')")
    public ResponseEntity<ApiResponse<LabourResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody LabourCreateRequest request) {
        Long adminId = userRepository.findByUsername(userDetails.getUsername()).map(User::getId).orElse(null);
        return ResponseEntity.ok(ApiResponse.success("Labour created successfully", labourService.createLabour(request, adminId)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('LABOUR_VIEW')")
    public ResponseEntity<ApiResponse<Page<LabourResponse>>> list(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LabourStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long adminId = userRepository.findByUsername(userDetails.getUsername()).map(User::getId).orElse(null);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success("Labours fetched", labourService.getAll(search, status, adminId, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('LABOUR_VIEW')")
    public ResponseEntity<ApiResponse<LabourResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Labour fetched", labourService.getById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('LABOUR_UPDATE')")
    public ResponseEntity<ApiResponse<LabourResponse>> update(@PathVariable Long id,
                                                              @RequestBody LabourUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Labour updated", labourService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('LABOUR_UPDATE')")
    public ResponseEntity<ApiResponse<LabourResponse>> status(@PathVariable Long id,
                                                              @RequestParam LabourStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", labourService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('LABOUR_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        labourService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Labour deactivated", null));
    }
}
