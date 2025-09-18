package yw.monsterInc.order.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import yw.monsterInc.order.dto.OrderDeliveryUpdateDto;
import yw.monsterInc.order.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * 특정 주문의 배송 정보를 업데이트하는 API
     * @param orderId URL 경로에 포함된 주문 ID
     * @param updateDto 요청 본문에 담긴 배송 정보
     */
    @PatchMapping("/{orderId}/delivery-info")
    public ResponseEntity<Void> updateDeliveryInfo(
            @PathVariable Long orderId,
            @RequestBody OrderDeliveryUpdateDto updateDto
    ) {
        orderService.updateOrderDeliveryInfo(orderId, updateDto);

        // 성공적으로 처리되었고, 별도의 응답 본문이 없음을 의미하는 204 No Content 상태를 반환합니다.
        return ResponseEntity.noContent().build();
    }
}