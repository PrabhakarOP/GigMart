package com.gigsphere.gigmart;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;


class GigmartApplicationTests {


	@Test
	void testMessage(){
		GigmartApplication app=new GigmartApplication();
		assertEquals("my message",app.getMessage());
	}

}
