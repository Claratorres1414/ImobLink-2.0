package com.PIEC.ImobLink.Repositorys;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.PIEC.ImobLink.Entitys.Post;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByCreatedAtDesc();
    Post getPostById(Long id);
    List<Post> findTop10ByAvenueContainingIgnoreCase(String search);
    List<Post> findTop10ByStreetContainingIgnoreCase(String search);

    @Query("""
        SELECT DISTINCT p FROM Post p
        JOIN p.tags t
        WHERE t.normalizedName = :normalizedName
        ORDER BY p.createdAt DESC
        """)
    List<Post> findByTagNormalizedName(@Param("normalizedName") String normalizedName);

    @Query("SELECT COUNT(r) FROM Post p JOIN p.reacheds r WHERE p.id = :id")
    Long countReacheds(@Param("id") Long id);
}


