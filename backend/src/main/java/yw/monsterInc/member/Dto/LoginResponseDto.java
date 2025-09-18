package yw.monsterInc.member.Dto;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import yw.monsterInc.member.constant.LoginStatus;
import yw.monsterInc.member.entity.Member;

@Data
@Getter
@Setter
@NoArgsConstructor
public class LoginResponseDto {

    private LoginStatus status;
    private Member member;
    private String token;    // JWT 토큰

    // 필요하다면, 생성자를 만들어 초기화할 수도 있습니다.
    public LoginResponseDto(LoginStatus loginStatus, Member member, String token) {
        this.status = loginStatus;
        this.member = member;
        this.token = token;
    }
}