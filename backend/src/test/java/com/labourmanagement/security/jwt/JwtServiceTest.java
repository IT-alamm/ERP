package com.labourmanagement.security.jwt;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private static final String SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    private final JwtService jwtService = new JwtService(SECRET, 900000);

    @Test
    void generatesTokenWithUsernameAndRole() {
        String token = jwtService.generateAccessToken("likith", "ROLE_ADMIN", List.of("LABOUR_VIEW"));
        assertThat(jwtService.extractUsername(token)).isEqualTo("likith");
        assertThat(jwtService.isValid(token)).isTrue();
    }

    @Test
    void rejectsTamperedToken() {
        String token = jwtService.generateAccessToken("likith", "ROLE_ADMIN", List.of());
        assertThat(jwtService.isValid(token + "tamper")).isFalse();
    }

    @Test
    void rejectsTokenSignedWithDifferentSecret() {
        String token = jwtService.generateAccessToken("likith", "ROLE_ADMIN", List.of());
        JwtService other = new JwtService(
                "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210", 900000);
        assertThat(other.isValid(token)).isFalse();
    }

    @Test
    void reportsConfiguredExpiry() {
        assertThat(jwtService.getAccessExpirationSeconds()).isEqualTo(900);
    }
}
