package com.PIEC.ImobLink.Integration;

import com.PIEC.ImobLink.DTOs.RegisterRequest;
import com.PIEC.ImobLink.Entitys.User;
import com.PIEC.ImobLink.Repositorys.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class AuthIntegrationTest extends IntegrationTest {
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void shouldRegisterUserSuccessfully() throws Exception {
        RegisterRequest request = new RegisterRequest();

        request.setCpf("000.000.000-00");
        request.setPhoneNumber("(00) 90000-0000");
        request.setName("Fulano de tal");
        request.setEmail("fulano@email.com");
        request.setPassword("123456789101112");

        mockMvc.perform(
                post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
        )
                .andDo(print())
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail("fulano@email.com")
                .orElseThrow();

        assertThat(user.getName()).isEqualTo("Fulano de tal");
        assertThat(user.getEmail()).isEqualTo("fulano@email.com");
        assertThat(user.getCpf()).isEqualTo("000.000.000-00");

        assertThat(user.getPassword()).isNotEqualTo("123456789101112");
        assertThat(passwordEncoder.matches("123456789101112", user.getPassword())).isTrue();
    }
}
