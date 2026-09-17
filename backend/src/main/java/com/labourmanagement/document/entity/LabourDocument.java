package com.labourmanagement.document.entity;

import com.labourmanagement.common.enums.DocumentType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "labour_documents", indexes = @Index(name = "idx_doc_labour", columnList = "labour_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class LabourDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "labour_id", nullable = false)
    private Long labourId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DocumentType documentType;

    private String fileName;
    // Local disk path for now. S3/MinIO key baad me (Phase 9).
    private String storageKey;
    private Long fileSize;
    private String mimeType;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime uploadedAt;
}
