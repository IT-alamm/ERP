package com.labourmanagement.security.service;

import com.labourmanagement.common.exception.BadRequestException;
import com.labourmanagement.security.dto.*;
import com.labourmanagement.security.entity.RefreshToken;
import com.labourmanagement.security.entity.Role;
import com.labourmanagement.security.entity.User;
import com.labourmanagement.security.jwt.JwtService;
import com.labourmanagement.security.repository.RefreshTokenRepository;
import com.labourmanagement.security.repository.RoleRepository;
import com.labourmanagement.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (BadCredentialsException e) {
            log.warn("Failed login username={}", request.username());
            throw new BadRequestException("Invalid username or password");
        }
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        String expectedRole = request.role().startsWith("ROLE_") ? request.role() : "ROLE_" + request.role().toUpperCase();
        if (!user.getRole().getName().equals(expectedRole)) {
            throw new BadRequestException("This account is not a " + request.role().replace("ROLE_", "").toLowerCase() + " user");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        List<String> permissions = user.getRole().getPermissions().stream().map(p -> p.getName()).toList();
        String accessToken = jwtService.generateAccessToken(user.getUsername(), user.getRole().getName(), permissions);
        String refreshToken = UUID.randomUUID() + "-" + UUID.randomUUID();

        RefreshToken rt = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiryDate(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000))
                .build();
        refreshTokenRepository.save(rt);
        log.info("User logged in username={}", user.getUsername());
        return new LoginResponse(accessToken, refreshToken, "Bearer", jwtService.getAccessExpirationSeconds());
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new BadRequestException("Username already taken");
        }
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BadRequestException("Email already registered");
        }

        // Public registration sirf admin ke liye. Labour accounts admin Labour Directory se bante hain.
        Role role = roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new BadRequestException("Admin role not configured"));

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(role)
                .enabled(true)
                .build();
        userRepository.save(user);
        log.info("Admin registered username={}", request.username());
    }

    @Transactional
    public LoginResponse refresh(RefreshRequest request) {
        RefreshToken rt = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));
        if (rt.isRevoked() || rt.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token expired. Please login again.");
        }
        User user = rt.getUser();
        List<String> permissions = user.getRole().getPermissions().stream().map(p -> p.getName()).toList();
        String accessToken = jwtService.generateAccessToken(user.getUsername(), user.getRole().getName(), permissions);
        return new LoginResponse(accessToken, rt.getToken(), "Bearer", jwtService.getAccessExpirationSeconds());
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }
}
