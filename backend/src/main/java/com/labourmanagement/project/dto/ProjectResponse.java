package com.labourmanagement.project.dto;

import com.labourmanagement.common.enums.ProjectStatus;
import java.time.LocalDate;

public record ProjectResponse(Long id, String projectCode, String name, String description,
                              String clientName, String location, LocalDate startDate,
                              LocalDate endDate, ProjectStatus status) {
}
