CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    cpf VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    bio VARCHAR(255),
    image_profile_path VARCHAR(255),
    image_profile_id BIGINT,
    role VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    description VARCHAR(255),
    price DOUBLE PRECISION NOT NULL,
    street VARCHAR(255),
    avenue VARCHAR(255),
    number VARCHAR(255),
    type VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    user_id BIGINT,
    views INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS images (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255),
    filepath VARCHAR(255),
    content_type VARCHAR(255),
    user_id BIGINT NOT NULL,
    post_id BIGINT,
    CONSTRAINT fk_images_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_images_post FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE IF NOT EXISTS follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT,
    following_id BIGINT,
    followed_at TIMESTAMP,
    CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id),
    CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS favs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    fav_at TIMESTAMP,
    CONSTRAINT fk_favs_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_favs_author FOREIGN KEY (author_id) REFERENCES users(id),
    CONSTRAINT fk_favs_post FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE IF NOT EXISTS likes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    liked_at TIMESTAMP,
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_likes_author FOREIGN KEY (author_id) REFERENCES users(id),
    CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    content VARCHAR(255),
    created_at TIMESTAMP,
    user_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    post_id BIGINT,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id),
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE IF NOT EXISTS post_reacheds (
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (post_id, user_id),
    CONSTRAINT fk_post_reacheds_post FOREIGN KEY (post_id) REFERENCES posts(id),
    CONSTRAINT fk_post_reacheds_user FOREIGN KEY (user_id) REFERENCES users(id)
);
