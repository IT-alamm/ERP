package com.labourmanagement.attendance;

import com.labourmanagement.attendance.dto.ToggleAttendanceRequest;
import com.labourmanagement.attendance.service.AttendanceService;
import com.labourmanagement.common.enums.AttendanceStatus;
import com.labourmanagement.common.exception.BadRequestException;
import com.labourmanagement.labour.dto.LabourCreateRequest;
import com.labourmanagement.labour.dto.LabourResponse;
import com.labourmanagement.labour.service.LabourService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AttendanceValidationTest {

    @Autowired
    private AttendanceService attendanceService;
    @Autowired
    private LabourService labourService;

    private LabourResponse createLabour(String tag) {
        return labourService.createLabour(new LabourCreateRequest(
                "att" + tag, "att" + tag + "@x.com", "Test@123",
                "Att", "Lab" + tag, "9999999999",
                null, null, null, null, null, null,
                LocalDate.now(), "Labour", "Civil", new BigDecimal("500")), 1L);
    }

    @Test
    void marksTodayPresent() {
        LabourResponse labour = createLabour("t1");
        var res = attendanceService.toggle(
                new ToggleAttendanceRequest(labour.id(), LocalDate.now(), AttendanceStatus.PRESENT));
        assertThat(res.status()).isEqualTo(AttendanceStatus.PRESENT);
    }

    @Test
    void rejectsFutureDate() {
        LabourResponse labour = createLabour("t2");
        assertThatThrownBy(() -> attendanceService.toggle(
                new ToggleAttendanceRequest(labour.id(), LocalDate.now().plusDays(1), AttendanceStatus.PRESENT)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Future");
    }

    @Test
    void rejectsDateBeforeJoining() {
        LabourResponse labour = createLabour("t3");
        assertThatThrownBy(() -> attendanceService.toggle(
                new ToggleAttendanceRequest(labour.id(), LocalDate.now().minusDays(1), AttendanceStatus.PRESENT)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Joining");
    }

    @Test
    void monthlyListsMarkedRecord() {
        LabourResponse labour = createLabour("t4");
        attendanceService.toggle(
                new ToggleAttendanceRequest(labour.id(), LocalDate.now(), AttendanceStatus.PRESENT));
        LocalDate now = LocalDate.now();
        var list = attendanceService.monthly(labour.id(), now.getYear(), now.getMonthValue());
        assertThat(list).hasSize(1);
        assertThat(list.get(0).status()).isEqualTo(AttendanceStatus.PRESENT);
    }
}
