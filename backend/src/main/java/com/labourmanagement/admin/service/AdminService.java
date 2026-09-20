package com.labourmanagement.admin.service;

import com.labourmanagement.admin.dto.DashboardStatsResponse;
import com.labourmanagement.attendance.repository.AttendanceRepository;
import com.labourmanagement.common.enums.*;
import com.labourmanagement.labour.repository.LabourRepository;
import com.labourmanagement.leave.repository.LeaveRequestRepository;
import com.labourmanagement.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final LabourRepository labourRepository;
    private final ProjectRepository projectRepository;
    private final LeaveRequestRepository leaveRepository;
    private final AttendanceRepository attendanceRepository;

    public DashboardStatsResponse stats(Long adminId) {
        // Admin sabhi labours dekhta hai (single-company ERP) - createdBy scoping nahi.
        long total = labourRepository.count();
        long active = labourRepository.countByStatus(LabourStatus.ACTIVE);
        long projects = projectRepository.count();
        long pendingLeaves = leaveRepository.countByStatus(LeaveStatus.PENDING);

        LocalDate today = LocalDate.now();
        List<Long> labourIds = labourRepository.findAllIds();
        long presentToday = 0;
        if (!labourIds.isEmpty()) {
            presentToday = attendanceRepository.countByLabourIdInAndDateAndStatus(labourIds, today, AttendanceStatus.PRESENT);
        }

        return new DashboardStatsResponse(total, active, projects, pendingLeaves, presentToday);
    }
}
