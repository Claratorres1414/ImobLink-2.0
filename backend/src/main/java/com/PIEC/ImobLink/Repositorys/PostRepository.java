package com.PIEC.ImobLink.Repositorys;

import com.PIEC.ImobLink.Entitys.Post;
import com.PIEC.ImobLink.Entitys.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

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

}


