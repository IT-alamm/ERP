package com.labourmanagement.security.service;

import com.labourmanagement.security.entity.User;
import com.labourmanagement.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        // Role: Spring expects ROLE_ prefix with hasRole. DB me ROLE_ADMIN / ROLE_LABOUR store karenge.
        authorities.add(new SimpleGrantedAuthority(user.getRole().getName()));
        user.getRole().getPermissions().forEach(p -> authorities.add(new SimpleGrantedAuthority(p.getName())));
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(), user.isEnabled(),
                true, true, true, authorities);
    }
}
