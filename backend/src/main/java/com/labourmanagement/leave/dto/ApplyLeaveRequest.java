package com.labourmanagement.leave.dto;

import com.labourmanagement.common.enums.LeaveType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ApplyLeaveRequest(@NotNull LeaveType leaveType, @NotNull LocalDate startDate,
                                @NotNull LocalDate endDate, String reason) {
}
