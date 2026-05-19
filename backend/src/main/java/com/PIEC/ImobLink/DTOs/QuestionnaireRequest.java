package com.PIEC.ImobLink.DTOs;

import lombok.Data;

@Data
public class QuestionnaireRequest {
    private String objective;
    private String propertyType;
    private String priceRange;
}