package com.labourmanagement.payroll.dto;

import com.labourmanagement.common.enums.PayrollStatus;
import java.math.BigDecimal;

public record PayrollResponse(Long id, Long labourId, String payPeriod, int totalDays,
                              int presentDays, int absentDays, int leaveDays,
                              BigDecimal overtimeHours, BigDecimal basicAmount,
                              BigDecimal overtimeAmount, BigDecimal bonus, BigDecimal deduction,
                              BigDecimal grossSalary, BigDecimal netSalary, PayrollStatus status) {
}
