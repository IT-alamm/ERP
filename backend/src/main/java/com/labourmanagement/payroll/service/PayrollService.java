package com.labourmanagement.payroll.service;

import com.labourmanagement.attendance.repository.AttendanceRepository;
import com.labourmanagement.audit.service.AuditService;
import com.labourmanagement.common.enums.*;
import com.labourmanagement.common.exception.*;
import com.labourmanagement.labour.repository.LabourRepository;
import com.labourmanagement.notification.service.NotificationService;
import com.labourmanagement.payroll.dto.*;
import com.labourmanagement.payroll.entity.Payroll;
import com.labourmanagement.payroll.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final LabourRepository labourRepository;
    private final AttendanceRepository attendanceRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    private PayrollResponse toResponse(Payroll p) {
        return new PayrollResponse(p.getId(), p.getLabourId(), p.getPayPeriod(), p.getTotalDays(),
                p.getPresentDays(), p.getAbsentDays(), p.getLeaveDays(), p.getOvertimeHours(),
                p.getBasicAmount(), p.getOvertimeAmount(), p.getBonus(), p.getDeduction(),
                p.getGrossSalary(), p.getNetSalary(), p.getStatus());
    }

    @Transactional
    public PayrollResponse generate(GeneratePayrollRequest req) {
        var labour = labourRepository.findById(req.labourId())
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found: " + req.labourId()));
        if (payrollRepository.findByLabourIdAndPayPeriod(req.labourId(), req.payPeriod()).isPresent()) {
            throw new DuplicateResourceException("Payroll already generated for this period");
        }
        YearMonth ym = YearMonth.parse(req.payPeriod());
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        var records = attendanceRepository.findByLabourIdAndAttendanceDateBetween(req.labourId(), start, end);

        int present = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        int half = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.HALF_DAY).count();
        int absent = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        int leave = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.LEAVE).count();
        BigDecimal otHours = records.stream()
                .map(a -> a.getOvertimeHours() != null ? a.getOvertimeHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal wage = labour.getDailyWage() != null ? labour.getDailyWage() : BigDecimal.ZERO;
        // HALF_DAY = 0.5 day
        BigDecimal effectiveDays = BigDecimal.valueOf(present).add(BigDecimal.valueOf(half * 0.5));
        BigDecimal basic = wage.multiply(effectiveDays);
        // Overtime: daily wage / 8 per hour * 1.5 (simple rule)
        BigDecimal otRate = wage.divide(BigDecimal.valueOf(8), 2, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(1.5));
        BigDecimal otAmount = otRate.multiply(otHours);
        BigDecimal bonus = req.bonus() != null ? req.bonus() : BigDecimal.ZERO;
        BigDecimal deduction = req.deduction() != null ? req.deduction() : BigDecimal.ZERO;
        BigDecimal gross = basic.add(otAmount).add(bonus);
        BigDecimal net = gross.subtract(deduction);

        Payroll p = Payroll.builder()
                .labourId(req.labourId()).payPeriod(req.payPeriod())
                .totalDays(ym.lengthOfMonth()).presentDays(present).absentDays(absent).leaveDays(leave)
                .overtimeHours(otHours).basicAmount(basic).overtimeAmount(otAmount)
                .bonus(bonus).deduction(deduction).grossSalary(gross).netSalary(net)
                .status(PayrollStatus.GENERATED).generatedAt(java.time.LocalDateTime.now())
                .build();
        p = payrollRepository.save(p);
        log.info("Payroll generated labourId={} period={} net={}", req.labourId(), req.payPeriod(), net);
        auditService.log("GENERATE_PAYROLL", "Payroll", p.getId(), null, "net=" + net);
        if (labour.getUser() != null) {
            notificationService.notify(labour.getUser().getId(), "Salary generated",
                    "Payroll for " + req.payPeriod() + " generated. Net: Rs." + net, "PAYROLL");
        }
        return toResponse(p);
    }

    @Transactional
    public PayrollResponse updateStatus(Long id, PayrollStatus status) {
        Payroll p = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found: " + id));
        PayrollStatus old = p.getStatus();
        p.setStatus(status);
        if (status == PayrollStatus.PAID) p.setPaidAt(java.time.LocalDateTime.now());
        auditService.log("UPDATE_PAYROLL", "Payroll", id, old.name(), status.name());
        return toResponse(payrollRepository.save(p));
    }

    @Transactional(readOnly = true)
    public Page<PayrollResponse> myPayroll(String username, Pageable pageable) {
        var labour = labourRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Labour profile not found"));
        return payrollRepository.findByLabourId(labour.getId(), pageable).map(this::toResponse);
    }
}
