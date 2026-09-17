package com.labourmanagement.attendance.repository;

import com.labourmanagement.attendance.entity.Attendance;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByLabourIdAndAttendanceDate(Long labourId, LocalDate date);

    Page<Attendance> findByLabourId(Long labourId, Pageable pageable);

    List<Attendance> findByLabourIdAndAttendanceDateBetween(Long labourId, LocalDate start, LocalDate end);

    List<Attendance> findByAttendanceDateBetween(LocalDate start, LocalDate end);

    long countByAttendanceDateAndStatus(LocalDate date, com.labourmanagement.common.enums.AttendanceStatus status);

    @Query("SELECT a.labourId, a.status, COUNT(a) FROM Attendance a " +
            "WHERE a.attendanceDate BETWEEN :start AND :end GROUP BY a.labourId, a.status")
    List<Object[]> countByMonthGrouped(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT a.labourId, a.status, COUNT(a) FROM Attendance a " +
            "WHERE a.attendanceDate BETWEEN :start AND :end " +
            "AND a.labourId IN (SELECT l.id FROM Labour l WHERE l.createdBy = :createdBy) " +
            "GROUP BY a.labourId, a.status")
    List<Object[]> countByMonthGroupedForAdmin(@Param("start") LocalDate start, @Param("end") LocalDate end, @Param("createdBy") Long createdBy);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.labourId IN :labourIds AND a.attendanceDate = :date AND a.status = :status")
    long countByLabourIdInAndDateAndStatus(@Param("labourIds") List<Long> labourIds, @Param("date") LocalDate date, @Param("status") com.labourmanagement.common.enums.AttendanceStatus status);
}
