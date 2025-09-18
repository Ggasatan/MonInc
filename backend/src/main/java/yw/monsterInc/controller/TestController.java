package yw.monsterInc.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class TestController {
    @GetMapping("/api/test")
    public Map<String, String> getTestData() {
        return Map.of("message", "리셋 성공! React와 Spring Boot가 연동되었습니다!");
    }
}