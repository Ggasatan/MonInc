package yw.monsterInc.order.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import yw.monsterInc.member.entity.Member;
import yw.monsterInc.order.constant.OrderStatus;
import yw.monsterInc.order.dto.OrderDeliveryUpdateDto;
import yw.monsterInc.order.dto.OrderHistoryResponseDto;
import yw.monsterInc.order.entity.Order;
import yw.monsterInc.order.entity.Payment;
import yw.monsterInc.order.repository.OrderRepository;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final IamportService iamportService;

    /**
     * 주문의 배송 정보를 업데이트합니다.
     * @param orderId 업데이트할 주문의 ID
     * @param updateDto 배송 정보 DTO
     */
    public void updateOrderDeliveryInfo(Long orderId, OrderDeliveryUpdateDto updateDto) {
        // 1. 주문 ID로 주문 정보를 DB에서 조회합니다.
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("해당 주문을 찾을 수 없습니다. id=" + orderId));

        // 2. Order 엔티티에 만들어둔 비즈니스 메서드를 호출하여 정보를 업데이트합니다.
        order.updateDeliveryInfo(
                updateDto.getRecipientName(),
                updateDto.getRecipientPhone(),
                updateDto.getRecipientAddress(),
                updateDto.getRecipientDetailAddress(),
                updateDto.getRequestMessage()
        );

        // 3. @Transactional 어노테이션에 의해, 메서드가 끝나면 변경된 내용이 자동으로 DB에 저장(UPDATE)됩니다.
    }
    @Transactional(readOnly = true)
    public List<OrderHistoryResponseDto> getMyOrders(Member member) {
        List<Order> orders = orderRepository.findByOrderMemberWithDetails(member);
        return orders.stream()
                .map(OrderHistoryResponseDto::from)
                .collect(Collectors.toList());
    }

    // 주문 취소 (환불 요청)
    /**
     * [수정] 주문 취소 (실제 환불 로직 포함)
     */
    public void cancelOrder(Long memberId, Long orderId) {
        // 1. 주문 정보 조회 (Payment 정보까지 한번에 가져오기 위해 페치 조인 사용)
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        // 2. 각종 검증 (기존과 동일)
        if (!order.getOrderMember().getId().equals(memberId)) {
            throw new IllegalStateException("주문을 취소할 권한이 없습니다.");
        }
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("이미 취소된 주문입니다.");
        }
        // TODO: 배송 시작 등 취소 불가 상태에 대한 추가 검증 로직

        Payment payment = order.getPayment();
        if (payment == null || payment.getImpUid() == null) {
            throw new IllegalStateException("결제 정보가 없거나 유효하지 않아 환불을 진행할 수 없습니다.");
        }

        // 3. IamportService를 통해 실제 환불 요청!
        try {
            iamportService.cancelPaymentByImpUid(
                    payment.getImpUid(),
                    payment.getAmount(),
                    "사용자 주문 취소" // 환불 사유
            );
        } catch (Exception e) {
            // 아임포트 환불 실패 시, 더 이상 진행하지 않고 예외 발생
            log.error("실제 환불 처리 중 오류 발생: orderId={}", orderId, e);
            throw new RuntimeException("환불 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
        // 4. 실제 환불 성공 시, 우리 DB의 상태를 CANCELLED로 변경
        // (기존 로직과 동일)
        order.cancel();
        payment.cancel();
        // @Transactional에 의해 메서드가 끝나면 변경된 내용이 DB에 자동 저장됨
        log.info("주문 및 결제 상태 CANCELLED로 변경 완료: orderId={}", orderId);
    }
}
