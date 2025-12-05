package com.PIEC.ImobLink.DTOs;

import com.PIEC.ImobLink.Entitys.Message;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageResponse {
    private Long id;
    private String content;
    private LocalDateTime sendedAt;
    private Long senderId;
    private Long receiverId;

    public MessageResponse(Message message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.sendedAt = message.getSendedAt();
        this.senderId = message.getSender().getId();
        this.receiverId = message.getReceiver().getId();
    }
}
