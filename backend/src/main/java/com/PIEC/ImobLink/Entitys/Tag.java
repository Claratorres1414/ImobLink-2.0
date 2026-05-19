package com.PIEC.ImobLink.Entitys;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "tags",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "normalized_name")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "normalized_name", nullable = false, unique = true)
    private String normalizedName;

    @ManyToMany(mappedBy = "tags")
    private List<Post> posts = new ArrayList<>();
}