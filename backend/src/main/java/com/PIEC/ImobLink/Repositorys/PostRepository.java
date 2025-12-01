package com.PIEC.ImobLink.Repositorys;

import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByCreatedAtDesc();
    Post getPostById(Long id);
    List<Post> findTop10ByAvenueContainingIgnoreCase(String search);
}
