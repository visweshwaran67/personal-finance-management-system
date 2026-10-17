package com.vichu.personal_finance.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vichu.personal_finance.dto.LoginRequest;
import com.vichu.personal_finance.dto.LoginResponse;
import com.vichu.personal_finance.entity.User;
import com.vichu.personal_finance.service.JwtService;
import com.vichu.personal_finance.service.UserService;
import com.vichu.personal_finance.dto.UserResponse;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

   @PostMapping("/register")
   public UserResponse registerUser(@RequestBody User user) {

    User savedUser = userService.registerUser(user);

    UserResponse response = new UserResponse();
    response.setId(savedUser.getId());
    response.setUsername(savedUser.getUsername());
    response.setRole(savedUser.getRole());

    return response;
}

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {
        User user = userService.loginUser(loginRequest.getUsername(), loginRequest.getPassword());

        String token = jwtService.generateToken(user.getUsername(), user.getRole());

        return new LoginResponse(token);
    }

}