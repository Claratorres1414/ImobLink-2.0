package com.PIEC.ImobLink.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.PIEC.ImobLink.Services.FollowService;
import com.PIEC.ImobLink.Entitys.Follow;

@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
public class FollowController {
    private final FollowService followService;

    @PostMapping("/{followerId}/follow/{followingId}")
    public ResponseEntity<Follow> followUser(@PathVariable Long followerId, @PathVariable Long followingId) {
        Follow follow = followService.follow(followerId, followingId);
        return ResponseEntity.ok(follow);
    }

    @DeleteMapping("/{followerId}/unfollow/{followingId}")
    public ResponseEntity<Void> unfollowUser(@PathVariable Long followerId, @PathVariable Long followingId) {
        followService.unfollow(followerId, followingId);
        return ResponseEntity.noContent().build();
    }
}
