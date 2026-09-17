package com.labourmanagement.audit.service;

import com.labourmanagement.audit.entity.AuditLog;
import com.labourmanagement.audit.repository.AuditLogRepository;
import com.labourmanagement.common.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(String action, String entityType, Long entityId, String oldValue, String newValue) {
        try {
            AuditLog entry = AuditLog.builder()
                    .username(SecurityUtils.currentUsername())
                    .action(action).entityType(entityType).entityId(entityId)
                    .oldValue(oldValue).newValue(newValue)
                    .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Audit failed action={} entity={}:{}", action, entityType, e.getMessage());
        }
    }
}
