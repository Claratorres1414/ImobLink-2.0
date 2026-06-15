package com.PIEC.ImobLink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.PIEC.ImobLink.Initializer.EnvInitializer;

@SpringBootApplication
@EnableScheduling
public class ImobLinkApplication {

	public static void main(String[] args) {

		SpringApplication app =
				new SpringApplication(ImobLinkApplication.class);
		app.addInitializers(new EnvInitializer());
		app.run(args);
	}
}
