package com.PIEC.ImobLink.Unit;

import Role.Role;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Services.CustomUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CustomUserDetailsServiceTest {
    @Mock
    private UserRepository userRepository;

    private CustomUserDetailsService customUdtService;
    private User user;

    @BeforeEach
    void setUp() {
        customUdtService = new CustomUserDetailsService(userRepository);

        user = new User();
        user.setId(78L);
        user.setCpf("123456789");
        user.setPhoneNumber("546244526");
        user.setEmail("email092@email.com");
        user.setPassword("password");
        user.setName("name");
        user.setRole(Role.USER);
    }

    @Test
    void shouldReturnSpringUserDetails() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        customUdtService.loadUserByUsername(user.getEmail());

        verify(userRepository, times(1)).findByEmail(anyString());
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> customUdtService.loadUserByUsername("abc"));

        verify(userRepository, times(1)).findByEmail(anyString());
    }
}