package yw.monsterInc.member.Dto.Google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleAccountDto {
    @JsonProperty("sub")
    private String sub;
    @JsonProperty("email")
    private String email;
    @JsonProperty("name")
    private String name;

}
