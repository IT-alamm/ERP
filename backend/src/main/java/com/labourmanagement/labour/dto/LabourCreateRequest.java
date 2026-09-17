package com.labourmanagement.labour.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LabourCreateRequest(
        @NotBlank String username,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6) String password,
        @NotBlank String firstName,
        String lastName,
        String phone,
        LocalDate dateOfBirth,
        String gender,
        String address,
        String city,
        String state,
        String pincode,
        LocalDate joiningDate,
        String designation,
        String department,
        @DecimalMin("0.0") BigDecimal dailyWage) {
}
