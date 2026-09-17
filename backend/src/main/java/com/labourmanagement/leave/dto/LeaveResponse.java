package com.labourmanagement.leave.dto;

import com.labourmanagement.common.enums.*;
import java.time.LocalDate;

public record LeaveResponse(Long id, Long labourId, LeaveType leaveType, LocalDate startDate,
                            LocalDate endDate, String reason, LeaveStatus status) {
}
