package com.labourmanagement.payroll.controller;

import com.labourmanagement.common.enums.PayrollStatus;
import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.payroll.dto.*;
import com.labourmanagement.payroll.service.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/payroll")
@RequiredArgsConstructor
public class AdminPayrollController {

    private final PayrollService payrollService;

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('PAYROLL_GENERATE')")
    public ResponseEntity<ApiResponse<PayrollResponse>> generate(@Valid @RequestBody GeneratePayrollRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Payroll generated", payrollService.generate(req)));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('PAYROLL_GENERATE')")
    public ResponseEntity<ApiResponse<PayrollResponse>> status(@PathVariable Long id,
                                                               @RequestParam PayrollStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Payroll updated", payrollService.updateStatus(id, status)));
    }
}
