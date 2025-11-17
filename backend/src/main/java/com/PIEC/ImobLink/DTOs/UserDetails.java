package com.PIEC.ImobLink.DTOs;

import com.PIEC.ImobLink.Entitys.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDetails {
    private Long id;
    private String imageProfilePath;
    private Long imageProfileId;
    private String email;
    private String name;
    private String phoneNumber;
    private String bio;
    private String role;
    private int followers;
    private int followings;

    public UserDetails(User user) {
        this.id = user.getId();
        this.imageProfilePath = user.getImageProfilePath();
        this.imageProfileId = user.getImageProfileId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.phoneNumber = user.getPhoneNumber();
        this.bio = user.getBio();
        this.role = user.getRole().toString();
        this.followers = user.getFollowers().size();
        this.followings = user.getFollowings().size();
    }
}
