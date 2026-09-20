package com.labourmanagement.labour;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminLaboursApiTest {

    @Autowired
    private MockMvc mockMvc;

    private String adminToken() throws Exception {
        MvcResult res = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"likith\",\"password\":\"Admin@123\",\"role\":\"ROLE_ADMIN\"}"))
                .andExpect(status().isOk())
                .andReturn();
        String body = res.getResponse().getContentAsString();
        return body.split("\"accessToken\":\"")[1].split("\"")[0];
    }

    @Test
    void listWithoutSearchParamsReturns200() throws Exception {
        // Regression: NULL search used to 500 on Postgres (Hibernate CONCAT type inference).
        String token = adminToken();
        mockMvc.perform(get("/api/v1/admin/labours?page=0&size=100")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    void listWithSearchReturns200() throws Exception {
        String token = adminToken();
        mockMvc.perform(get("/api/v1/admin/labours?search=lik&page=0&size=10")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void createdLabourAppearsInList() throws Exception {
        String token = adminToken();
        mockMvc.perform(post("/api/v1/admin/labours")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"listlab1\",\"email\":\"listlab1@x.com\",\"password\":\"Test@123\"," +
                                "\"firstName\":\"List\",\"lastName\":\"Lab\",\"dailyWage\":500}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/admin/labours?page=0&size=100")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].username").value("listlab1"));
    }
}
