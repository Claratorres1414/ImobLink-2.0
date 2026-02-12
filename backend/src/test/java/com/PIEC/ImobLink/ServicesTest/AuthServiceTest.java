package com.PIEC.ImobLink.ServicesTest;

import Role.Role;
import com.PIEC.ImobLink.DTOs.AuthResponse;
import com.PIEC.ImobLink.DTOs.LoginRequest;
import com.PIEC.ImobLink.DTOs.RegisterRequest;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Jwt.JwtUtil;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Services.AuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.file.AccessDeniedException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {
    @Mock
    private  UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthenticationService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setCpf("123456789");
        user.setPhoneNumber("546244526");
        user.setEmail("email092@email.com");
        user.setPassword("password");
        user.setName("name");
        user.setRole(Role.USER);
    }

    @Test
    void tokenIfCredentialsOk() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenReturn(mock(Authentication.class));

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        when(jwtUtil.generateToken(anyString(), anyString(), anyString()))
                .thenReturn("token-fake");

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("email092@email.com");
        loginRequest.setPassword("123456");

        AuthResponse token = authService.login(loginRequest);

        assertEquals("token-fake", token.getToken());
    }

    @Test
    void userNotFound() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenReturn(mock(Authentication.class));

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest();
        request.setEmail("inexistente@email.com");
        request.setPassword("123456");

        assertThrows(RuntimeException.class,
                () -> authService.login(request));
    }

    @Test
    void authenticationFails() {

        doThrow(new BadCredentialsException("Credenciais inválidas"))
                .when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        LoginRequest request = new LoginRequest();
        request.setEmail("email@email.com");
        request.setPassword("errada");

        assertThrows(BadCredentialsException.class,
                () -> authService.login(request));
    }

    @Test
    void admLoginSuccess() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenReturn(mock(Authentication.class));

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        when(jwtUtil.generateToken(anyString(), anyString(), anyString()))
                .thenReturn("adm-token-fake");

        user.setRole(Role.ADMIN);

        LoginRequest request = new LoginRequest();
        request.setEmail("email@email.com");
        request.setPassword("123456");

        AuthResponse token = authService.loginAdm(request);

        assertEquals("adm-token-fake", token.getToken());
    }

    @Test
    void admLoginAccessDenied() throws AccessDeniedException {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenReturn(mock(Authentication.class));

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setEmail("email@email.com");
        request.setPassword("123456");

        assertThrows(RuntimeException.class, () -> authService.loginAdm(request));
    }

    @Test
    void createUserSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("pessoa@email.com");
        request.setPassword("123456");
        request.setName("pessoa");
        request.setCpf("0987654321");
        request.setPhoneNumber("123456789");

        when(passwordEncoder.encode(anyString()))
                .thenReturn("senha");

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse resposnse = authService.register(request);

        assertEquals("Cadastrado com sucesso!", resposnse.getToken());

        verify(userRepository, times(1)).save(any(User.class));
    }
}