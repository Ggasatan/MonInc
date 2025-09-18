package yw.monsterInc.member.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import yw.monsterInc.global.CustomUserDetails;
import yw.monsterInc.global.JwtTokenProvider;
import yw.monsterInc.member.Dto.LoginRequestDto;
import yw.monsterInc.member.Dto.LoginResponseDto;
import yw.monsterInc.member.Repository.MemberRepository;
import yw.monsterInc.member.constant.LoginStatus;
import yw.monsterInc.member.entity.Member;

import java.util.Collections;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class LoginService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;

    public LoginResponseDto normalLogin(LoginRequestDto loginRequestDto) {
        // 1. Spring Security의 AuthenticationManager를 통해 사용자 인증
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.getEmail(),
                        loginRequestDto.getPassword()
                )
        );

        // 2. 인증 정보를 SecurityContext에 설정
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. 인증된 사용자의 이메일로 DB에서 MemberEntity를 다시 조회
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String email = authentication.getName();
        Member member = userDetails.getMember();
        // 4. JWT 토큰 생성
        String authority = "ROLE_" + member.getMemberRole().name();
        Authentication tokenAuthentication = new UsernamePasswordAuthenticationToken(
                email, // Principal로 이메일 사용
                null,
                Collections.singleton(new SimpleGrantedAuthority(authority))
        );
        String jwtToken = jwtTokenProvider.createToken(tokenAuthentication, member.getId());

        // 5. 추가 정보 필요 여부 확인
        LoginStatus status = (member.getPhoneNum() == null || member.getBirthDate() == null)
                ? LoginStatus.ADDITIONAL_INFO_REQUIRED
                : LoginStatus.SUCCESS;
        System.out.println("++++++++++++이제 컨트롤로 보냅니다잉~~~~~~~~~~~~~");
        // 6. 소셜 로그인과 동일한 형식의 LoginResponseDto로 응답 생성
        return new LoginResponseDto(status, member, jwtToken);
    }
}
