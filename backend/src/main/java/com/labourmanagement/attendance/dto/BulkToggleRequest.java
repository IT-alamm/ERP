package com.labourmanagement.attendance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BulkToggleRequest(@NotEmpty List<@Valid ToggleAttendanceRequest> items) {
}
