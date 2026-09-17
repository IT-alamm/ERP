package com.labourmanagement.security.dto;

public record LoginResponse(String accessToken, String refreshToken, String tokenType, long expiresIn) {
}
