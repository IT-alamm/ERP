package com.labourmanagement.project.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "labour_project", indexes = {
        @Index(name = "idx_lp_labour", columnList = "labour_id"),
        @Index(name = "idx_lp_project", columnList = "project_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class LabourProject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "labour_id", nullable = false)
    private Long labourId;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    private LocalDate assignedDate;
    private LocalDate releasedDate;

    @Builder.Default
    @Column(length = 20)
    private String status = "ACTIVE";

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
