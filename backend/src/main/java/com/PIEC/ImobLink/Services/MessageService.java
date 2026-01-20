package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.MessageResponse;
import com.PIEC.ImobLink.DTOs.UserDetails;
import com.PIEC.ImobLink.Entitys.Message;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.MessageRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ResponseEntity<MessageResponse> sendMessage(String content, Long userId, Authentication auth) throws IOException {
        String email = auth.getName();
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new IOException("User not found"));
        User receiver = userRepository.getReferenceById(userId);

        Message message = new Message();
        message.setContent(content);
        message.setSender(sender);
        message.setReceiver(receiver);
        try {
            messageRepository.save(message);
        } catch (Exception e) {
            throw new IOException("Erro ao salvar mensagem: " + e.getMessage());
        }
        return ResponseEntity.ok(new MessageResponse(message));
    }

    public ResponseEntity<List<MessageResponse>> getMessages(Long userId, Authentication auth) throws IOException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IOException("User not found"));

        List<Message> messages = messageRepository.findConversation(user.getId(), userId);

        List<MessageResponse> responses = messages.stream()
                .map(MessageResponse::new)
                .toList();

        return ResponseEntity.ok(responses);
    }

    public ResponseEntity<MessageResponse> editMessage(Long messageId, String content, Authentication auth) throws IOException {
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new IOException("User not found"));
        try {
            Message message = messageRepository.findMessageById(messageId);
            message.setContent(content);
            messageRepository.save(message);
            return ResponseEntity.ok(new MessageResponse(message));
        } catch (Exception e) {
            throw new IOException("Erro ao salvar mensagem: " + e.getMessage());
        }
    }

    public ResponseEntity<String> deleteMessage(Long messageId, Authentication auth) throws IOException {
        String email = auth.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new IOException("User not found"));
        try {
            messageRepository.deleteById(messageId);
            return ResponseEntity.ok("Mensagem deletada com sucesso!");
        } catch (Exception e) {
            throw new IOException("Erro ao deletar mensagem: " + e.getMessage());
        }
    }

    public ResponseEntity<List<UserDetails>> getContacts(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new io.jsonwebtoken.io.IOException("User not found"));
        List<Long> resp = messageRepository.findContacts(user.getId());
        List<User> contacts = userRepository.findAllById(resp);
        return ResponseEntity.ok(contacts.stream()
                .map(UserDetails :: new)
                .toList());
    }
}
