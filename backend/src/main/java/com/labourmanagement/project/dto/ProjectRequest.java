package com.labourmanagement.project.dto;

import com.labourmanagement.common.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record ProjectRequest(
        @NotBlank String projectCode, @NotBlank String name,
        String description, String clientName, String location,
        LocalDate startDate, LocalDate endDate, ProjectStatus status) {
}
