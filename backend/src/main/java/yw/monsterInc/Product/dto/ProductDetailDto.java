package yw.monsterInc.Product.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Getter;
import yw.monsterInc.Product.entity.Product;

import java.util.Collections;
import java.util.Map;

@Getter
public class ProductDetailDto {

    private Long id;
    private String name;
    private int basePrice;
    private String modelUrl;
    private Map<String, String> materialMap;
    // 💡 [고려 필요] 3D 뷰어에 사용할 기본 이미지 URL이나,
    // 상품 설명 같은 다른 필드들도 여기에 추가하면 좋아.

    @Builder
    public ProductDetailDto(Product entity, ObjectMapper objectMapper) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.basePrice = entity.getBasePrice();
        this.modelUrl = entity.getModelUrl();

        // ✅ [핵심 3] 생성자에서 문자열을 Map 객체로 파싱!
    }

    private Map<String, String> parseMaterialMap(String jsonString, ObjectMapper objectMapper) {
        // DB에 저장된 값이 null이거나 비어있으면, 빈 Map을 반환
        if (jsonString == null || jsonString.isBlank()) {
            return Collections.emptyMap();
        }

        try {
            // Jackson ObjectMapper를 사용해서 JSON 문자열을 Map 객체로 변환
            return objectMapper.readValue(jsonString, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            // 만약 JSON 파싱에 실패하면 (데이터가 깨졌거나), 로그를 남기고 빈 Map을 반환
            System.err.println("MaterialMap JSON 파싱 실패: " + e.getMessage());
            return Collections.emptyMap();
        }
    }
}