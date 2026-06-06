package com.PIEC.ImobLink;

import com.PIEC.ImobLink.Initializer.EnvInitializer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ImobLinkApplication {

	public static void main(String[] args) {

		SpringApplication app =
				new SpringApplication(ImobLinkApplication.class);
		app.addInitializers(new EnvInitializer());
		app.run(args);
	}
}
