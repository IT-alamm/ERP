package com.labourmanagement.expense.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(Long id, Long labourId, BigDecimal amount,
                              LocalDate expenseDate, String remarks) {
}
