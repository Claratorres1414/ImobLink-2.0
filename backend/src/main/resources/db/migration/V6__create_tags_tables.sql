CREATE TABLE tags (
                      id BIGSERIAL PRIMARY KEY,
                      name VARCHAR(80) NOT NULL,
                      normalized_name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE posts_tags (
                            post_id BIGINT NOT NULL,
                            tag_id BIGINT NOT NULL,

                            PRIMARY KEY (post_id, tag_id),

                            CONSTRAINT fk_posts_tags_post
                                FOREIGN KEY (post_id) REFERENCES posts(id)
                                    ON DELETE CASCADE,

                            CONSTRAINT fk_posts_tags_tag
                                FOREIGN KEY (tag_id) REFERENCES tags(id)
                                    ON DELETE CASCADE
);