package com.PIEC.ImobLink.DTOs;

import com.PIEC.ImobLink.Entitys.Tag;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TagResponse {

    private Long id;
    private String name;
    private String normalizedName;
    private int postsCount;

    public TagResponse(Tag tag) {
        this.id = tag.getId();
        this.name = tag.getName();
        this.normalizedName = tag.getNormalizedName();
        this.postsCount = tag.getPosts() != null ? tag.getPosts().size() : 0;
    }
}