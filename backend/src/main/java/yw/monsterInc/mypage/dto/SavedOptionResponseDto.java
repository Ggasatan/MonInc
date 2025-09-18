package yw.monsterInc.mypage.dto;

import lombok.Builder;
import lombok.Getter;
import yw.monsterInc.Product.entity.SaveOption;

import java.time.LocalDate; // 저장일시를 위해 추가
import java.time.LocalDateTime;
import java.util.List;

@Getter // Builder 패턴으로 DTO를 유연하게 생성
public class SavedOptionResponseDto {
    private Long id;
    private String saveName;
    private String productName;
    private LocalDateTime savedAt;
    private String materialOverrides;

    public SavedOptionResponseDto(SaveOption saveOption) {
        this.id = saveOption.getId();
        this.saveName = saveOption.getSaveName();
        this.productName = saveOption.getMon().getName();
        // ✅ [수정] BaseEntity의 필드 이름이 getRegTime()이 맞는지 확인해주세요. (보통 getCreatedAt()을 많이 씁니다)
        this.savedAt = saveOption.getRegTime();
        this.materialOverrides = saveOption.getMaterialOverrides();
    }
}
