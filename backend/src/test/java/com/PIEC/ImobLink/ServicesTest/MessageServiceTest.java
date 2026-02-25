package com.PIEC.ImobLink.ServicesTest;

import Role.Role;
import com.PIEC.ImobLink.Entitys.Message;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.MessageRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Services.MessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MessageServiceTest {
    @Mock
    private MessageRepository messageRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MessageService messageService;

    User user1;
    User user2;
    Authentication auth;
    Message message;

    @BeforeEach
    void setUp() {
        user1 = new User();
        user1.setId(70L);
        user1.setCpf("123456789");
        user1.setPhoneNumber("546244526");
        user1.setEmail("email092@email.com");
        user1.setPassword("password");
        user1.setName("name");
        user1.setRole(Role.USER);

        user2 = new User();
        user2.setId(80L);
        user2.setCpf("123456700");
        user2.setPhoneNumber("546244500");
        user2.setEmail("email091@email.com");
        user2.setPassword("password");
        user2.setName("name");
        user2.setRole(Role.USER);

        message = new Message();
        message.setId(1L);
        message.setContent("content");
        message.setSender(user1);
        message.setReceiver(user2);

        auth = new UsernamePasswordAuthenticationToken(user1.getEmail(), user1.getPassword());
    }

    @Test
    void shouldSendMessageToUser() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));
        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.of(user2));

        when(messageRepository.save(any(Message.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        messageService.sendMessage("aaa", user2.getId(), auth);

        verify(userRepository, times(1)).findByEmail(anyString());
        verify(userRepository, times(1)).findById(anyLong());
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    void shouldNotSendMessageToUserBecauseOfUserNotFoundForOfferedAuth() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.empty());

        Authentication authFake = new UsernamePasswordAuthenticationToken("aaaaaaa", user1.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> messageService.sendMessage("aaa", user2.getId(), authFake));
    }

    @Test
    void shouldNotSendMessageToUserBecauseOfUserNotFoundForOfferedId() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));
        when(userRepository.findById(anyLong()))
                .thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> messageService.sendMessage("aaa", 5L, auth));
    }

    @Test
    void shouldGetMessageFromUserToUser() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));
        when(messageRepository.findConversation(anyLong(), anyLong()))
                .thenReturn(List.of(message));

        messageService.getMessages(user2.getId(), auth);

        verify(userRepository, times(1)).findByEmail(anyString());
        verify(messageRepository, times(1)).findConversation(anyLong(), anyLong());
    }

    @Test
    void shouldNotGetMessageFromUserToUserBecauseOfUserNotFoundForOfferedAuth() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.empty());

        Authentication authFake = new UsernamePasswordAuthenticationToken("aaaaaaa", user1.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> messageService.getMessages(user2.getId(), authFake));
    }

    @Test
    void shouldEditMessageFromUserToUser() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));
        when(messageRepository.findMessageById(anyLong()))
                .thenReturn(message);
        when(messageRepository.save(any(Message.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        messageService.editMessage(message.getId(), "aaaaa", auth);

        verify(userRepository, times(1)).findByEmail(anyString());
        verify(messageRepository, times(1)).findMessageById(anyLong());
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    void shouldNotEditMessageFromUserToUserBecauseOfUserNotFoundForOfferedAuth() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.empty());

        Authentication authFake = new UsernamePasswordAuthenticationToken("aaaaaaa", user1.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> messageService.editMessage(message.getId(), "aaaaa", authFake));
    }

    @Test
    void shouldDeleteMessageFromUserToUser() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));

        messageService.deleteMessage(message.getId(), auth);

        verify(userRepository, times(1)).findByEmail(anyString());
        verify(messageRepository, times(1)).deleteById(anyLong());
    }

    @Test
    void shouldNotDeleteMessageFromUserToUserBecauseOfUserNotFoundForOfferedAuth() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.empty());

        Authentication authFake = new UsernamePasswordAuthenticationToken("aaaaaaa", user1.getPassword());

        assertThrows(UsernameNotFoundException.class,
                () -> messageService.deleteMessage(message.getId(), authFake));
    }

    @Test
    void shouldListAllUserContacts() {
        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user1));
        when(messageRepository.findContacts(anyLong()))
                .thenReturn(List.of(user2.getId()));
        when(userRepository.findAllById(anyList()))
                .thenReturn(List.of(user2));

        messageService.getContacts(auth);

        verify(userRepository, times(1)).findByEmail(anyString());
        verify(messageRepository, times(1)).findContacts(anyLong());
        verify(userRepository, times(1)).findAllById(anyList());
    }
}
