package yw.monsterInc.global;

import io.jsonwebtoken.*;
        import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component; // ✅ 핵심: @Component 어노테이션
import yw.monsterInc.member.service.MemberService;

import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component // ✅ Spring에게 이 클래스를 Bean으로 등록하라고 알립니다.
public class JwtTokenProvider {

    private final Key key;
    private final long tokenValidityInMilliseconds;
    private final MemberService memberService;

    // ✅ 생성자: application.yml에서 정의한 값을 주입받습니다.
    public JwtTokenProvider(
            @Value("${jwt.secret}") String secretKey,
            @Value("${jwt.token-validity-in-seconds}") long tokenValidityInSeconds,
            MemberService memberService
    ) {
        byte[] keyBytes = secretKey.getBytes();
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.tokenValidityInMilliseconds = tokenValidityInSeconds * 1000;
        this.memberService = memberService;
    }

    /**
     * 인증 정보를 기반으로 JWT 토큰을 생성합니다.
     * @param authentication Spring Security의 인증 정보
     * @param userId 사용자의 고유 ID (회원번호) // ✅ 파라미터 설명 추가
     * @return 생성된 JWT 토큰 (Bearer 타입)
     */
    public String createToken(Authentication authentication, long userId) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));



        long now = (new Date()).getTime();
        Date validity = new Date(now + this.tokenValidityInMilliseconds);

        return Jwts.builder()
                .setSubject(authentication.getName()) // 사용자의 이메일(ID)을 저장
                .claim("auth", authorities) // 권한 정보를 저장
                .claim("userId", userId) // ✅ userId를 클레임에 추가
                .signWith(key, SignatureAlgorithm.HS256)
                .setIssuedAt(new Date()) // 토큰 발행 시간
                .setExpiration(validity) // 토큰 만료 시간
                .compact();
    }

    /**
     * JWT 토큰을 복호화하여 인증 정보를 가져옵니다.
     * @param token JWT 토큰
     * @return Spring Security의 인증 정보
     */
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        String userEmail = claims.getSubject();

        try {
            UserDetails principal = memberService.loadUserByUsername(userEmail);
            return new UsernamePasswordAuthenticationToken(principal, "", principal.getAuthorities());
        } catch (Exception e) {
            // [추가] DB 조회 중 예외가 발생하면, 어떤 사용자를 찾지 못했는지 로그를 남긴다.
            log.warn("DB에서 사용자 정보를 찾을 수 없습니다: {}, 에러: {}", userEmail, e.getMessage());
            return null; // 인증 실패 시 null을 반환하도록 처리
        }
    }

    /**
     * 토큰의 유효성을 검증합니다.
     * @param token JWT 토큰
     * @return 유효하면 true
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.info("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.info("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.info("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }
}