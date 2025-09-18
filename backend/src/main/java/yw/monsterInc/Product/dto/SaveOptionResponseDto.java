package yw.monsterInc.Product.dto;

import lombok.Getter;
import yw.monsterInc.Product.entity.SaveOption;

@Getter
public class SaveOptionResponseDto {

    private Long id;
    // 필요하다면 다른 필드도 추가할 수 있어. (예: private String name;)

    public SaveOptionResponseDto(SaveOption saveOption) {
        this.id = saveOption.getId();
    }
}