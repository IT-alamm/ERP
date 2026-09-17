package com.labourmanagement.expense.controller;

import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.expense.dto.ExpenseResponse;
import com.labourmanagement.expense.service.ExpenseService;
import com.labourmanagement.labour.repository.LabourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/labour/expenses")
@RequiredArgsConstructor
public class LabourExpenseController {

    private final ExpenseService expenseService;
    private final LabourRepository labourRepository;

    @GetMapping("/total")
    public ResponseEntity<ApiResponse<Map<String, Object>>> myTotal(@AuthenticationPrincipal UserDetails user) {
        var labour = labourRepository.findByUserUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Labour profile not found"));
        BigDecimal total = expenseService.totalForLabour(labour.getId());
        return ResponseEntity.ok(ApiResponse.success("Expense total fetched",
                Map.of("labourId", labour.getId(), "total", total)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> myList(@AuthenticationPrincipal UserDetails user) {
        var labour = labourRepository.findByUserUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Labour profile not found"));
        return ResponseEntity.ok(ApiResponse.success("Expenses fetched",
                expenseService.listByLabour(labour.getId())));
    }
}
