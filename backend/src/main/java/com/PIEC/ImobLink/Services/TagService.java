package com.PIEC.ImobLink.Services;

import com.PIEC.ImobLink.DTOs.TagResponse;
import com.PIEC.ImobLink.Entitys.Tag;
import com.PIEC.ImobLink.Repositorys.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    public String normalizeTagName(String name) {
        if (name == null) return "";

        String normalized = name.trim().toLowerCase();

        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        normalized = normalized.replaceAll("\\s+", " ");

        return normalized;
    }

    public String formatDisplayName(String name) {
        String normalized = normalizeTagName(name);

        if (normalized.isBlank()) return "";

        String[] words = normalized.split(" ");
        StringBuilder formatted = new StringBuilder();

        for (String word : words) {
            if (word.isBlank()) continue;

            formatted
                    .append(word.substring(0, 1).toUpperCase())
                    .append(word.length() > 1 ? word.substring(1) : "")
                    .append(" ");
        }

        return formatted.toString().trim();
    }

    public Tag getOrCreateTag(String rawName) {
        String normalizedName = normalizeTagName(rawName);

        if (normalizedName.isBlank()) {
            throw new IllegalArgumentException("Tag inválida");
        }

        return tagRepository.findByNormalizedName(normalizedName)
                .orElseGet(() -> {
                    Tag tag = new Tag();
                    tag.setName(formatDisplayName(rawName));
                    tag.setNormalizedName(normalizedName);
                    return tagRepository.save(tag);
                });
    }

    public List<Tag> getOrCreateTags(List<String> rawNames) {
        if (rawNames == null || rawNames.isEmpty()) {
            return new ArrayList<>();
        }

        Set<String> uniqueNames = new LinkedHashSet<>(rawNames);

        return new ArrayList<>(
                uniqueNames.stream()
                        .filter(name -> name != null && !name.trim().isBlank())
                        .map(this::getOrCreateTag)
                        .toList()
        );
    }

    public List<TagResponse> searchTags(String query) {
        String normalizedQuery = normalizeTagName(query);

        if (normalizedQuery.isBlank()) {
            return suggestions();
        }

        return tagRepository
                .searchUsedTags(normalizedQuery)
                .stream()
                .limit(10)
                .map(TagResponse::new)
                .toList();
    }

    public List<TagResponse> suggestions() {
        return tagRepository
                .findTop10UsedTags()
                .stream()
                .limit(10)
                .map(TagResponse::new)
                .toList();
    }
}