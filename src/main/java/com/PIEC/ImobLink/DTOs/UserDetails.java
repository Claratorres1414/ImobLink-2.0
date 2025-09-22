package com.PIEC.ImobLink.DTOs;

import com.PIEC.ImobLink.Entitys.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDetails {
    private String email;
    private String name;
    private String phoneNumber;
    private String bio;
    private String role;

    public UserDetails(User user) {
        this.email = user.getEmail();
        this.name = user.getName();
        this.phoneNumber = user.getPhoneNumber();
        this.bio = user.getBio();
        this.role = user.getRole().toString();
    }
}
