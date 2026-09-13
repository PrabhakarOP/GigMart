package com.gigsphere.gigmart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GigmartApplication {

	public String getMessage(){
		return "my message";
	}


	public static void main(String[] args) {

		SpringApplication.run(GigmartApplication.class, args);
		System.out.println("Hello maven ");
	}

}
