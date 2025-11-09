package com.PIEC.ImobLink.Repositorys;

import com.PIEC.ImobLink.Entitys.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    List<Comment> findAllByPostIdOrderByCreatedAtDesc(Long postId);
}
