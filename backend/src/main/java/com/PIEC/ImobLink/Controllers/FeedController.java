package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.PostResponse;
import com.PIEC.ImobLink.Services.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
public class FeedController {
    private final PostService postService;

    @GetMapping
    public ResponseEntity<List<PostResponse>> getFeed() {
        return ResponseEntity.ok(postService.getFeed());
    }
}
