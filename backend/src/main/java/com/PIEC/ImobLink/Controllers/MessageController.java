package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.MessageResponse;
import com.PIEC.ImobLink.DTOs.UserDetails;
import com.PIEC.ImobLink.Services.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @GetMapping("/chats")
    public ResponseEntity<List<UserDetails>> getChats(Authentication auth) {
        return messageService.getContacts(auth);
    }

    @PostMapping("/send/{id}")
    public ResponseEntity<MessageResponse> sendMessage(@PathVariable Long id, @RequestParam String content, Authentication auth) throws IOException {
        return messageService.sendMessage(content, id, auth);
    }

    @GetMapping("/loadChat/{id}")
    public ResponseEntity<List<MessageResponse>> loadMessages(@PathVariable Long id, Authentication auth) throws IOException {
        return messageService.getMessages(id, auth);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteMessage(@PathVariable Long id, Authentication auth) throws IOException {
        return messageService.deleteMessage(id, auth);
    }
}
