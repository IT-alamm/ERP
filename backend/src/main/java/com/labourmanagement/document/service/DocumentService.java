package com.labourmanagement.document.service;

import com.labourmanagement.audit.service.AuditService;
import com.labourmanagement.common.enums.DocumentType;
import com.labourmanagement.common.exception.*;
import com.labourmanagement.document.dto.DocumentResponse;
import com.labourmanagement.document.entity.LabourDocument;
import com.labourmanagement.document.repository.LabourDocumentRepository;
import com.labourmanagement.labour.repository.LabourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final LabourDocumentRepository documentRepository;
    private final LabourRepository labourRepository;
    private final AuditService auditService;

    @Value("${app.file.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional
    public DocumentResponse upload(Long labourId, DocumentType type, MultipartFile file) {
        labourRepository.findById(labourId)
                .orElseThrow(() -> new ResourceNotFoundException("Labour not found: " + labourId));
        try {
            Path dir = Paths.get(uploadDir, "labour-" + labourId);
            Files.createDirectories(dir);
            String stored = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path target = dir.resolve(stored);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            LabourDocument doc = LabourDocument.builder()
                    .labourId(labourId).documentType(type)
                    .fileName(file.getOriginalFilename())
                    .storageKey(target.toString())
                    .fileSize(file.getSize()).mimeType(file.getContentType())
                    .build();
            doc = documentRepository.save(doc);
            auditService.log("UPLOAD_DOCUMENT", "Document", doc.getId(), null, type.name());
            return new DocumentResponse(doc.getId(), labourId, type, doc.getFileName(), doc.getFileSize(), doc.getMimeType());
        } catch (Exception e) {
            throw new BusinessException("File upload failed: " + e.getMessage(), "UPLOAD_FAILED");
        }
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> byLabour(Long labourId) {
        return documentRepository.findByLabourId(labourId).stream()
                .map(d -> new DocumentResponse(d.getId(), d.getLabourId(), d.getDocumentType(),
                        d.getFileName(), d.getFileSize(), d.getMimeType()))
                .toList();
    }
}
