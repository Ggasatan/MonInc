package yw.monsterInc.Product.entity;

import jakarta.persistence.*;
import lombok.*;
import yw.monsterInc.Product.constant.ProductStatus;
import yw.monsterInc.global.BaseEntity;

@Getter
@Setter
@Table(name="product")
@Entity
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Product  extends BaseEntity {
    @Id
    @Column(name = "product_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String imageUrl;

    private String modelUrl;

    private int monWidth;

    private int monHigh;

    private int basePrice;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;


}
