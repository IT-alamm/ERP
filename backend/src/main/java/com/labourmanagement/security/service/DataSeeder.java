package com.labourmanagement.security.service;

import com.labourmanagement.security.entity.Role;
import com.labourmanagement.security.entity.User;
import com.labourmanagement.security.repository.RoleRepository;
import com.labourmanagement.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        // Seed only if no admin exists at all
        if (userRepository.findByUsername("likith").isEmpty()) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN missing - Flyway migration check karo"));
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
