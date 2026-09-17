package com.labourmanagement.payroll.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record GeneratePayrollRequest(@NotNull Long labourId, @NotNull String payPeriod,
                                     BigDecimal bonus, BigDecimal deduction) {
}
