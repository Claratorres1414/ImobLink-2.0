package com.PIEC.ImobLink.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.PIEC.ImobLink.Services.FollowService;
import com.PIEC.ImobLink.Entitys.Follow;

@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
public class FollowController {
    private final FollowService followService;

    @PostMapping("/{followingId}")
    public ResponseEntity<String> followUser(@PathVariable Long followingId, Authentication auth) {
        Follow follow = followService.follow(auth, followingId);
        if (follow == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok("Following " + followingId);
    }

    @DeleteMapping("/unfollow/{followingId}")
    public ResponseEntity<String> unfollowUser(@PathVariable Long followingId, Authentication auth) {
        followService.unfollow(auth, followingId);
        return ResponseEntity.ok("Unfollowing " + followingId);
    }
}
