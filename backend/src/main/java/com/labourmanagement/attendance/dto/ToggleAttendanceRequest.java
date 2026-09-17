package com.labourmanagement.attendance.dto;

import com.labourmanagement.common.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ToggleAttendanceRequest(
        @NotNull Long labourId,
        @NotNull LocalDate attendanceDate,
        AttendanceStatus status) {
}
