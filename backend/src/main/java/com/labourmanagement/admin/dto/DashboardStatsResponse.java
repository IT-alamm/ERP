package com.labourmanagement.admin.dto;

public record DashboardStatsResponse(long totalLabours, long activeLabours, long totalProjects,
                                     long pendingLeaves, long presentToday) {
}
