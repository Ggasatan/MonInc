package yw.monsterInc.order.dto;


import lombok.Builder;
import lombok.Getter;
import yw.monsterInc.order.constant.OrderStatus;
import yw.monsterInc.order.entity.Order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class OrderHistoryResponseDto {
    private Long orderId; // 주문 ID
    private String productName; // 상품 이름
    private LocalDateTime orderDate; // 주문 날짜 및 시간
    private int totalPrice; // 총 금액
    private OrderStatus orderStatus; // 주문 상태 (환불 버튼 표시 여부 결정)
    private String savedOptionName;
    // Order 엔티티를 이 DTO로 변환하는 정적 팩토리 메서드
    public static OrderHistoryResponseDto from(Order order) {
        // Order -> SaveOption -> 각 옵션 필드를 List<OptionDetailDto>로 변환

        return OrderHistoryResponseDto.builder()
                .orderId(order.getId())
                .productName(order.getOrderOption().getMon().getName())
                .orderDate(order.getRegTime()) // BaseEntity의 생성 시간 활용
                .totalPrice(order.getTotalPrice())
                .orderStatus(order.getOrderStatus())
                .savedOptionName(order.getOrderOption().getSaveName())
                .build();
    }
}