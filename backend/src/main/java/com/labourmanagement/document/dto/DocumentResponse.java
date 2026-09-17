package com.labourmanagement.document.dto;

import com.labourmanagement.common.enums.DocumentType;

public record DocumentResponse(Long id, Long labourId, DocumentType documentType,
                               String fileName, Long fileSize, String mimeType) {
}
