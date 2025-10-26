package com.PIEC.ImobLink.Controllers;

import com.PIEC.ImobLink.DTOs.CommentRequest;
import com.PIEC.ImobLink.DTOs.CommentResponse;
import com.PIEC.ImobLink.Services.CommentsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentsController {
    private final CommentsService commentsService;

    @PostMapping("/comment/{userId}")
    public ResponseEntity<CommentResponse> addComment(@RequestBody CommentRequest commentRequest, @PathVariable Long userId, Authentication auth) {
        return ResponseEntity.ok(commentsService.comment(commentRequest, userId, auth));
    }

    @GetMapping("/getComments/{userId}")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long userId, Authentication auth) {
        return ResponseEntity.ok(commentsService.getCommentsByUserId(userId, auth));
    }
}
