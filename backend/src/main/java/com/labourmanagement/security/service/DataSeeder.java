package com.labourmanagement.security.service;

import com.labourmanagement.security.entity.Permission;
import com.labourmanagement.security.entity.Role;
import com.labourmanagement.security.entity.User;
import com.labourmanagement.security.repository.PermissionRepository;
import com.labourmanagement.security.repository.RoleRepository;
import com.labourmanagement.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    // Flyway V1 + V10 wali permission list ka mirror. Dev H2 me Flyway band hai,
    // isliye yahi seed karta hai; prod me Flyway already seed karta hai (idempotent).
    private static final List<String[]> ALL_PERMISSIONS = List.of(
            new String[]{"LABOUR_VIEW", "View labours"},
            new String[]{"LABOUR_CREATE", "Create labour"},
            new String[]{"LABOUR_UPDATE", "Update labour"},
            new String[]{"LABOUR_DELETE", "Delete/deactivate labour"},
            new String[]{"ATTENDANCE_VIEW", "View attendance"},
            new String[]{"ATTENDANCE_MARK", "Mark attendance"},
            new String[]{"PAYROLL_VIEW", "View payroll"},
            new String[]{"PAYROLL_GENERATE", "Generate payroll"},
            new String[]{"LEAVE_APPROVE", "Approve leaves"},
            new String[]{"PROJECT_MANAGE", "Manage projects"},
            new String[]{"REPORT_VIEW", "View reports and audit"},
            new String[]{"EXPENSE_VIEW", "View expenses"},
            new String[]{"EXPENSE_ADD", "Add expense"}
    );

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name("ROLE_ADMIN")
                        .description("Administrator")
                        .build()));
        Role labourRole = roleRepository.findByName("ROLE_LABOUR")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name("ROLE_LABOUR")
                        .description("Labour worker")
                        .build()));

        for (String[] p : ALL_PERMISSIONS) {
            permissionRepository.findByName(p[0])
                    .orElseGet(() -> permissionRepository.save(Permission.builder()
                            .name(p[0])
                            .description(p[1])
                            .build()));
        }

        // Backfill: purane khaali roles (empty permissions) fix ho jayenge.
        // ADMIN ko saari permissions, LABOUR ko sirf LABOUR_VIEW (Flyway V2 jaisa).
        boolean changed = false;
        for (Permission p : permissionRepository.findAll()) {
            if (adminRole.getPermissions().add(p)) {
                changed = true;
            }
        }
        Permission labourView = permissionRepository.findByName("LABOUR_VIEW").orElseThrow();
        if (labourRole.getPermissions().add(labourView)) {
            changed = true;
        }
        if (changed) {
            roleRepository.save(adminRole);
            roleRepository.save(labourRole);
            log.info("Backfilled role permissions for ROLE_ADMIN / ROLE_LABOUR");
        }

        // Seed default admin only if missing
        if (userRepository.findByUsername("likith").isEmpty()) {
            User likith = User.builder()
                    .username("likith")
                    .email("likith@labour.local")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(adminRole)
                    .enabled(true)
                    .build();
            userRepository.save(likith);
            log.info("Seeded default admin user: likith / Admin@123");
        }
    }
}
