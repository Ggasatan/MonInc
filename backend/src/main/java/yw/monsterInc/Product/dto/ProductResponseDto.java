package yw.monsterInc.Product.dto;

import lombok.Builder;
import lombok.Getter;
import yw.monsterInc.Product.constant.ProductStatus;
import yw.monsterInc.Product.entity.Product;

@Getter
public class ProductResponseDto {
    private Long id;
    private String name;
    private String imageUrl;
    private String modelUrl;
    private int monWidth;
    private int monHigh;
    private int basePrice;
    private ProductStatus status;

    @Builder
    public ProductResponseDto(Product entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.imageUrl = entity.getImageUrl();
        this.modelUrl = entity.getModelUrl();
        this.monWidth = entity.getMonWidth();
        this.monHigh = entity.getMonHigh();
        this.basePrice = entity.getBasePrice();
        this.status = entity.getStatus();
    }
}