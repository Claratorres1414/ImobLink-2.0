package com.PIEC.ImobLink.Entitys;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "favs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Favs {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long authorId;
    private Long postId;

    @CreationTimestamp
    private LocalDateTime favAt;
}
