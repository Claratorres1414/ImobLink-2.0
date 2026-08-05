package com.PIEC.ImobLink.Unit;

import com.PIEC.ImobLink.DTOs.TagResponse;
import com.PIEC.ImobLink.Entitys.Tag;
import com.PIEC.ImobLink.Repositorys.TagRepository;
import com.PIEC.ImobLink.Services.TagService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private TagService tagService;

    @Nested
    @DisplayName("normalizeTagName Tests")
    class NormalizeTagNameTests {

        @Test
        @DisplayName("Deve normalizar nome da tag removendo espaços e acentos")
        void shouldNormalizeTagName() {

            String result = tagService.normalizeTagName("  ÁREA   GOURMET  ");

            assertEquals("area gourmet", result);
        }

        @Test
        @DisplayName("Deve retornar string vazia quando nome for null")
        void shouldReturnEmptyStringWhenNameIsNull() {

            String result = tagService.normalizeTagName(null);

            assertEquals("", result);
        }

        @Test
        @DisplayName("Deve transformar texto em lowercase")
        void shouldConvertToLowerCase() {

            String result = tagService.normalizeTagName("PISCINA");

            assertEquals("piscina", result);
        }

        @Test
        @DisplayName("Deve remover múltiplos espaços")
        void shouldRemoveMultipleSpaces() {

            String result = tagService.normalizeTagName("area      gourmet");

            assertEquals("area gourmet", result);
        }
    }

    @Nested
    @DisplayName("formatDisplayName Tests")
    class FormatDisplayNameTests {

        @Test
        @DisplayName("Deve formatar nome para exibição")
        void shouldFormatDisplayName() {

            String result = tagService.formatDisplayName("  area gourmet  ");

            assertEquals("Area Gourmet", result);
        }

        @Test
        @DisplayName("Deve retornar vazio para texto vazio")
        void shouldReturnEmptyStringForBlankText() {

            String result = tagService.formatDisplayName("   ");

            assertEquals("", result);
        }

        @Test
        @DisplayName("Deve capitalizar palavras corretamente")
        void shouldCapitalizeWordsCorrectly() {

            String result = tagService.formatDisplayName("piscina aquecida");

            assertEquals("Piscina Aquecida", result);
        }
    }

    @Nested
    @DisplayName("getOrCreateTag Tests")
    class GetOrCreateTagTests {

        @Test
        @DisplayName("Deve retornar tag existente")
        void shouldReturnExistingTag() {

            Tag existingTag = new Tag();
            existingTag.setName("Piscina");
            existingTag.setNormalizedName("piscina");

            when(tagRepository.findByNormalizedName("piscina"))
                    .thenReturn(Optional.of(existingTag));

            Tag result = tagService.getOrCreateTag("Piscina");

            assertNotNull(result);
            assertEquals("Piscina", result.getName());

            verify(tagRepository, never()).save(any());
        }

        @Test
        @DisplayName("Deve criar nova tag quando não existir")
        void shouldCreateNewTagWhenNotExists() {

            when(tagRepository.findByNormalizedName("area gourmet"))
                    .thenReturn(Optional.empty());

            Tag savedTag = new Tag();
            savedTag.setName("Area Gourmet");
            savedTag.setNormalizedName("area gourmet");

            when(tagRepository.save(any(Tag.class)))
                    .thenReturn(savedTag);

            Tag result = tagService.getOrCreateTag("Área Gourmet");

            assertNotNull(result);
            assertEquals("Area Gourmet", result.getName());
            assertEquals("area gourmet", result.getNormalizedName());

            ArgumentCaptor<Tag> tagCaptor =
                    ArgumentCaptor.forClass(Tag.class);

            verify(tagRepository).save(tagCaptor.capture());

            Tag capturedTag = tagCaptor.getValue();

            assertEquals("Area Gourmet", capturedTag.getName());
            assertEquals("area gourmet", capturedTag.getNormalizedName());
        }

        @Test
        @DisplayName("Deve lançar exceção para tag inválida")
        void shouldThrowExceptionForInvalidTag() {

            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> tagService.getOrCreateTag("   ")
            );

            assertEquals(
                    "Tag inválida",
                    exception.getMessage()
            );

            verify(tagRepository, never()).save(any());
        }

        @Test
        @DisplayName("Deve lançar exceção para tag null")
        void shouldThrowExceptionForNullTag() {

            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> tagService.getOrCreateTag(null)
            );

            assertEquals(
                    "Tag inválida",
                    exception.getMessage()
            );

            verify(tagRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("getOrCreateTags Tests")
    class GetOrCreateTagsTests {

        @Test
        @DisplayName("Deve retornar lista vazia quando lista for null")
        void shouldReturnEmptyListWhenListIsNull() {

            List<Tag> result = tagService.getOrCreateTags(null);

            assertNotNull(result);
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Deve retornar lista vazia quando lista estiver vazia")
        void shouldReturnEmptyListWhenListIsEmpty() {

            List<Tag> result = tagService.getOrCreateTags(List.of());

            assertNotNull(result);
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Deve ignorar tags duplicadas")
        void shouldIgnoreDuplicateTags() {

            Tag piscina = new Tag();
            piscina.setName("Piscina");
            piscina.setNormalizedName("piscina");

            when(tagRepository.findByNormalizedName("piscina"))
                    .thenReturn(Optional.of(piscina));

            List<Tag> result = tagService.getOrCreateTags(
                    List.of(
                            "Piscina",
                            "Piscina",
                            "  Piscina  "
                    )
            );

            assertEquals(1, result.size());

            verify(tagRepository, times(1))
                    .findByNormalizedName("piscina");
        }

        @Test
        @DisplayName("Deve ignorar tags nulas ou vazias")
        void shouldIgnoreNullOrBlankTags() {

            Tag piscina = new Tag();
            piscina.setName("Piscina");
            piscina.setNormalizedName("piscina");

            when(tagRepository.findByNormalizedName("piscina"))
                    .thenReturn(Optional.of(piscina));

            List<Tag> result = tagService.getOrCreateTags(
                    Arrays.asList(
                            null,
                            "",
                            "   ",
                            "Piscina"
                    )
            );

            assertEquals(1, result.size());
        }
    }

    @Nested
    @DisplayName("searchTags Tests")
    class SearchTagsTests {

        @Test
        @DisplayName("Deve buscar tags normalizando query")
        void shouldSearchTagsUsingNormalizedQuery() {

            Tag tag = new Tag();
            tag.setName("Área Gourmet");
            tag.setNormalizedName("area gourmet");

            when(tagRepository.searchUsedTags("area gourmet"))
                    .thenReturn(List.of(tag));

            List<TagResponse> result =
                    tagService.searchTags("ÁREA GOURMET");

            assertNotNull(result);
            assertEquals(1, result.size());

            verify(tagRepository)
                    .searchUsedTags("area gourmet");
        }

        @Test
        @DisplayName("Deve retornar sugestões quando query estiver vazia")
        void shouldReturnSuggestionsWhenQueryIsBlank() {

            when(tagRepository.findTop10UsedTags())
                    .thenReturn(List.of());

            List<TagResponse> result =
                    tagService.searchTags("   ");

            assertNotNull(result);

            verify(tagRepository)
                    .findTop10UsedTags();

            verify(tagRepository, never())
                    .searchUsedTags(any());
        }

        @Test
        @DisplayName("Deve limitar resultado de busca em 10 tags")
        void shouldLimitSearchResultsTo10Tags() {

            List<Tag> tags = List.of(
                    new Tag(), new Tag(), new Tag(), new Tag(), new Tag(),
                    new Tag(), new Tag(), new Tag(), new Tag(), new Tag(),
                    new Tag(), new Tag()
            );

            when(tagRepository.searchUsedTags("piscina"))
                    .thenReturn(tags);

            List<TagResponse> result =
                    tagService.searchTags("Piscina");

            assertEquals(10, result.size());
        }
    }

    @Nested
    @DisplayName("suggestions Tests")
    class SuggestionsTests {

        @Test
        @DisplayName("Deve retornar sugestões limitadas a 10")
        void shouldReturnSuggestionsLimitedTo10() {

            List<Tag> tags = List.of(
                    new Tag(), new Tag(), new Tag(), new Tag(), new Tag(),
                    new Tag(), new Tag(), new Tag(), new Tag(), new Tag(),
                    new Tag(), new Tag()
            );

            when(tagRepository.findTop10UsedTags())
                    .thenReturn(tags);

            List<TagResponse> result = tagService.suggestions();

            assertEquals(10, result.size());

            verify(tagRepository)
                    .findTop10UsedTags();
        }

        @Test
        @DisplayName("Deve retornar lista vazia quando não houver sugestões")
        void shouldReturnEmptyListWhenNoSuggestionsExist() {

            when(tagRepository.findTop10UsedTags())
                    .thenReturn(List.of());

            List<TagResponse> result = tagService.suggestions();

            assertNotNull(result);
            assertTrue(result.isEmpty());
        }
    }
}