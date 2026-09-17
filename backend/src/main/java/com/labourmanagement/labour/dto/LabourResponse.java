package com.labourmanagement.labour.dto;

import com.labourmanagement.common.enums.LabourStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LabourResponse(
        Long id, String employeeCode, String username, String email,
        String firstName, String lastName, String phone,
        LocalDate dateOfBirth, String gender, String address,
        String city, String state, String pincode,
        LocalDate joiningDate, String designation, String department,
        BigDecimal dailyWage, LabourStatus status) {
}
