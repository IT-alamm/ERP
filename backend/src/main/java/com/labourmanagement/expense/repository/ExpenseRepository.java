package com.labourmanagement.expense.repository;

import com.labourmanagement.expense.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByLabourIdOrderByExpenseDateDesc(Long labourId);

    @Query("SELECT e.labourId, SUM(e.amount) FROM Expense e GROUP BY e.labourId")
    List<Object[]> totalByLabour();

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.labourId = :labourId")
    BigDecimal totalByLabourId(Long labourId);

    @Query("SELECT e.labourId, SUM(e.amount) FROM Expense e " +
            "WHERE e.labourId IN (SELECT l.id FROM Labour l WHERE l.createdBy = :createdBy) " +
            "GROUP BY e.labourId")
    List<Object[]> totalByLabourForAdmin(Long createdBy);
}
