package yw.monsterInc.member.Dto.Google;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GoogleTokenDto {
    private String access_token;
    private int expires_in;
    private String scope;
    private String token_type;
    private String id_token;
}
