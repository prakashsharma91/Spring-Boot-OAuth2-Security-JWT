package com.pgs.sample;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class Test {
	PasswordEncoder encoder = new BCryptPasswordEncoder();
	static BCryptPasswordEncoder e = new BCryptPasswordEncoder();
	
	public static void main(String[] args) {
		System.out.println(e.encode("password"));
	}
}
