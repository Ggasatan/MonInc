package yw.monsterInc.Product.dto;

import lombok.Getter;
import lombok.Setter;
import yw.monsterInc.Product.entity.Product;

@Getter
@Setter
public class SaveOptionDto {
    private Long mon;
    private String saveName;
    private String materialOverrides;
}
