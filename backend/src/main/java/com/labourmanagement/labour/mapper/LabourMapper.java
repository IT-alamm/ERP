package com.labourmanagement.labour.mapper;

import com.labourmanagement.labour.dto.LabourResponse;
import com.labourmanagement.labour.entity.Labour;
import org.springframework.stereotype.Component;

@Component
public class LabourMapper {
    public LabourResponse toResponse(Labour l) {
        return new LabourResponse(
                l.getId(), l.getEmployeeCode(),
                l.getUser() != null ? l.getUser().getUsername() : null,
                l.getUser() != null ? l.getUser().getEmail() : null,
                l.getFirstName(), l.getLastName(), l.getPhone(),
                l.getDateOfBirth(), l.getGender(), l.getAddress(),
                l.getCity(), l.getState(), l.getPincode(),
                l.getJoiningDate(), l.getDesignation(), l.getDepartment(),
                l.getDailyWage(), l.getStatus());
    }
}
