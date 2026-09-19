package com.labourmanagement.labour.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LabourUpdateRequest(
        String firstName, String lastName, String phone,
        LocalDate dateOfBirth, String gender, String address,
        String city, String state, String pincode,
        String designation, String department, BigDecimal dailyWage,
        LocalDate joiningDate) {
}
