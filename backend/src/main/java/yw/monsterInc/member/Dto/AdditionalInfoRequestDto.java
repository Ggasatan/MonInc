package yw.monsterInc.member.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdditionalInfoRequestDto {
    // 예시: 전화번호와 생년월일을 추가로 받는다고 가정
    @NotBlank(message = "전화번호는 필수 입력 값입니다.")
    @Pattern(regexp = "^010[0-9]{8}$", message = "전화번호 형식이 올바르지 않습니다. (예: 01012345678)")
    private String phoneNum;

    @NotBlank(message = "생년월일은 필수 입력 값입니다.")
    // YYYY-MM-DD 형식 검증 (정규식은 필요에 따라 조정)
    private String birthDate;

}
