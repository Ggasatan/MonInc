package yw.monsterInc.mypage.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MemberUpdateRequestDto {
    private String name;
    private String phoneNum;
    private String password;
    private String birthDate; // `YYYY-MM-DD` 형식의 문자열
}
