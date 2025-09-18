package yw.monsterInc.order.dto;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentPrepareResponseDto {
    private String merchantUid; // 우리가 생성한 고유 주문 번호
    private String productName; // 결제창에 표시될 상품명
    private Long amount;        // 검증된 최종 결제 금액
    private String buyerEmail;  // 구매자 이메일 (JWT 토큰에서 가져올 예정)
    private String buyerName;   // 구매자 이름 (JWT 토큰에서 가져올 예정)
//    private Long orderId;
}