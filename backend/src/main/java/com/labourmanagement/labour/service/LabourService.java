package com.labourmanagement.labour.service;

import com.labourmanagement.audit.service.AuditService;
import com.labourmanagement.common.enums.LabourStatus;
import com.labourmanagement.common.exception.*;
import com.labourmanagement.labour.dto.*;
import com.labourmanagement.labour.entity.Labour;
import com.labourmanagement.labour.mapper.LabourMapper;
import com.labourmanagement.labour.repository.LabourRepository;
import com.labourmanagement.security.entity.*;
import com.labourmanagement.security.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class LabourService {

    private final LabourRepository labourRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LabourMapper labourMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional
    public LabourResponse createLabour(LabourCreateRequest req, Long createdByUserId) {
        if (userRepository.existsByUsername(req.username())) throw new DuplicateResourceException("Username already exists");
        if (userRepository.existsByEmail(req.email())) throw new DuplicateResourceException("Email already exists");

        Role labourRole = roleRepository.findByName("ROLE_LABOUR")
                .orElseThrow(() -> new ResourceNotFoundException("ROLE_LABOUR not found. Flyway seed check karo."));

        User user = User.builder()
                .username(req.username()).email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(labourRole).enabled(true).build();
        user = userRepository.save(user);

        String empCode = "LBR" + System.currentTimeMillis() % 10000000;

        Labour labour = Labour.builder()
                .user(user).employeeCode(empCode)
                .firstName(req.firstName()).lastName(req.lastName())
                .phone(req.phone()).dateOfBirth(req.dateOfBirth())
                .gender(req.gender()).address(req.address())
                .city(req.city()).state(req.state()).pincode(req.pincode())
                .joiningDate(req.joiningDate() != null ? req.joiningDate() : LocalDate.now())
                .designation(req.designation()).department(req.department())
                .dailyWage(req.dailyWage()).status(LabourStatus.ACTIVE)
                .createdBy(createdByUserId)
                .build();
        labour = labourRepository.save(labour);
        log.info("Creating labour employeeCode={} createdBy={}", empCode, createdByUserId);
        auditService.log("CREATE_LABOUR", "Labour", labour.getId(), null, empCode);
        return labourMapper.toResponse(labour);
    }

    @Transactional(readOnly = true)
    public Page<LabourResponse> getAll(String search, LabourStatus status, Long createdByUserId, Pageable pageable) {
        return labourRepository.search(createdByUserId, search, status, pageable).map(labourMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public LabourResponse getById(Long id) {
        return labourRepository.findById(id).map(labourMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found: " + id));
    }

    @Transactional(readOnly = true)
    public LabourResponse getMyProfile(String username) {
        return labourRepository.findByUserUsername(username)
                .map(labourMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Labour profile not found"));
    }

    @Transactional
    public LabourResponse update(Long id, LabourUpdateRequest req) {
        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found: " + id));
        String old = labour.getFirstName() + "|" + labour.getDailyWage();
        if (req.firstName() != null) labour.setFirstName(req.firstName());
        if (req.lastName() != null) labour.setLastName(req.lastName());
        if (req.phone() != null) labour.setPhone(req.phone());
        if (req.dateOfBirth() != null) labour.setDateOfBirth(req.dateOfBirth());
        if (req.gender() != null) labour.setGender(req.gender());
        if (req.address() != null) labour.setAddress(req.address());
        if (req.city() != null) labour.setCity(req.city());
        if (req.state() != null) labour.setState(req.state());
        if (req.pincode() != null) labour.setPincode(req.pincode());
        if (req.designation() != null) labour.setDesignation(req.designation());
        if (req.department() != null) labour.setDepartment(req.department());
        if (req.dailyWage() != null) labour.setDailyWage(req.dailyWage());
        if (req.joiningDate() != null) labour.setJoiningDate(req.joiningDate());
        auditService.log("UPDATE_LABOUR", "Labour", id, old, labour.getFirstName() + "|" + labour.getDailyWage());
        return labourMapper.toResponse(labourRepository.save(labour));
    }

    @Transactional
    public LabourResponse updateMyProfile(String username, LabourUpdateRequest req) {
        Labour labour = labourRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Labour profile not found"));
        return update(labour.getId(), req);
    }

    @Transactional
    public LabourResponse updateStatus(Long id, LabourStatus status) {
        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found: " + id));
        LabourStatus old = labour.getStatus();
        labour.setStatus(status);
        auditService.log("UPDATE_LABOUR_STATUS", "Labour", id, old.name(), status.name());
        return labourMapper.toResponse(labourRepository.save(labour));
    }

    @Transactional
    public void delete(Long id) {
        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found: " + id));
        labourRepository.delete(labour);
        auditService.log("DELETE_LABOUR", "Labour", id, labour.getStatus().name(), "DELETED");
    }
}
