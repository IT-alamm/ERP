package com.labourmanagement.project.controller;

import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.project.dto.ProjectResponse;
import com.labourmanagement.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/labour/projects")
@RequiredArgsConstructor
public class LabourProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> myProjects(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("My projects", projectService.myProjects(user.getUsername())));
    }
}
