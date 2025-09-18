package yw.monsterInc.global;

import lombok.RequiredArgsConstructor;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;

    // 이 메소드가 실제 필터의 로직을 담고 있습니다.
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {


        // 1. 요청 헤더에서 JWT 토큰을 추출합니다.
        String token = resolveToken(request);

        // 2. 토큰이 존재하고, 유효성 검사(validateToken)를 통과했다면
        if (token != null && jwtTokenProvider.validateToken(token)) {
            // 3. 토큰에서 인증 정보(Authentication 객체)를 가져옵니다.
            Authentication authentication = jwtTokenProvider.getAuthentication(token);

            // 4. SecurityContextHolder에 인증 정보를 저장합니다.
            //    이 시점부터 해당 요청은 '인증된 사용자'로 취급됩니다.
            if (authentication != null) {
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // 5. 다음 필터로 제어를 넘깁니다.
        filterChain.doFilter(request, response);
    }

    // HTTP 요청 헤더의 "Authorization" 필드에서 'Bearer ' 접두사를 제거하고
    // 순수한 토큰 문자열만 추출하는 헬퍼 메소드입니다.
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
