package com.PIEC.ImobLink.DTOs;

public record PostRecommendationDTO(
        Long id,
        Long userId,
        Boolean wasLiked,
        String description,
        double price,
        String street,
        String avenue,
        String number,
        String type,
        int likedTimes,
        int views
) {}