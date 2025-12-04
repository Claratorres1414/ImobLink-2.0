package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.MessageResponse;
import com.PIEC.ImobLink.Entitys.Message;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.MessageRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ResponseEntity<String> sendMessage(String content, Long userId, Authentication auth) throws IOException {
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
        return ResponseEntity.ok("Mensagem enviada com sucesso!");
    }

    public ResponseEntity<List<MessageResponse>> getMessages(Long userId, Authentication auth) throws IOException {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IOException("User not found"));
        List<Message> messages = messageRepository.searchMessageBySenderAndReceiverId(user.getId(), userId);
        List<MessageResponse> responses = new ArrayList<>();
        for (Message message : messages) {
            MessageResponse messageResponse = new MessageResponse(message);
            responses.add(messageResponse);
        }
        return ResponseEntity.ok(responses);
    }
}
