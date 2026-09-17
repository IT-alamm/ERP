package com.labourmanagement.audit.controller;

import com.labourmanagement.audit.entity.AuditLog;
import com.labourmanagement.audit.repository.AuditLogRepository;
import com.labourmanagement.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> list(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Audit logs",
                auditLogRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }
}
