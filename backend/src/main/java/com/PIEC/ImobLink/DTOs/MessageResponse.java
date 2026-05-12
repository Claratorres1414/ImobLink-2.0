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
    private String senderName;

    private Long receiverId;
    private String receiverName;

    private Long postId;
    private String postDescription;
    private Double postPrice;
    private String postThumb;
    private Long postOwnerId;

    public MessageResponse(Message message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.sendedAt = message.getSendedAt();

        this.senderId = message.getSender().getId();
        this.senderName = message.getSender().getName();

        this.receiverId = message.getReceiver().getId();
        this.receiverName = message.getReceiver().getName();

        if (message.getPost() != null) {
            this.postId = message.getPost().getId();
            this.postDescription = message.getPost().getDescription();
            this.postPrice = message.getPost().getPrice();
            this.postThumb = "/api/images/" + message.getPost().getId() + "/post/thumb";
            this.postOwnerId = message.getPost().getUser().getId();
        }
    }
}