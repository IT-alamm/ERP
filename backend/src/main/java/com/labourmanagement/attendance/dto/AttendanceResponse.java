package com.labourmanagement.attendance.dto;

import com.labourmanagement.common.enums.AttendanceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceResponse(Long id, Long labourId, LocalDate attendanceDate,
                                 LocalTime checkIn, LocalTime checkOut, AttendanceStatus status,
                                 BigDecimal workingHours, BigDecimal overtimeHours, String remarks) {
}
