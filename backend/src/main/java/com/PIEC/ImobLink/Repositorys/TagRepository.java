package com.PIEC.ImobLink.Repositorys;

import com.PIEC.ImobLink.Entitys.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByNormalizedName(String normalizedName);

    List<Tag> findTop10ByNormalizedNameContainingIgnoreCaseOrderByNameAsc(String query);

    List<Tag> findTop10ByOrderByNameAsc();

    @Query("""
        SELECT t FROM Tag t
        WHERE SIZE(t.posts) > 0
        ORDER BY SIZE(t.posts) DESC, t.name ASC
        """)
    List<Tag> findTop10UsedTags();

    @Query("""
        SELECT t FROM Tag t
        WHERE SIZE(t.posts) > 0
        AND LOWER(t.normalizedName) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY SIZE(t.posts) DESC, t.name ASC
        """)
    List<Tag> searchUsedTags(String query);
}

