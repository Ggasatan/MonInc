package yw.monsterInc.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import yw.monsterInc.global.JwtAuthenticationFilter;
import yw.monsterInc.global.JwtTokenProvider;

import java.util.List;

@Configuration
@EnableWebSecurity // 이 어노테이션으로 Spring Security를 활성화합니다.
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtTokenProvider jwtTokenProvider;

    private static final String INTERNAL_API_SECRET = "our-super-secret-key-for-internal-communication-12345";

    // ✅ 2. 비밀 키를 담을 헤더의 이름도 상수로 정의
    private static final String INTERNAL_API_HEADER = "X-Internal-API-Secret";


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 설정: 이전에 WebConfig에서 했던 역할을 여기서 대신 처리합니다.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 보호 비활성화: Stateless한 REST API에서는 보통 비활성화합니다.
                .csrf(AbstractHttpConfigurer::disable)

                // 3. 세션 관리 정책 설정: 세션을 사용하지 않는 'STATELESS'로 설정합니다.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. HTTP Basic 인증 비활성화: API 서버이므로 비활성화합니다.
                .httpBasic(httpBasic -> httpBasic.disable())

                // 폼 로그인을 JSON 기반으로 대체 (직접 필터 구현 또는 success/failure handler 사용)
                .formLogin(formLogin -> formLogin.disable()) // 기본 폼 로그인 비활성화

                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class)

                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 5. 요청 경로별 접근 권한 설정 (가장 중요!)
                .authorizeHttpRequests(auth -> auth
                        // 아래에 명시된 경로는 인증(로그인) 없이 누구나 접근 가능
                        .requestMatchers("/api/chat/**").access((authentication, context) -> {
                            String secretHeader = context.getRequest().getHeader(INTERNAL_API_HEADER);
                            return new AuthorizationDecision(INTERNAL_API_SECRET.equals(secretHeader));
                        })
                        .requestMatchers(
                                "/",             // 루트 경로 (메인 페이지 접속 등)
                                "/api/test",     // 테스트용 API
                                "/api/posts",    // 예시: 게시글 목록 API
                                "/api/products/**",
                                "/api/members/login",
                                "/api/oauth2/**",
                                "/login/**",
                                "/api/members/signup/**"
                        ).permitAll()
                        // 그 외의 모든 요청은 반드시 인증이 필요함
                        .anyRequest().authenticated()



        // 여기에 커스텀 로그인 필터나 성공/실패 핸들러를 추가합니다.
        // 예시: .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
                );

        return http.build();
    }
    // CORS 설정을 위한 Bean
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3001", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // 모든 경로에 대해 위 CORS 정책 적용
        return source;
    }

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

}