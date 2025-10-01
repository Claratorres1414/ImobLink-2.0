package com.PIEC.ImobLink.Repositorys;

import com.PIEC.ImobLink.Entitys.Images;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageRepository extends JpaRepository<Images, Long> {
    List<Images> findByUserId(Long userId);
}
