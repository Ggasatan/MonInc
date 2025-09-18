package yw.monsterInc.order.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import yw.monsterInc.global.CustomUserDetails;
import yw.monsterInc.member.Repository.MemberRepository;
import yw.monsterInc.member.entity.Member;
import yw.monsterInc.order.dto.PaymentPrepareRequestDto;
import yw.monsterInc.order.dto.PaymentPrepareResponseDto;
import yw.monsterInc.order.dto.PaymentVerifyRequestDto;
import yw.monsterInc.order.service.PaymentService;
import yw.monsterInc.order.service.PaymentTransactionService;

import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {
    private final MemberRepository memberRepository;
    private final PaymentService paymentService;

    @PostMapping("/prepare")
    public ResponseEntity<PaymentPrepareResponseDto> preparePayment(
            @RequestBody PaymentPrepareRequestDto requestDto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        PaymentPrepareResponseDto responseDto = paymentService.preparePayment(requestDto, userDetails.getMember());
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(
            @RequestBody PaymentVerifyRequestDto requestDto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        System.out.println("결제 시 로그인 회원 아이디"+userDetails.getMember().getId());
        paymentService.verifyPayment(requestDto, userDetails.getMember());

        // 검증 성공 시, 간단한 성공 메시지를 반환
        return ResponseEntity.ok("결제 검증이 성공적으로 완료되었습니다.");
    }

}
