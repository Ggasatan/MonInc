package yw.monsterInc.global;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import yw.monsterInc.member.entity.Member;

import java.util.Collection;
import java.util.Collections;

@Getter // member 객체에 접근할 수 있도록 Getter 추가
public class CustomUserDetails implements UserDetails {

    private final Member member;

    public CustomUserDetails(Member member) {
        this.member = member;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Member 엔티티의 Role 정보를 기반으로 권한 목록 생성
        return Collections.singletonList(new SimpleGrantedAuthority(member.getMemberRole().toString()));
    }

    @Override
    public String getPassword() {
        return member.getPassword();
    }

    @Override
    public String getUsername() {
        // Spring Security에서 'username'은 고유 식별자를 의미하므로, 이메일을 반환
        return member.getEmail();
    }

    // --- 아래는 계정 상태 관련 메서드들, 지금은 다 true로 설정 ---
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
