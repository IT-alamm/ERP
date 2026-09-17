package com.labourmanagement.attendance.dto;

import com.labourmanagement.common.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record MarkAttendanceRequest(
        @NotNull Long labourId, @NotNull LocalDate attendanceDate,
        LocalTime checkIn, LocalTime checkOut,
        AttendanceStatus status, BigDecimal overtimeHours, String remarks) {
}
