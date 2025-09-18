package yw.monsterInc.mypage.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import yw.monsterInc.global.CustomUserDetails;
import yw.monsterInc.member.entity.Member;
import yw.monsterInc.mypage.dto.MemberEditResponseDto;
import yw.monsterInc.mypage.dto.MemberUpdateRequestDto;
import yw.monsterInc.mypage.dto.MyPageResponseDto;
import yw.monsterInc.mypage.dto.SavedOptionResponseDto;
import yw.monsterInc.mypage.service.MyPageService;
import yw.monsterInc.order.dto.OrderHistoryResponseDto;
import yw.monsterInc.order.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/mypage") // 마이페이지 관련 경로는 여기로!
@RequiredArgsConstructor
public class MyPageController {
    private final OrderService orderService;
    private final MyPageService myPageService;

    @GetMapping("/me")
    public ResponseEntity<MyPageResponseDto> getMyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // 1. userDetails에서 이미 조회된 Member 객체를 직접 가져온다. (DB 재조회 X)
        Member member = userDetails.getMember();
        System.out.println("================이름 : "+member.getName());

        // 2. 응답용 DTO를 생성하여 필요한 데이터(이름)만 담는다.
        MyPageResponseDto responseDto = new MyPageResponseDto(member.getName());

        // 3. DTO를 반환한다. (이제 Member 엔티티의 민감 정보는 노출되지 않음)
        return ResponseEntity.ok(responseDto);
    }
    @GetMapping("/member-edit")
    public ResponseEntity<MemberEditResponseDto> getMemberInfoForEdit(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Member member = userDetails.getMember();
        // 정적 팩토리 메서드를 사용해서 DTO 생성
        MemberEditResponseDto responseDto = MemberEditResponseDto.from(member);
        return ResponseEntity.ok(responseDto);
    }

    // [신규] 회원정보 수정 요청 처리 API
    @PutMapping("/me")
    public ResponseEntity<String> updateMyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody MemberUpdateRequestDto updateRequestDto // 요청 본문을 DTO로 받음
    ) {
        Long memberId = userDetails.getMember().getId();
        myPageService.updateMemberInfo(memberId, updateRequestDto);
        return ResponseEntity.ok("회원 정보가 성공적으로 수정되었습니다.");
    }

    @GetMapping("/saved-options")
    public ResponseEntity<List<SavedOptionResponseDto>> getMySavedOptions(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<SavedOptionResponseDto> savedOptions = myPageService.findMySavedOptions(userDetails.getMember().getId());
        return ResponseEntity.ok(savedOptions);
    }

    @DeleteMapping("/saved-options/{id}")
    public ResponseEntity<String> deleteMySavedOption(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long savedOptionId
    ) {
        Long memberId = userDetails.getMember().getId();
        myPageService.deleteSavedOption(memberId, savedOptionId);
        return ResponseEntity.ok("성공적으로 삭제되었습니다.");
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderHistoryResponseDto>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Member member = userDetails.getMember();
        List<OrderHistoryResponseDto> orders = orderService.getMyOrders(member);
        return ResponseEntity.ok(orders);
    }

    // [신규] 주문 취소(환불 요청) API
    @PostMapping("/orders/{orderId}/cancel") // 상태 변경이므로 POST 또는 PUT/PATCH 사용
    public ResponseEntity<String> cancelMyOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long orderId
    ) {
        Long memberId = userDetails.getMember().getId();
        orderService.cancelOrder(memberId, orderId);
        return ResponseEntity.ok("주문이 성공적으로 취소되었습니다.");
    }
}