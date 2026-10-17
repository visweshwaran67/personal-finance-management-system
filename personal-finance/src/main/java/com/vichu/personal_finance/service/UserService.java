package com.vichu.personal_finance.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.vichu.personal_finance.entity.User;
import com.vichu.personal_finance.repository.UserRepository;
import com.vichu.personal_finance.exception.UserAlreadyExistsException;
import com.vichu.personal_finance.exception.InvalidCredentialsException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder)
    {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user){
        if(userRepository.existsByUsername(user.getUsername())){
            throw new UserAlreadyExistsException("Username already exists");
        }
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        user.setRole("USER");
        return userRepository.save(user);
    }

    public User loginUser(String username, String password) {

    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new InvalidCredentialsException(
                    "Invalid username or password"));

    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new InvalidCredentialsException(
                "Invalid username or password");
    }

    return user;
}

}
