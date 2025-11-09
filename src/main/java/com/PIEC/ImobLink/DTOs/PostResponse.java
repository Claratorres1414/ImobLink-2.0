package com.PIEC.ImobLink.DTOs;

import com.PIEC.ImobLink.Entitys.Comment;
import com.PIEC.ImobLink.Entitys.Post;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class PostResponse {
    private Long id;
    private String firstImageAdresse;
    private String allImagesAdresse;
    private String description;
    private double price;
    private String street;
    private String avenue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String number;
    private int favedTimes;
    private int likedTimes;
    private int views;
    private int reachedTimes;
    private Long userId;
    private boolean wasFaved;
    private boolean wasLiked;
    private List<CommentResponse> comments = new ArrayList<>();

    public PostResponse(Post post) {
        this.id = post.getId();
        this.firstImageAdresse = "/api/images/" + post.getId() + "/post/thumb";
        this.allImagesAdresse = "/api/images/" + post.getId() + "/post/all";
        this.description = post.getDescription();
        this.price = post.getPrice();
        this.street = post.getStreet();
        this.avenue = post.getAvenue();
        this.number = post.getNumber();
        this.favedTimes = post.getFavedTimes().size();
        this.likedTimes = post.getLikedTimes().size();
        this.views = post.getViews();
        this.reachedTimes = post.getReacheds().size();
        this.wasFaved = false;
        this.wasLiked = false;
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
        this.createdBy = post.getUser().getName();
        this.userId = post.getUser().getId();
    }

    public void addComment(Comment comment) {
        comments.add(new CommentResponse(comment));
    }
}
