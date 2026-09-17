package com.labourmanagement.expense.dto;

import java.math.BigDecimal;

public record ExpenseTotalResponse(Long labourId, BigDecimal total) {
}
