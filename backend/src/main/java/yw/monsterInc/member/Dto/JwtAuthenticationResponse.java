package yw.monsterInc.member.Dto;

import lombok.Getter;

@Getter
public class JwtAuthenticationResponse {

    private String accessToken;
    private String tokenType = "Bearer";

    public JwtAuthenticationResponse(String accessToken) {
        this.accessToken = accessToken;
    }

    // Setter는 필요에 따라 추가할 수 있지만, 보통 응답 DTO는 불변으로 만듭니다.
    // public void setAccessToken(String accessToken) {
    //     this.accessToken = accessToken;
    // }

    // public void setTokenType(String tokenType) {
    //     this.tokenType = tokenType;
    // }
}
