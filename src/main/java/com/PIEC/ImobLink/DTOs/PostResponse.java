package com.PIEC.ImobLink.DTOs;

import com.PIEC.ImobLink.Entitys.Post;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
public class PostResponse {
    private Long id;
    private String imageAdresse;
    private String description;
    private double price;
    private String street;
    private String avenue;
    private LocalDateTime createdAt;
    private String createdBy;
    private String number;

    public PostResponse(Post post) {
        this.id = post.getId();
        this.imageAdresse = "/api/images/" + post.getId() + "/post";
        this.description = post.getDescription();
        this.price = post.getPrice();
        this.street = post.getStreet();
        this.avenue = post.getAvenue();
        this.number = post.getNumber();
        this.createdAt = post.getCreatedAt();
        this.createdBy = post.getUser().getName();
    }
}
