package yw.monsterInc.member.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;
import java.time.LocalDate;

@Getter
@Setter
@Builder
public class MemberDto {

    @NotBlank(message = "이름은 필수 입력 값입니다.")
    private String name;

    @NotBlank(message = "이메일은 필수 입력 값입니다.") // @NotEmpty보다 포괄적인 @NotBlank 사용
    @Email(message = "이메일 형식으로 입력해주세요.")
    private String email;

    @NotBlank(message = "연락처는 필수 입력 값입니다.")
    @Pattern(regexp = "^010\\d{8}$", message = "'-' 없이 11자리 숫자로 입력해주세요. (예: 01012345678)")
    private String phoneNum;

    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    @Length(min = 8, max = 16, message = "비밀번호는 8자 이상, 16자 이하로 입력해주세요.")
    private String password;

    // `passwordConfirm` 필드는 삭제

    // `birthYear`, `birthMonth`, `birthDay`는 하나의 필드로 통합
    @NotNull(message = "생년월일은 필수 입력 값입니다.")
    private String birthDate; // `YYYY-MM-DD` 형식의 문자열

    // `authCode` 필드는 회원가입 최종 요청 시에는 필요 없으므로 제거
}