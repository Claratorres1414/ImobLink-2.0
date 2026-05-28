package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.ChatSummaryResponse;
import com.PIEC.ImobLink.DTOs.MessageResponse;
import com.PIEC.ImobLink.DTOs.SendMessageRequest;
import com.PIEC.ImobLink.Response.ApiResponse;
import com.PIEC.ImobLink.Services.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Enviar mensagens e listar contatos")
@SecurityRequirement(name = "BearerAuth")
public class MessageController {
    private final MessageService messageService;

    @Operation(
            summary = "Listar conversas",
            description = "Busca a lista de conversas do usuário com última mensagem e dados do contato"
    )
    @GetMapping("/chats")
    public ResponseEntity<ApiResponse<List<ChatSummaryResponse>>> getChats(Authentication auth) {
        return messageService.getContacts(auth);
    }

    @Operation(
            summary = "Enviar mensagem",
            description = "Permite enviar uma mensagem a outro usuário, opcionalmente vinculada a um post"
    )
    @PostMapping("/send/{id}")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @PathVariable Long id,
            @RequestBody(required = false) SendMessageRequest request,
            @RequestParam(required = false) String content,
            Authentication auth
    ) {
        String finalContent = request != null && request.getContent() != null
                ? request.getContent()
                : content;

        Long postId = request != null ? request.getPostId() : null;

        return messageService.sendMessage(finalContent, postId, id, auth);
    }

    @Operation(
            summary = "Carregar histórico de conversa",
            description = "Carrega toda a conversa entre você e o outro usuário"
    )
    @GetMapping("/loadChat/{id}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> loadMessages(@PathVariable Long id, Authentication auth) {
        return messageService.getMessages(id, auth);
    }

    @Operation(
            summary = "Editar mensagem",
            description = "Permite editar o conteúdo de uma mensagem posteriormente enviada"
    )
    @PatchMapping("/edit/{mId}")
    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(
            @PathVariable Long mId,
            @RequestParam String content,
            Authentication auth
    ) {
        return messageService.editMessage(mId, content, auth);
    }

    @Operation(
            summary = "Deletar mensagem",
            description = "Permite deletar uma mensagem anteriormente enviada"
    )
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable Long id, Authentication auth) {
        return messageService.deleteMessage(id, auth);
    }
}