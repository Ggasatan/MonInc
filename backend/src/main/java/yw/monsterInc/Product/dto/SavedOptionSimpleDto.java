package yw.monsterInc.Product.dto;

import lombok.Getter;
import yw.monsterInc.Product.entity.SaveOption;

@Getter
public class SavedOptionSimpleDto {
    private Long id;
    private String saveName;
    private String modelUrl;
    private String materialOverrides; // ✅ [추가] 재질 정보 필드

    public SavedOptionSimpleDto(SaveOption saveOption) {
        this.id = saveOption.getId();
        this.saveName = saveOption.getSaveName();
        this.modelUrl = saveOption.getMon().getModelUrl();
        this.materialOverrides = saveOption.getMaterialOverrides(); // ✅ [추가] Entity에서 값을 가져옵니다.
    }
}