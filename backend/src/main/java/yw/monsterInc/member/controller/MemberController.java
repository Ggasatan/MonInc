package yw.monsterInc.member.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import yw.monsterInc.global.CustomUserDetails;
import yw.monsterInc.member.Dto.EmailAuthRequestDto;
import yw.monsterInc.member.Dto.LoginRequestDto;
import yw.monsterInc.member.Dto.LoginResponseDto;
import yw.monsterInc.member.Dto.MemberDto;
import yw.monsterInc.member.Repository.MemberRepository;
import yw.monsterInc.member.entity.Member;
import yw.monsterInc.member.service.LoginService;
import yw.monsterInc.member.service.MemberService;
import yw.monsterInc.notification.service.NotificationService;
import yw.monsterInc.order.dto.DelivertUserDto;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;
    private final LoginService loginService;
    private final NotificationService notificationService;
    private final MemberRepository memberRepository;

    @GetMapping("/me")
    public ResponseEntity<?>findMe(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        Long memberId = userDetails.getMember().getId();
        Optional<Member> member = memberRepository.findById(memberId);
        if (member.isPresent()) {
            DelivertUserDto delivertUserDto = new DelivertUserDto();
            delivertUserDto.setName(member.get().getName());
            delivertUserDto.setPhoneNum(member.get().getPhoneNum());
            return ResponseEntity.ok(delivertUserDto);
        } else {
            return ResponseEntity.ok("해당 유저의 이름과 폰번로를 반환하지 못했습니다.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?>authenticateMember(@Valid @RequestBody LoginRequestDto loginRequestDto){
        LoginResponseDto loginResponse = loginService.normalLogin(loginRequestDto);
        try{
            System.out.println("++++++++++++알림 보냅니다잉~~~~~~~~~~~~~");
            notificationService.sendWelcomeNotification(loginResponse.getMember());
        }
        catch (Exception e){
            log.error("Welcome notification failed to send for user {}",
                    loginResponse.getMember().getName(), e);

        }
        return ResponseEntity.ok(loginResponse);
    }

    // --- 회원가입 API ---
    @PostMapping("/signup") // ✅ 엔드포인트 명확화
    public ResponseEntity<?> signup(@Valid @RequestBody MemberDto memberFormDto, BindingResult bindingResult) {
        log.info("회원가입 요청 확인");
        // 1. 비밀번호 일치 여부 확인


        // 2. DTO 유효성 검사(@Valid) 결과 확인
        if (bindingResult.hasErrors()) {
            log.info("bindingResult 유효성 검사 진입");
            bindingResult.getFieldErrors().forEach(error -> {
                log.error("Field: [{}], RejectedValue: [{}], ErrorMessage: [{}]",
                        error.getField(),         // 오류가 발생한 필드 이름
                        error.getRejectedValue(), // 사용자가 입력한 값 (보안상 민감할 수 있으니 주의)
                        error.getDefaultMessage() // DTO에 설정된 에러 메시지
                );
            });
            return ResponseEntity.badRequest().body(createErrorMap(bindingResult));
        }

        try { log.info("Signup 시도");
            // ✅ 수정: 서비스의 새로운 join 메서드 호출 (보안 검증 포함)
            memberService.join(memberFormDto);
        } catch (IllegalStateException e) {
            log.error("signup시도 에러"+e);
            // 서비스에서 발생시킨 중복 이메일 또는 미인증 예외 처리
            Map<String, String> error = new HashMap<>();
            error.put("globalError", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body("회원가입이 성공적으로 완료되었습니다.");
    }
    // --- 이메일 인증 API ---
    @PostMapping("/signup/send-email") // ✅ 회원가입 하위 경로로 명확화
    public ResponseEntity<String> sendAuthEmail(@RequestBody EmailAuthRequestDto requestDto) {
        try {
            log.info("요청은 받음");
            memberService.sendAuthEmail(requestDto.getEmail());
            return ResponseEntity.ok("인증 메일이 발송되었습니다. 5분 안에 인증을 완료해주세요.");
        } catch (Exception e) {
            log.error("메일 발송 컨트롤러에서 예외 발생", e);
            return ResponseEntity.badRequest().body("메일 발송에 실패했습니다: " + e.getMessage());
        }
    }

    @PostMapping("/signup/verify-email") // ✅ 회원가입 하위 경로로 명확화
    public ResponseEntity<String> verifyEmail(@RequestBody EmailAuthRequestDto requestDto) {
        boolean isVerified = memberService.verifyAuthCode(requestDto.getEmail(), requestDto.getAuthCode());
        if (isVerified) {
            return ResponseEntity.ok("이메일 인증이 성공적으로 완료되었습니다.");
        } else {
            return ResponseEntity.badRequest().body("인증 코드가 일치하지 않거나 만료되었습니다.");
        }
    }

    // 유효성 검사 에러 메시지를 Map으로 변환하는 헬퍼 메서드
    private Map<String, String> createErrorMap(BindingResult bindingResult) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : bindingResult.getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return errors;
    }
}
