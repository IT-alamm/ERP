package com.labourmanagement.project.repository;

import com.labourmanagement.project.entity.LabourProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabourProjectRepository extends JpaRepository<LabourProject, Long> {
    List<LabourProject> findByLabourId(Long labourId);

    List<LabourProject> findByProjectId(Long projectId);
}
