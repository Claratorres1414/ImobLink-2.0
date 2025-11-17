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

    @PostMapping("/comment/post/{postId}")
    public ResponseEntity<CommentResponse> addCommentPost(@RequestBody CommentRequest commentRequest, @PathVariable Long postId, Authentication auth) {
        return ResponseEntity.ok(commentsService.commentPost(commentRequest, postId, auth));
    }

    @GetMapping("/getComments/{userId}")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long userId, Authentication auth) {
        return ResponseEntity.ok(commentsService.getCommentsByUserId(userId, auth));
    }

    @GetMapping("/getComments/post/{postId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByPost(@PathVariable Long postId, Authentication auth) {
        return ResponseEntity.ok(commentsService.getCommentsByPostId(postId, auth));
    }

    @DeleteMapping("/deleteComment/{id}")
    public ResponseEntity<String> deleteComment(@PathVariable Long id, Authentication auth) {
        boolean res = commentsService.deleteComment(id, auth);
        if (res) {
            return ResponseEntity.ok("Comment deleted");
        }
        return ResponseEntity.badRequest().body("Não foi possível deletar o comentário");
    }
}
