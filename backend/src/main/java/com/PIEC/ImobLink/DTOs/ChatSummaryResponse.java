package com.PIEC.ImobLink.DTOs;

import com.PIEC.ImobLink.Entitys.Message;
import com.PIEC.ImobLink.Entitys.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChatSummaryResponse {
    private Long userId;
    private String userName;
    private String userEmail;
    private Long imageProfileId;

    private Long lastMessageId;
    private String lastMessageContent;
    private LocalDateTime lastMessageAt;
    private Long lastSenderId;
    private boolean lastMessageFromMe;

    private Long postId;
    private String postDescription;
    private Double postPrice;
    private String postThumb;

    public ChatSummaryResponse(User otherUser, Message lastMessage, Long myUserId) {
        this.userId = otherUser.getId();
        this.userName = otherUser.getName();
        this.userEmail = otherUser.getEmail();
        this.imageProfileId = otherUser.getImageProfileId();

        if (lastMessage != null) {
            this.lastMessageId = lastMessage.getId();
            this.lastMessageContent = lastMessage.getContent();
            this.lastMessageAt = lastMessage.getSendedAt();
            this.lastSenderId = lastMessage.getSender().getId();
            this.lastMessageFromMe = lastMessage.getSender().getId().equals(myUserId);

            if (lastMessage.getPost() != null) {
                this.postId = lastMessage.getPost().getId();
                this.postDescription = lastMessage.getPost().getDescription();
                this.postPrice = lastMessage.getPost().getPrice();
                this.postThumb = "/api/images/" + lastMessage.getPost().getId() + "/post/thumb";
            }
        }
    }
}