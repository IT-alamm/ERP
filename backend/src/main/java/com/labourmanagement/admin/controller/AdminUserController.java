package com.labourmanagement.admin.controller;

import com.labourmanagement.common.response.ApiResponse;
import com.labourmanagement.security.entity.User;
import com.labourmanagement.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> list() {
        java.util.List<Map<String, Object>> users = new java.util.ArrayList<>();
        for (User u : userRepository.findAll()) {
            users.add(Map.of("id", u.getId(), "username", u.getUsername(), "email", u.getEmail(), "role", u.getRole().getName(), "enabled", u.isEnabled()));
        }
        return ResponseEntity.ok(ApiResponse.success("Users fetched", users));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        return ResponseEntity.ok(ApiResponse.success("User deleted: " + user.getUsername(), null));
    }
}
