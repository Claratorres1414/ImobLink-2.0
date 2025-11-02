package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.UserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.PIEC.ImobLink.Services.FollowService;
import com.PIEC.ImobLink.Entitys.Follow;

import java.util.List;

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

    @GetMapping("/getFollowers")
    public ResponseEntity<List<UserDetails>> getFollowers(Authentication auth) {
        return ResponseEntity.ok(followService.getFollowers(auth));
    }

    @GetMapping("/getFollowings")
    public ResponseEntity<List<UserDetails>> getFollowings(Authentication auth) {
        return ResponseEntity.ok(followService.getFollowings(auth));
    }
}
