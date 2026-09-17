package com.labourmanagement.attendance.dto;

public record AttendanceSummaryResponse(Long labourId, long present, long absent, long marked) {
}
