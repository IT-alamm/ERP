package com.labourmanagement.project.controller;

import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.project.dto.*;
import com.labourmanagement.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/projects")
@RequiredArgsConstructor
public class AdminProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasAuthority('PROJECT_MANAGE')")
    public ResponseEntity<ApiResponse<ProjectResponse>> create(@Valid @RequestBody ProjectRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Project created", projectService.create(req)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PROJECT_MANAGE')")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success("Projects fetched", projectService.list()));
    }

    @PostMapping("/{projectId}/assign/{labourId}")
    @PreAuthorize("hasAuthority('PROJECT_MANAGE')")
    public ResponseEntity<ApiResponse<Void>> assign(@PathVariable Long projectId, @PathVariable Long labourId) {
        projectService.assignLabour(projectId, labourId);
        return ResponseEntity.ok(ApiResponse.success("Labour assigned", null));
    }
}
