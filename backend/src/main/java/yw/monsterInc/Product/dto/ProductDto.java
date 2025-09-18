package yw.monsterInc.Product.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import yw.monsterInc.Product.constant.ProductStatus;
import java.util.Map;

@Getter
@Setter // Controller에서 요청 Body를 받을 수 있도록 Setter 추가
@NoArgsConstructor // 기본 생성자 추가
public class ProductDto {
    // 상품 생성에 필요한 정보들
    private String name;
    private String imageUrl;
    private String modelUrl;
    private int monWidth;
    private int monHigh;
    private int basePrice;
    private ProductStatus status;
}