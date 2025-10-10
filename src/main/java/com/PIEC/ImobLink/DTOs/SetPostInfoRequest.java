package com.PIEC.ImobLink.DTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SetPostInfoRequest {
    private String description;
    private double price;
    private String street;
    private String avenue;
    private String number;
}
