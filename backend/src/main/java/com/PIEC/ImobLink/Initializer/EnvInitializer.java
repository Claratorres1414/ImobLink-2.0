package com.PIEC.ImobLink.Initializer;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class EnvInitializer
        implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext context) {

        String profile = context.getEnvironment()
                .getProperty("spring.profiles.active", "dev");

        System.out.println("PROFILE = " + profile);

        Dotenv dotenv = Dotenv.configure()
                .filename(".env." + profile)
                .ignoreIfMissing()
                .load();

        Map<String, Object> envMap = new HashMap<>();
        dotenv.entries().forEach(entry -> envMap.put(entry.getKey(), entry.getValue()));

        context.getEnvironment()
                .getPropertySources()
                .addFirst(new MapPropertySource("customEnvProperties", envMap));
    }
}