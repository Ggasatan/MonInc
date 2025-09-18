package yw.monsterInc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableCaching
@EnableJpaAuditing
@ConfigurationPropertiesScan
public class MonIncApplication {

	public static void main(String[] args) {
		SpringApplication.run(MonIncApplication.class, args);
	}

}
