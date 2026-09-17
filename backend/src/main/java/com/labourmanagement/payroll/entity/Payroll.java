package com.labourmanagement.payroll.entity;

import com.labourmanagement.common.enums.PayrollStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll",
        uniqueConstraints = @UniqueConstraint(name = "uk_payroll_labour_period", columnNames = {"labour_id", "pay_period"}),
        indexes = {
                @Index(name = "idx_payroll_labour", columnList = "labour_id"),
                @Index(name = "idx_payroll_period", columnList = "pay_period")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "labour_id", nullable = false)
    private Long labourId;

    @Column(name = "pay_period", nullable = false, length = 7)
    private String payPeriod; // YYYY-MM

    private int totalDays;
    private int presentDays;
    private int absentDays;
    private int leaveDays;

    @Column(precision = 6, scale = 2)
    private BigDecimal overtimeHours;

    @Column(precision = 12, scale = 2)
    private BigDecimal basicAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal overtimeAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal bonus;

    @Column(precision = 12, scale = 2)
    private BigDecimal deduction;

    @Column(precision = 12, scale = 2)
    private BigDecimal grossSalary;

    @Column(precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private PayrollStatus status = PayrollStatus.DRAFT;

    private LocalDateTime generatedAt;
    private LocalDateTime paidAt;
    // NOTE: online payment gateway baad me. Abhi PAID status sirf manual entry (cash/bank transfer record).

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
