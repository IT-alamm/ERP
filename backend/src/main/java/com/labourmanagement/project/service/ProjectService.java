package com.labourmanagement.project.service;

import com.labourmanagement.audit.service.AuditService;
import com.labourmanagement.common.exception.*;
import com.labourmanagement.labour.repository.LabourRepository;
import com.labourmanagement.project.dto.*;
import com.labourmanagement.project.entity.*;
import com.labourmanagement.project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final LabourProjectRepository labourProjectRepository;
    private final LabourRepository labourRepository;
    private final AuditService auditService;

    private ProjectResponse toResponse(Project p) {
        return new ProjectResponse(p.getId(), p.getProjectCode(), p.getName(), p.getDescription(),
                p.getClientName(), p.getLocation(), p.getStartDate(), p.getEndDate(), p.getStatus());
    }

    @Transactional
    public ProjectResponse create(ProjectRequest req) {
        if (projectRepository.existsByProjectCode(req.projectCode()))
            throw new DuplicateResourceException("Project code already exists");
        Project p = Project.builder().projectCode(req.projectCode()).name(req.name())
                .description(req.description()).clientName(req.clientName()).location(req.location())
                .startDate(req.startDate()).endDate(req.endDate())
                .status(req.status() != null ? req.status() : com.labourmanagement.common.enums.ProjectStatus.PLANNED)
                .build();
        p = projectRepository.save(p);
        auditService.log("CREATE_PROJECT", "Project", p.getId(), null, p.getProjectCode());
        return toResponse(p);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> list() {
        return projectRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse get(Long id) {
        return projectRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
    }

    @Transactional
    public void assignLabour(Long projectId, Long labourId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
        labourRepository.findById(labourId)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found: " + labourId));
        LabourProject lp = LabourProject.builder().projectId(projectId).labourId(labourId)
                .assignedDate(LocalDate.now()).status("ACTIVE").build();
        labourProjectRepository.save(lp);
        auditService.log("ASSIGN_PROJECT", "Project", projectId, null, "labourId=" + labourId);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> myProjects(String username) {
        var labour = labourRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Labour profile not found"));
        List<Long> projectIds = labourProjectRepository.findByLabourId(labour.getId()).stream()
                .filter(lp -> "ACTIVE".equals(lp.getStatus())).map(LabourProject::getProjectId).toList();
        return projectRepository.findAllById(projectIds).stream().map(this::toResponse).toList();
    }
}
