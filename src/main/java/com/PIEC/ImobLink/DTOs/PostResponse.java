package com.PIEC.ImobLink.DTOs;

import com.PIEC.ImobLink.Entitys.Post;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
public class PostResponse {
    private String imageUrl;
    private String description;
    private double price;
    private String street;
    private String avenue;
    private LocalDateTime createdAt;
    private String createdBy;

    public PostResponse(Post post) {
        this.imageUrl = "/api/posts/" + post.getId() + "/image";
        this.description = post.getDescription();
        this.price = post.getPrice();
        this.street = post.getStreet();
        this.avenue = post.getAvenue();
        this.createdAt = post.getCreatedAt();
        this.createdBy = post.getUser().getName();
    }
}
