package com.PIEC.ImobLink.Integration;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseCleaner {
    private final JdbcTemplate jdbcTemplate;

    public DatabaseCleaner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void clean() {
        List<String> tables = jdbcTemplate.queryForList(
            """
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            """, String.class
        );

        if (tables.isEmpty()) {
            return;
        }

        String truncate = "TRUNCATE TABLE "
                + String.join(", ", tables.stream()
                    .map(table -> "\"" + table + "\"")
                    .toList())
                + " RESTART IDENTITY CASCADE";

        jdbcTemplate.execute(truncate);
    }
}
