package com.labourmanagement.notification.controller;

import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.notification.entity.Notification;
import com.labourmanagement.notification.service.NotificationService;
import com.labourmanagement.security.entity.User;
import com.labourmanagement.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notification>>> mine(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User u = userRepository.findByUsername(user.getUsername()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success("Notifications",
                notificationService.myNotifications(u.getId(), PageRequest.of(page, size))));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> read(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok(ApiResponse.success("Marked read", null));
    }
}
