package com.labourmanagement.document.repository;

import com.labourmanagement.document.entity.LabourDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabourDocumentRepository extends JpaRepository<LabourDocument, Long> {
    List<LabourDocument> findByLabourId(Long labourId);
}
