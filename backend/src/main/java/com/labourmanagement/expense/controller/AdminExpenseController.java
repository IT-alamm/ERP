package com.labourmanagement.expense.controller;

import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.expense.dto.*;
import com.labourmanagement.expense.service.ExpenseService;
import com.labourmanagement.security.entity.User;
import com.labourmanagement.security.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/expenses")
@RequiredArgsConstructor
public class AdminExpenseController {

    private final ExpenseService expenseService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAuthority('EXPENSE_ADD')")
    public ResponseEntity<ApiResponse<ExpenseResponse>> add(@Valid @RequestBody AddExpenseRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Expense added", expenseService.add(req)));
    }

    @GetMapping("/totals")
    @PreAuthorize("hasAuthority('EXPENSE_VIEW')")
    public ResponseEntity<ApiResponse<java.util.List<ExpenseTotalResponse>>> totals(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = userRepository.findByUsername(userDetails.getUsername()).map(User::getId).orElse(null);
        return ResponseEntity.ok(ApiResponse.success("Expense totals fetched", expenseService.totalsForAdmin(adminId)));
    }
}
