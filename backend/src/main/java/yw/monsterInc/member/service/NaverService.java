package yw.monsterInc.member.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import yw.monsterInc.global.JwtTokenProvider;
import yw.monsterInc.global.exception.EmailAlreadyExistsException;
import yw.monsterInc.member.Dto.LoginResponseDto;
import yw.monsterInc.member.Dto.Naver.NaverAccuntDto;
import yw.monsterInc.member.Dto.Naver.NaverTokenDto;
import yw.monsterInc.member.Repository.MemberRepository;
import yw.monsterInc.member.constant.LoginStatus;
import yw.monsterInc.member.constant.MemberRole;
import yw.monsterInc.member.entity.Member;

import java.util.Collections;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NaverService {
    private final MemberRepository memberRepository; // ✅ AccountRepository -> MemberRepository
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    // --- @Value 어노테이션으로 yml 값 주입 (기존과 동일) ---
    @Value("${spring.security.oauth2.client.registration.naver.client-id}")
    private String NAVER_CLIENT_ID;
    @Value("${spring.security.oauth2.client.registration.naver.redirect-uri}")
    private String NAVER_REDIRECT_URI;
    @Value("${spring.security.oauth2.client.registration.naver.client-secret}")
    private String NAVER_CLIENT_SECRET;
    @Value("${spring.security.oauth2.client.provider.naver.token-uri}")
    private String NAVER_TOKEN_URI;
    @Value("${spring.security.oauth2.client.provider.naver.user-info-uri}")
    private String NAVER_USER_INFO_URI;

    /**
     * [구조 유지] 인가 코드로 액세스 토큰을 받아오는 메소드
     */
    @Transactional
    public NaverTokenDto getnaverAccessToken(String code, String state) {
        HttpHeaders headers = new HttpHeaders();

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", NAVER_CLIENT_ID);
        params.add("client_secret", NAVER_CLIENT_SECRET);
        params.add("state", state);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> naverTokenRequest = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    NAVER_TOKEN_URI,
                    HttpMethod.POST,
                    naverTokenRequest,
                    String.class
            );
            System.out.println("네이버 토큰 API 응답: " + response.getBody());
            NaverTokenDto naverTokenDto= null;
            naverTokenDto = objectMapper.readValue(response.getBody(), NaverTokenDto.class);
            System.out.println("파싱된 네이버 액세스 토큰: " + naverTokenDto.getAccess_token());
            return naverTokenDto;
        } catch (Exception e) {
            throw new RuntimeException("네이버 토큰을 받아오는데 실패했습니다.", e);
        }
    }

    /**
     * [수정] 액세스 토큰으로 사용자 정보를 받아와 MemberEntity를 반환하는 메소드
     * - DB 조회 로직 제거, 오직 카카오 정보 조회 및 Member 객체 생성 책임만 가짐
     */
    public Member getnaverInfo(String naverAccessToken) {
        System.out.println("사용자 정보 조회에 사용할 토큰: " + naverAccessToken);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + naverAccessToken);
//        headers.add("Content-type", "application/json;charset=utf-8");
        HttpEntity<MultiValueMap<String, String>> accountInfoRequest = new HttpEntity<>(headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    NAVER_USER_INFO_URI,
                    HttpMethod.GET,
                    accountInfoRequest,
                    String.class
            );

            NaverAccuntDto naverAccountDto = objectMapper.readValue(response.getBody(), NaverAccuntDto.class);
            log.info("Phone_number : "+naverAccountDto.getNaverResponseDto().getMobile());
            log.info("Birth Year : "+naverAccountDto.getNaverResponseDto().getBirthyear());
            log.info("Birth Day : "+naverAccountDto.getNaverResponseDto().getBirthday());
            return Member.builder()
                    .name(naverAccountDto.getNaverResponseDto().getName())
                    .email(naverAccountDto.getNaverResponseDto().getEmail())
                    .phoneNum(naverAccountDto.getNaverResponseDto().getMobile().
                            replace("+82 ", "0").replace("-", ""))
                    .birthDate(naverAccountDto.getNaverResponseDto().getBirthyear()
                            +naverAccountDto.getNaverResponseDto().getBirthday())
                    .socialType("naver")
                    .socialId(naverAccountDto.getNaverResponseDto().getId())
                    .memberRole(MemberRole.USER) // 기본 역할 부여
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("네이버 사용자 정보를 조회하는데 실패했습니다.", e);
        }
    }

    /**
     * [수정] 카카오 정보로 최종 로그인/회원가입 처리 및 JWT 발급을 하는 메소드
     */
    public LoginResponseDto naverLogin(String naverAccessToken) {
        // 1. 액세스 토큰으로 카카오 사용자 정보 조회 (Member 초안 획득)
        Member naverMemberInfo = getnaverInfo(naverAccessToken);
        Member member = null;

        Optional<Member> memberBySocialId = memberRepository.findBySocialId(naverMemberInfo.getSocialId());
        if(memberBySocialId.isPresent()){
            System.out.println("기존 소셜 계정으로 로그인합니다.");
            member = memberBySocialId.get();
        } else {
            Optional<Member> memberByEmail = memberRepository.findByEmail(naverMemberInfo.getEmail());
            if (memberByEmail.isPresent()){
                System.out.println("이메일 중복 발견! 회원가입을 중단합니다.");
                throw new EmailAlreadyExistsException(
                        "해당 이메일(" + naverMemberInfo.getEmail() + ")로 이미 가입된 계정이 존재합니다.");
            } else {
                System.out.println("완전 신규 회원으로 가입합니다.");
                member = memberRepository.save(naverMemberInfo);
            }
        }
        // 3. 우리 서비스 전용 JWT 토큰 생성
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                member.getEmail() != null ? member.getEmail() : member.getSocialId().toString(),
                null,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_"+member.getMemberRole().name())) // .name() 또는 .toString()
        );
        String jwtToken = jwtTokenProvider.createToken(authentication, member.getId());

        // 4. 최종 응답 DTO 생성 및 반환
        return new LoginResponseDto(LoginStatus.SUCCESS, member, jwtToken);
    }
}
