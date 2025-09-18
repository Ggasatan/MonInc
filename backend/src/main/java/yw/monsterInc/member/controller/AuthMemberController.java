package yw.monsterInc.member.controller;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import yw.monsterInc.member.Dto.AdditionalInfoRequestDto;
import yw.monsterInc.member.Dto.LoginResponseDto;
import yw.monsterInc.member.service.GoogleService;
import yw.monsterInc.member.service.KakaoService;
import yw.monsterInc.member.service.MemberService;
import yw.monsterInc.member.service.NaverService;

@RestController
@RequestMapping("/api/oauth2")
@RequiredArgsConstructor
public class AuthMemberController {
    private final KakaoService kakaoService;
    private final NaverService naverService;
    private final GoogleService googleService;
    private final MemberService memberService;

    @GetMapping("/kakao")
    public ResponseEntity<LoginResponseDto> kakaoCallback(HttpServletRequest request){
        String code = request.getParameter("code");
        String token = kakaoService.getKakaoAccessToken(code).getAccess_token();
        return ResponseEntity.ok(kakaoService.kakaoLogin(token));
    }

    @GetMapping("/naver")
    public ResponseEntity<LoginResponseDto> naverCallback(HttpServletRequest request){
        String code = request.getParameter("code");
        String state = request.getParameter("state");
        String token = naverService.getnaverAccessToken(code, state).getAccess_token();
        return ResponseEntity.ok(naverService.naverLogin(token));
    }

    @GetMapping("/google")
    public ResponseEntity<LoginResponseDto> googleCallback(HttpServletRequest request){
        String code = request.getParameter("code");
        String token = googleService.getGoogleAccessToken(code).getAccess_token();
        return ResponseEntity.ok(googleService.googleLogin(token));
    }

    @PatchMapping("/AuthDetails")
    public ResponseEntity<String> updateAdditionalInfo(
            @AuthenticationPrincipal UserDetails username, // ✅ 1. 토큰에서 사용자 정보 추출
            @Valid @RequestBody AdditionalInfoRequestDto requestDto // ✅ 2. 요청 본문 데이터
    ) {
        // userDetails.getUsername()에는 보통 memberId.toString() 값이 들어있습니다.
        System.out.println(username.getUsername());

        memberService.updateMemberDetails(username.getUsername(), requestDto);

        return ResponseEntity.ok("추가 정보가 성공적으로 업데이트되었습니다.");
    }
}
