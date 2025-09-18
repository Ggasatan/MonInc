package yw.monsterInc.member.entity;

import java.util.Objects;

import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import yw.monsterInc.global.BaseEntity;
import yw.monsterInc.member.constant.MemberRole;
import yw.monsterInc.member.Dto.MemberDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Getter
@Setter
@Table(name="member")
@Entity
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Member extends BaseEntity {


    @Id
    @Column(name = "member_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50) // 이메일 길이는 보통 50자 내외로 지정
    private String email;

    @Column(unique = true, nullable = true, length = 11) // 휴대폰 번호 길이는 11자로 고정
    private String phoneNum;

    @Column(nullable = true) // 비밀번호는 해싱 후 길이가 길어질 수 있으므로 길이를 넉넉하게 두거나 지정하지 않음
    private String password;

    @Column(nullable = false, length = 30) // 이름 길이를 적절하게 제한
    private String name;

    // ✅ 수정: DB 컬럼명을 birth_day -> birth_date로 변경하고, 타입을 LocalDate로 변경
    @Column(name = "birth_date", nullable = true)
    private String birthDate; // 기존 birthDay(String) -> birthDate(LocalDate)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole memberRole;

    // --- 소셜 로그인용 필드 추가 (강력 추천) ---
    @Column(name = "social_type", length = 20) // KAKAO, NAVER, GOOGLE 등
    private String socialType;

    @Column(name = "social_id", unique = true) // 소셜 서비스의 고유 ID (카카오의 경우 숫자)
    private String socialId;

    // 이름 변경과 같은 부분적인 업데이트 메서드는 명확한 의도를 드러내도록 유지 (좋은 패턴!)
    public void updateName(String name) {
        this.name = name;
    }

    // Role 설정은 생성 시에만 하는 것이 일반적이므로 별도 메서드는 제거하거나 유지할 수 있음
    // public void setRole(MemberRole memberRole) { ... }

    // ✅ 대폭 수정: DTO를 Entity로 변환하는 정적 팩토리 메서드
    public static Member createMember(MemberDto memberDto, PasswordEncoder passwordEncoder) {
        return Member.builder()
                .name(memberDto.getName())
                .email(memberDto.getEmail())
                .phoneNum(memberDto.getPhoneNum())
                .password(passwordEncoder.encode(memberDto.getPassword())) // 비밀번호 암호화
                .birthDate(memberDto.getBirthDate()) // DTO에서 바로 LocalDate 타입으로 가져옴
                .memberRole(MemberRole.USER) // 기본 역할 부여
                .build();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || !(o instanceof Member)) return false;
        Member member = (Member) o;
        if (this.id == null || member.id == null) {
            return false;
        }
        return Objects.equals(id, member.id);
    }

    @Override
    public int hashCode() {
        return id != null ? Objects.hash(id) : super.hashCode();
    }

}
