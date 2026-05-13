package com.PIEC.ImobLink.Repositorys;

import com.PIEC.ImobLink.Entitys.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByNormalizedName(String normalizedName);

    List<Tag> findTop10ByNormalizedNameContainingIgnoreCaseOrderByNameAsc(String query);

    List<Tag> findTop10ByOrderByNameAsc();
}