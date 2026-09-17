package com.labourmanagement.document.controller;

import com.labourmanagement.common.enums.DocumentType;
import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.document.dto.DocumentResponse;
import com.labourmanagement.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/documents")
@RequiredArgsConstructor
public class AdminDocumentController {

    private final DocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('LABOUR_UPDATE')")
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
            @RequestParam Long labourId,
            @RequestParam DocumentType type,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Uploaded", documentService.upload(labourId, type, file)));
    }

    @GetMapping("/labour/{labourId}")
    @PreAuthorize("hasAuthority('LABOUR_VIEW')")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> list(@PathVariable Long labourId) {
        return ResponseEntity.ok(ApiResponse.success("Documents", documentService.byLabour(labourId)));
    }
}
