package com.labourmanagement.payroll.repository;

import com.labourmanagement.payroll.entity.Payroll;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    Optional<Payroll> findByLabourIdAndPayPeriod(Long labourId, String payPeriod);

    Page<Payroll> findByLabourId(Long labourId, Pageable pageable);
}
