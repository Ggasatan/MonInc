package yw.monsterInc.member.Dto.Naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import yw.monsterInc.member.Dto.Kakao.KakaoAccountDto;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class NaverTokenDto {
    @JsonProperty("access_token")
    private String access_token;

    @JsonProperty("token_type")
    private String token_type;

    @JsonProperty("refresh_token")
    private String refresh_token;

    @JsonProperty("id_token")
    private String id_token;

    @JsonProperty("expires_in")
    private int expires_in;

    @JsonProperty("refresh_token_expires_in")
    private int refresh_token_expires_in;

    @JsonProperty("scope")
    private String scope;
}
