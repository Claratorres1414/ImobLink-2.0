package com.PIEC.ImobLink.Unit;

import Role.Role;
import com.PIEC.ImobLink.DTOs.DeleteProfileRequest;
import com.PIEC.ImobLink.DTOs.SetInfoRequest;
import com.PIEC.ImobLink.DTOs.SetPasswordRequest;
import com.PIEC.ImobLink.DTOs.UserDetails;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.ImageRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Services.RequireUserService;
import com.PIEC.ImobLink.Services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private ImageRepository imageRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private RequireUserService requireUserService;

    @InjectMocks
    private UserService userService;

    User user;
    User user2;
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

        user2 = new User();
        user2.setId(80L);
        user2.setCpf("123456700");
        user2.setPhoneNumber("546244500");
        user2.setEmail("email091@email.com");
        user2.setPassword("password");
        user2.setName("name");
        user2.setRole(Role.USER);

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

    @Test
    void shouldNotPromoteUserBecauseOfUserNotFound() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> userService.promoteUser(user.getEmail()));
    }

    @Test
    void shouldLoadCurrentUser() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        userService.loadUser(auth);
    }

    @Test
     void shouldNotLoadCurrentUserBecauseOfUserNotFound() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("user not found"));

        Authentication auth = new UsernamePasswordAuthenticationToken("aaa", "password");

        assertThrows(UsernameNotFoundException.class,
                () -> userService.loadUser(auth));
    }

    @Test
    void shouldLoadUserById() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);
        when(userRepository.getReferenceById(anyLong()))
                .thenReturn(user2);

        userService.loadUserById(user2.getId(), auth);
        verify(userRepository, times(1)).getReferenceById(anyLong());
    }

    @Test
    void shouldNotLoadUserByIdBecauseOfUserNotFoundForTheCurrentUser() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("user not found"));

        Authentication auth = new UsernamePasswordAuthenticationToken("aaa", "password");

        assertThrows(UsernameNotFoundException.class,
                () -> userService.loadUserById(user2.getId(), auth));
    }

    @Test
    void shouldLoadAllUsers() {
        when(userRepository.findAll())
                .thenReturn(List.of(user, user2));

        List<UserDetails> users = userService.loadAllUsers();

        assert users.size() == 2;
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void shouldSearchForUserByEmail() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);
        when(userRepository.findTop10ByEmailContainingIgnoreCase(anyString()))
                .thenReturn(List.of(user2));

        userService.searchUsers("eMAIl091", auth);

        verify(userRepository, times(1)).findTop10ByEmailContainingIgnoreCase(anyString());
    }

    @Test
    void shouldNotSearchForUserByEmailBecauseOfUserNotFoundForTheCurrentUser() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("user not found"));
        Authentication auth = new UsernamePasswordAuthenticationToken("aaa", "password");

        assertThrows(UsernameNotFoundException.class,
                () -> userService.searchUsers("eMAIl091", auth));
    }

    @Test
    void shouldSetUserInformation() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);
        when(userRepository.save(user))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SetInfoRequest setInfo = new SetInfoRequest("aaaaa", null, "00000");
        userService.setInfo(setInfo, auth);

        assert user.getBio().equals("aaaaa");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void shouldNotSetUserInformationBecauseOfUserNotFound () {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("user not found"));
        Authentication auth = new UsernamePasswordAuthenticationToken("aaa", "password");

        assertThrows(UsernameNotFoundException.class,
                () -> userService.setInfo(new SetInfoRequest("alalfjlajf", null, null), auth));
    }

    @Test
    void shouldSetUserPassword() throws AccessDeniedException {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);
        when(passwordEncoder.matches(anyString(), anyString()))
                .thenReturn(true);
        when(userRepository.save(user))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SetPasswordRequest setPassword = new SetPasswordRequest(user.getPassword(), "abc");
        Boolean resp = userService.setPassword(setPassword, auth);

        assert resp;
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void shouldNotSetUserPasswordBecauseOfUserNotFound () {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("user not found"));
        Authentication auth = new UsernamePasswordAuthenticationToken("aaa", "password");

        assertThrows(UsernameNotFoundException.class,
                () -> userService.setPassword(new SetPasswordRequest("adoadoado", "abc"), auth));
    }

    @Test
    void shouldNotSetUserPasswordBecauseOfWrongPassword() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);
        when(passwordEncoder.matches(anyString(), anyString()))
                .thenReturn(false);

        SetPasswordRequest setPassword = new SetPasswordRequest("aaa", "abc");
        assertThrows(AccessDeniedException.class,
                () -> userService.setPassword(setPassword, auth));
    }

    @Test
    void shouldNotSetUserPasswordBecauseOfNullPassword() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        SetPasswordRequest setPassword = new SetPasswordRequest(user.getPassword(), null);
        assertThrows(AccessDeniedException.class,
                () -> userService.setPassword(setPassword, auth));
    }

    @Test
    void shouldNotSetUserPasswordBecauseOfSamePassword () {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);

        SetPasswordRequest setPassword = new SetPasswordRequest(user.getPassword(), user.getPassword());
        assertThrows(AccessDeniedException.class,
                () -> userService.setPassword(setPassword, auth));
    }

    @Test
    void shouldDeleteUserProfile() throws IOException {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);
        when(passwordEncoder.matches(anyString(), anyString()))
                .thenReturn(true);

        userService.deleteProfile(new DeleteProfileRequest(user.getPassword()), auth);

        verify(imageRepository, times(1)).deleteByUserId(anyLong());
        verify(userRepository, times(1)).delete(user);
    }

    @Test
    void shouldNotDeleteUserProfileBecauseOfUserNotFound() {
        when(requireUserService.requireUser(any()))
                .thenThrow(new UsernameNotFoundException("user not found"));

        Authentication auth = new UsernamePasswordAuthenticationToken("aaa", "password");

        assertThrows(UsernameNotFoundException.class,
                () -> userService.deleteProfile(new DeleteProfileRequest(user.getPassword()), auth));
    }

    @Test
    void shouldNotDeleteUserProfileBecauseOfWrongPassword() {
        when(requireUserService.requireUser(any()))
                .thenReturn(user);
        when(passwordEncoder.matches(anyString(), anyString()))
                .thenReturn(false);

        DeleteProfileRequest request = new DeleteProfileRequest("aaa");
        assertThrows(AccessDeniedException.class,
                () -> userService.deleteProfile(request, auth));
    }
}
