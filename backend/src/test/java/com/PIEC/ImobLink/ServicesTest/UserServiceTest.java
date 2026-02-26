package com.PIEC.ImobLink.ServicesTest;

import Role.Role;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private ImageRepository imageRepository;

    @InjectMocks
    private UserService userService;

    User user;
    Authentication auth;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(70L);
        user.setCpf("123456789");
        user.setPhoneNumber("546244526");
        user.setEmail("email092@email.com");
        user.setPassword("password");
        user.setName("name");
        user.setRole(Role.USER);

        auth = new UsernamePasswordAuthenticationToken(user.getEmail(), "password");
    }

    @Test
    void shouldPromoteUser() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));
        when(userRepository.save(user))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Boolean response = userService.promoteUser(user.getEmail());

        assert response;
        verify(userRepository, times(1)).findByEmail(anyString());
        verify(userRepository, times(1)).save(user);
    }
}
