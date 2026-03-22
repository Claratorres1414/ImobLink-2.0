package com.PIEC.ImobLink.DTOs;

import lombok.Data;

@Data
public class PostRequest {
    private String description;
    private double price;
    private String street;
    private String avenue;
    private String number;
    private String type;
}
