package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.ChatSummaryResponse;
import com.PIEC.ImobLink.DTOs.MessageResponse;
import com.PIEC.ImobLink.Entitys.Message;
import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.MessageRepository;
import com.PIEC.ImobLink.Repositorys.PostRepository;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Response.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final RequireUserService requireUserService;

    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(String content, Long postId, Long userId, Authentication auth) {
        User sender = requireUserService.requireUser(auth);

        if (userId.equals(sender.getId())) {
            throw new IllegalArgumentException("Você não pode enviar mensagem para si mesmo.");
        }

        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("A mensagem não pode estar vazia.");
        }

        User receiver = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Post relatedPost = null;
        if (postId != null) {
            relatedPost = postRepository.findById(postId)
                    .orElseThrow(() -> new IllegalArgumentException("Post não encontrado."));
        }

        Message message = new Message();
        message.setContent(content.trim());
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setPost(relatedPost);

        messageRepository.save(message);

        return ResponseUtil.ok(
                "Mensagem enviada com sucesso!",
                new MessageResponse(message)
        );
    }

    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(Long userId, Authentication auth) {
        User user = requireUserService.requireUser(auth);

        List<Message> messages = messageRepository.findConversation(user.getId(), userId);

        List<MessageResponse> responses = messages.stream()
                .map(MessageResponse::new)
                .toList();

        return ResponseUtil.ok(
                "Mensagens listadas com sucesso!",
                responses
        );
    }

    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(Long messageId, String content, Authentication auth) {
        User user = requireUserService.requireUser(auth);

        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("A mensagem não pode estar vazia.");
        }

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Mensagem não encontrada."));

        if (!message.getSender().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Você só pode editar mensagens enviadas por você.");
        }

        message.setContent(content.trim());
        messageRepository.save(message);

        return ResponseUtil.ok(
                "Mensagem editada com sucesso!",
                new MessageResponse(message)
        );
    }

    public ResponseEntity<ApiResponse<Void>> deleteMessage(Long messageId, Authentication auth) {
        User user = requireUserService.requireUser(auth);

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Mensagem não encontrada."));

        if (!message.getSender().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Você só pode deletar mensagens enviadas por você.");
        }

        messageRepository.delete(message);

        return ResponseUtil.noContent(
                "Mensagem deletada com sucesso!"
        );
    }

    public ResponseEntity<ApiResponse<List<ChatSummaryResponse>>> getContacts(Authentication auth) {
        User user = requireUserService.requireUser(auth);

        List<Long> contactIds = messageRepository.findContacts(user.getId());
        List<User> contacts = userRepository.findAllById(contactIds);

        List<ChatSummaryResponse> response = contacts.stream()
                .map(contact -> {
                    List<Message> latestMessages = messageRepository.findLatestMessageBetween(
                            user.getId(),
                            contact.getId(),
                            PageRequest.of(0, 1)
                    );

                    Message lastMessage = latestMessages.isEmpty() ? null : latestMessages.get(0);
                    return new ChatSummaryResponse(contact, lastMessage, user.getId());
                })
                .sorted(Comparator.comparing(
                        ChatSummaryResponse::getLastMessageAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .toList();

        return ResponseUtil.ok(
                "Contatos listados com sucesso!",
                response
        );
    }
}