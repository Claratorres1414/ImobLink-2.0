package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.MessageResponse;
import com.PIEC.ImobLink.DTOs.UserDetails;
import com.PIEC.ImobLink.Entitys.Message;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.MessageRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Response.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final RequireUserService requireUserService;

    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(String content, Long userId, Authentication auth) {
        User sender = requireUserService.requireUser(auth);
        User receiver = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Message message = new Message();
        message.setContent(content);
        message.setSender(sender);
        message.setReceiver(receiver);

        messageRepository.save(message);

        return ResponseUtil.ok(
                "Mensagem enviada com sucesso!",
                new MessageResponse(message));
    }

    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(Long userId, Authentication auth) {
        User user = requireUserService.requireUser(auth);

        List<Message> messages = messageRepository.findConversation(user.getId(), userId);

        List<MessageResponse> responses = messages.stream()
                .map(MessageResponse::new)
                .toList();

        return ResponseUtil.ok(
                "Mensagens listadas com sucesso!",
                responses);
    }

    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(Long messageId, String content, Authentication auth) {
        requireUserService.requireUser(auth);

        Message message = messageRepository.findMessageById(messageId);
        message.setContent(content);
        messageRepository.save(message);
        return ResponseUtil.ok(
                "Mensagem editada com sucesso!",
                new MessageResponse(message));
    }

    public ResponseEntity<ApiResponse<Void>> deleteMessage(Long messageId, Authentication auth) {
        requireUserService.requireUser(auth);

        messageRepository.deleteById(messageId);
        return ResponseUtil.noContent(
                "Mensagem deletada com sucesso!"
        );
    }

    public ResponseEntity<ApiResponse<List<UserDetails>>> getContacts(Authentication auth) {
        User user = requireUserService.requireUser(auth);

        List<Long> resp = messageRepository.findContacts(user.getId());
        List<User> contacts = userRepository.findAllById(resp);

        return ResponseUtil.ok(
                "Contatos listados com sucesso!",
                contacts.stream()
                .map(UserDetails :: new)
                .toList());
    }
}
