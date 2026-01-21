package com.PIEC.ImobLink.Services;

import Role.Role;
import com.PIEC.ImobLink.DTOs.AuthResponse;
import com.PIEC.ImobLink.DTOs.LoginRequest;
import com.PIEC.ImobLink.DTOs.RegisterRequest;
import com.PIEC.ImobLink.Jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        User user = new User();
        user.setImageProfilePath("/uploads/holder.jpeg");
        user.setCpf(request.getCpf());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        userRepository.save(user);

        return new AuthResponse("Cadastrado com sucesso!");
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        // 🔑 Gera token com email, role e nome
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getName()
        );

        return new AuthResponse(token);
    }

    public AuthResponse loginAdm(LoginRequest request) throws AccessDeniedException {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        if (user.getRole() != Role.ADMIN && user.getRole() != Role.SUPER_ADMIN) {
            throw new AccessDeniedException("Usuário não é ADM");
        }
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getName()
        );
        return new AuthResponse(token);
    }
}
