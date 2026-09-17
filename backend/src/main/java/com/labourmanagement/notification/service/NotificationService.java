package com.labourmanagement.notification.service;

import com.labourmanagement.notification.entity.Notification;
import com.labourmanagement.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void notify(Long userId, String title, String message, String type) {
        notificationRepository.save(Notification.builder()
                .userId(userId).title(title).message(message).type(type).build());
    }

    // Email/SMS/WhatsApp baad me. Abhi sirf DB notification.
    @Transactional(readOnly = true)
    public Page<Notification> myNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Transactional
    public void markRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
