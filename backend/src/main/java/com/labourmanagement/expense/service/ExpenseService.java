package com.labourmanagement.expense.service;

import com.labourmanagement.common.exception.ResourceNotFoundException;
import com.labourmanagement.expense.dto.*;
import com.labourmanagement.expense.entity.Expense;
import com.labourmanagement.expense.repository.ExpenseRepository;
import com.labourmanagement.labour.repository.LabourRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final LabourRepository labourRepository;

    @Transactional
    public ExpenseResponse add(AddExpenseRequest req) {
        labourRepository.findById(req.labourId())
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found: " + req.labourId()));
        Expense e = Expense.builder()
                .labourId(req.labourId())
                .amount(req.amount())
                .expenseDate(req.expenseDate() != null ? req.expenseDate() : LocalDate.now())
                .remarks(req.remarks())
                .build();
        e = expenseRepository.save(e);
        log.info("Expense added labourId={} amount={}", req.labourId(), req.amount());
        return new ExpenseResponse(e.getId(), e.getLabourId(), e.getAmount(), e.getExpenseDate(), e.getRemarks());
    }

    @Transactional(readOnly = true)
    public List<ExpenseTotalResponse> totals() {
        return expenseRepository.totalByLabour().stream()
                .map(r -> new ExpenseTotalResponse((Long) r[0], (java.math.BigDecimal) r[1]))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExpenseTotalResponse> totalsForAdmin(Long createdBy) {
        return expenseRepository.totalByLabourForAdmin(createdBy).stream()
                .map(r -> new ExpenseTotalResponse((Long) r[0], (java.math.BigDecimal) r[1]))
                .toList();
    }

    @Transactional(readOnly = true)
    public java.math.BigDecimal totalForLabour(Long labourId) {
        return expenseRepository.totalByLabourId(labourId);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> listByLabour(Long labourId) {
        return expenseRepository.findByLabourIdOrderByExpenseDateDesc(labourId).stream()
                .map(e -> new ExpenseResponse(e.getId(), e.getLabourId(), e.getAmount(), e.getExpenseDate(), e.getRemarks()))
                .toList();
    }
}
