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

    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(String content, Long userId, Authentication auth) {
        String email = auth.getName();
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        User receiver = userRepository.getReferenceById(userId);

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
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Message> messages = messageRepository.findConversation(user.getId(), userId);

        List<MessageResponse> responses = messages.stream()
                .map(MessageResponse::new)
                .toList();

        return ResponseUtil.ok(
                "Mensagens listadas com sucesso!",
                responses);
    }

    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(Long messageId, String content, Authentication auth) {
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Message message = messageRepository.findMessageById(messageId);
        message.setContent(content);
        messageRepository.save(message);
        return ResponseUtil.ok(
                "Mensagem editada com sucesso!",
                new MessageResponse(message));
    }

    public ResponseEntity<ApiResponse<Void>> deleteMessage(Long messageId, Authentication auth) {
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        messageRepository.deleteById(messageId);
        return ResponseUtil.noContent(
                "Mensagem deletada com sucesso!"
        );
    }

    public ResponseEntity<ApiResponse<List<UserDetails>>> getContacts(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Long> resp = messageRepository.findContacts(user.getId());
        List<User> contacts = userRepository.findAllById(resp);

        return ResponseUtil.ok(
                "Contatos listados com sucesso!",
                contacts.stream()
                .map(UserDetails :: new)
                .toList());
    }
}
