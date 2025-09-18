package yw.monsterInc.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor // 모든 필드를 받는 생성자를 자동으로 만들어주는 Lombok 어노테이션
public class MyPageResponseDto {
    private String name;
}
