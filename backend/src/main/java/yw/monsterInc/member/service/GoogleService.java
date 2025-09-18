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
import yw.monsterInc.member.Dto.Google.GoogleTokenDto;
import yw.monsterInc.member.Dto.LoginResponseDto;
import yw.monsterInc.member.Dto.Google.GoogleAccountDto;
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
public class GoogleService {
    private final MemberRepository memberRepository; // ✅ AccountRepository -> MemberRepository
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    // --- @Value 어노테이션으로 yml 값 주입 (기존과 동일) ---
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String GOOGLE_CLIENT_ID;
    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String GOOGLE_REDIRECT_URI;
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String GOOGLE_CLIENT_SECRET;
    @Value("${spring.security.oauth2.client.provider.google.token-uri}")
    private String GOOGLE_TOKEN_URI;
    @Value("${spring.security.oauth2.client.provider.google.user-info-uri}")
    private String GOOGLE_USER_INFO_URI;

    /**
     * [구조 유지] 인가 코드로 액세스 토큰을 받아오는 메소드
     */
    @Transactional
    public GoogleTokenDto getGoogleAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", GOOGLE_CLIENT_ID);
        params.add("client_secret", GOOGLE_CLIENT_SECRET);
        params.add("redirect_uri", GOOGLE_REDIRECT_URI);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> googleTokenRequest = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    GOOGLE_TOKEN_URI,
                    HttpMethod.POST,
                    googleTokenRequest,
                    String.class
            );
            System.out.println("구글 토큰 API 응답: " + response.getBody());
            GoogleTokenDto googleTokenDto= null;
            googleTokenDto = objectMapper.readValue(response.getBody(), GoogleTokenDto.class);
            System.out.println("파싱된 구글 액세스 토큰: " + googleTokenDto.getAccess_token());
            return googleTokenDto;
        } catch (Exception e) {
            throw new RuntimeException("구글 토큰을 받아오는데 실패했습니다.", e);
        }
    }

    /**
     * [수정] 액세스 토큰으로 사용자 정보를 받아와 MemberEntity를 반환하는 메소드
     * - DB 조회 로직 제거, 오직 카카오 정보 조회 및 Member 객체 생성 책임만 가짐
     */
    public Member getGoogleInfo(String googleAccessToken) {
        System.out.println("사용자 정보 조회에 사용할 토큰: " + googleAccessToken);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + googleAccessToken);

        // ✅ People API를 사용하려면, 어떤 필드를 받을지 명시해주는 것이 좋습니다.
        String url = GOOGLE_USER_INFO_URI + "?personFields=names,emailAddresses,phoneNumbers,birthdays";
        HttpEntity<MultiValueMap<String, String>> accountInfoRequest = new HttpEntity<>(headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    accountInfoRequest,
                    String.class
            );

            GoogleAccountDto googleAccountDto = objectMapper.readValue(response.getBody(), GoogleAccountDto.class);

            return Member.builder()
                    .name(googleAccountDto.getName())
                    .email(googleAccountDto.getEmail())
                    .socialType("google")
                    .socialId(googleAccountDto.getSub())
                    .memberRole(MemberRole.USER) // 기본 역할 부여
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("구글 사용자 정보를 조회하는데 실패했습니다.", e);
        }
    }

    /**
     * [수정] 카카오 정보로 최종 로그인/회원가입 처리 및 JWT 발급을 하는 메소드
     */
    public LoginResponseDto googleLogin(String googleAccessToken) {
        // 1. 액세스 토큰으로 카카오 사용자 정보 조회 (Member 초안 획득)
        Member googleInfo = getGoogleInfo(googleAccessToken);
        Member member = null;

        Optional<Member> memberBySocialId = memberRepository.findBySocialId(googleInfo.getSocialId());
        if(memberBySocialId.isPresent()){
            System.out.println("기존 소셜 계정으로 로그인합니다.");
            member = memberBySocialId.get();
        } else {
            Optional<Member> memberByEmail = memberRepository.findByEmail(googleInfo.getEmail());
            if (memberByEmail.isPresent()){
                System.out.println("이메일 중복 발견! 회원가입을 중단합니다.");
                throw new EmailAlreadyExistsException(
                        "해당 이메일(" + googleInfo.getEmail() + ")로 이미 가입된 계정이 존재합니다.");
            } else {
                System.out.println("완전 신규 회원으로 가입합니다.");
                member = memberRepository.save(googleInfo);
            }
        }
        // 3. 우리 서비스 전용 JWT 토큰 생성
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                member.getEmail() != null ? member.getEmail() : member.getSocialId().toString(),
                null,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_"+member.getMemberRole().name())) // .name() 또는 .toString()
        );
        String jwtToken = jwtTokenProvider.createToken(authentication, member.getId());
        if (member.getPhoneNum()==null || member.getBirthDate()==null){
            return new LoginResponseDto(LoginStatus.ADDITIONAL_INFO_REQUIRED, member, jwtToken);
        }

        // 4. 최종 응답 DTO 생성 및 반환
        return new LoginResponseDto(LoginStatus.SUCCESS, member, jwtToken);
    }
}
