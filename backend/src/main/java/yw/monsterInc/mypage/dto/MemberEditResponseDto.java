package yw.monsterInc.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import yw.monsterInc.member.entity.Member;

@Getter
@AllArgsConstructor
public class MemberEditResponseDto {
    private String name;
    private String phoneNum;
    private String birthDate; // Member 엔티티의 birthDate 필드 타입에 맞게 조정 필요 (아마도 String)

    // Member 엔티티를 받아서 DTO를 생성하는 정적 팩토리 메서드 (코드 가독성 UP!)
    public static MemberEditResponseDto from(Member member) {
        return new MemberEditResponseDto(
                member.getName(),
                member.getPhoneNum(),
                member.getBirthDate()
//                member.getBirthDate().toString() // 만약 birthDate가 LocalDate 타입이라면 String으로 변환
        );
    }
}
