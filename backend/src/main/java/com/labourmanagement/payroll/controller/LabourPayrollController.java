package com.labourmanagement.payroll.controller;

import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.payroll.dto.PayrollResponse;
import com.labourmanagement.payroll.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/labour/payroll")
@RequiredArgsConstructor
public class LabourPayrollController {

    private final PayrollService payrollService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PayrollResponse>>> mine(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Payroll fetched",
                payrollService.myPayroll(user.getUsername(), PageRequest.of(page, size))));
    }
}
