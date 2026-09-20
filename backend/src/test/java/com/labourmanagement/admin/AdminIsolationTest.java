package com.labourmanagement.admin;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminIsolationTest {

    @Autowired
    private MockMvc mockMvc;

    private String token(String username, String password) throws Exception {
        MvcResult res = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\",\"role\":\"ROLE_ADMIN\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return res.getResponse().getContentAsString().split("\"accessToken\":\"")[1].split("\"")[0];
    }

    private void register(String username, String email) throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"email\":\"" + email + "\",\"password\":\"Test@123\",\"role\":\"admin\"}"))
                .andExpect(status().isOk());
    }

    private int createLabour(String token, String username, String email) throws Exception {
        MvcResult res = mockMvc.perform(post("/api/v1/admin/labours")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"email\":\"" + email + "\",\"password\":\"Test@123\"," +
                                "\"firstName\":\"Iso\",\"lastName\":\"Lab\",\"dailyWage\":500}"))
                .andExpect(status().isOk())
                .andReturn();
        String body = res.getResponse().getContentAsString();
        return Integer.parseInt(body.split("\"id\":")[1].split(",")[0]);
    }

    @Test
    void newAdminDoesNotSeeOtherAdminsLabours() throws Exception {
        register("isoAdminA", "isoA@x.com");
        String tokenA = token("isoAdminA", "Test@123");
        createLabour(tokenA, "isolab1", "isolab1@x.com");

        // Apna labour dikhe
        mockMvc.perform(get("/api/v1/admin/labours?page=0&size=100")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1));

        // Dusra admin (likith) ko nahi dikhe
        String tokenLikith = token("likith", "Admin@123");
        mockMvc.perform(get("/api/v1/admin/labours?page=0&size=100")
                        .header("Authorization", "Bearer " + tokenLikith))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    void todayPresentListsOnlyOwnPresentLabours() throws Exception {
        register("isoAdminB", "isoB@x.com");
        String tokenB = token("isoAdminB", "Test@123");
        int labourId = createLabour(tokenB, "isolab2", "isolab2@x.com");

        String today = LocalDate.now().toString();
        mockMvc.perform(post("/api/v1/admin/attendance/bulk")
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"items\":[{\"labourId\":" + labourId + ",\"attendanceDate\":\"" + today + "\",\"status\":\"PRESENT\"}]}"))
                .andExpect(status().isOk());

        // Apne ko dikhe
        mockMvc.perform(get("/api/v1/admin/attendance/today-present")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].username").value("isolab2"));

        // Dusre admin ko nahi dikhe
        String tokenLikith = token("likith", "Admin@123");
        mockMvc.perform(get("/api/v1/admin/attendance/today-present")
                        .header("Authorization", "Bearer " + tokenLikith))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }
}
