package yw.monsterInc.order.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import yw.monsterInc.Product.entity.SaveOption;
import yw.monsterInc.Product.repository.SaveOptionRepository;
import yw.monsterInc.member.entity.Member;
import yw.monsterInc.notification.constant.NotificationCategory;
import yw.monsterInc.notification.dto.PaymentNotificationRequest;
import yw.monsterInc.order.constant.OrderStatus;
import yw.monsterInc.order.constant.PaymentStatus;
import yw.monsterInc.order.constant.PaymentType;
import yw.monsterInc.order.dto.PaymentPrepareRequestDto;
import yw.monsterInc.order.dto.PaymentPrepareResponseDto;
import yw.monsterInc.order.dto.PaymentVerifyRequestDto;
import yw.monsterInc.order.entity.Payment;
import yw.monsterInc.order.repository.OrderRepository;
import yw.monsterInc.order.repository.PaymentRepository;
import yw.monsterInc.notification.service.NotificationService;
import yw.monsterInc.order.entity.Order;
import yw.monsterInc.member.Repository.MemberRepository;

import static java.rmi.server.LogStream.log;


@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final MemberRepository memberRepository;
    private final OrderRepository orderRepository;
    private final SaveOptionRepository saveOptionRepository;
    private final IamportService iamportService;
    private final PaymentTransactionService paymentTransactionService;

    public PaymentPrepareResponseDto preparePayment(PaymentPrepareRequestDto requestDto, Member member) {
        return paymentTransactionService.preparePayment(requestDto, member);
    }


    /**
     * 결제를 완료 처리합니다.
     */
    public Payment completePayment(String impUid) {
        Payment payment = paymentRepository.findByImpUid(impUid)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다: " + impUid));

        payment.complete();
        payment.getOrder().complete();
        paymentRepository.save(payment);

        PaymentService.log.info("결제 완료: impUid={}, amount={}", impUid, payment.getAmount());
        return payment;
    }

    /**
     * 결제를 실패 처리합니다.
     */
    public Payment failPayment(String impUid, String failureReason) {
        Payment payment = paymentRepository.findByImpUid(impUid)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다: " + impUid));

        payment.fail(failureReason);
        payment.getOrder().fail();
        paymentRepository.save(payment);

        // 결제 실패 알림 전송
        sendPaymentFailureNotification(payment, failureReason);

        PaymentService.log.warn("결제 실패: impUid={}, reason={}", impUid, failureReason);
        return payment;
    }

    /**
     * 결제를 취소 처리합니다.
     */
    public Payment cancelPayment(String impUid) {
        Payment payment = paymentRepository.findByImpUid(impUid)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다: " + impUid));

        payment.cancel();
        payment.getOrder().cancel();
        paymentRepository.save(payment);

        // 결제 취소 알림 전송
        sendPaymentCancellationNotification(payment);

        PaymentService.log.info("결제 취소: impUid={}", impUid);
        return payment;
    }

    /**
     * impUid로 결제 정보를 조회합니다.
     */
    public Optional<Payment> findByImpUid(String impUid) {
        return paymentRepository.findByImpUid(impUid);
    }

    /**
     * merchantUid로 결제 정보를 조회합니다.
     */
    public Optional<Payment> findByMerchantUid(String merchantUid) {
        return paymentRepository.findByMerchantUid(merchantUid);
    }



    /**
     * 결제가 이미 처리되었는지 확인합니다.
     */
    public boolean isPaymentProcessed(String impUid) {
        return paymentRepository.existsByImpUid(impUid);
    }

    /**
     * 결제 성공 알림 전송
     */
    private void sendPaymentSuccessNotification(Payment payment) {
        try {
            Member member = memberRepository.findById(payment.getOrder().getOrderMember().getId())
                    .orElse(null);

            if (member != null) {
                String paymentMethod = getPaymentMethodDisplayName(payment.getPaymentType());
                String message = String.format("결제가 성공적으로 완료되었습니다. 금액: %,d%s, 결제수단: %s",
                        payment.getAmount(), "원", paymentMethod);

                PaymentNotificationRequest notificationDto = new PaymentNotificationRequest();
                notificationDto.setTargetUserId(member.getId());
                notificationDto.setMessage(message);
                notificationDto.setType("payment_success");
                notificationDto.setCategory(NotificationCategory.ORDER);
                notificationDto.setLink("/api/orders/payment/success?orderId=" + payment.getOrder().getId());
                notificationDto.setAmount(payment.getAmount());
                notificationDto.setPaymentMethod(paymentMethod);
                notificationDto.setOrderId(payment.getOrder().getId().toString());

                // 실시간 알림 전송
                notificationService.sendPaymentNotification(notificationDto);

                // DB에 알림 저장
                notificationService.savePaymentNotification(notificationDto,
                        "/api/orders/payment/success?orderId=" + payment.getOrder().getId());

                PaymentService.log.info("결제 성공 알림 전송 완료: userId={}, amount={}", member.getId(), payment.getAmount());
            }
        } catch (Exception e) {
            PaymentService.log.error("결제 성공 알림 전송 실패: paymentId={}, error={}", payment.getId(), e.getMessage());
        }
    }

    /**
     * 결제 실패 알림 전송
     */
    private void sendPaymentFailureNotification(Payment payment, String failureReason) {
        try {
            Member member = memberRepository.findById(payment.getOrder().getOrderMember().getId())
                    .orElse(null);

            if (member != null) {
                String paymentMethod = getPaymentMethodDisplayName(payment.getPaymentType());
                String message = String.format("결제가 실패했습니다. 금액: %,d%s, 결제수단: %s, 사유: %s",
                        payment.getAmount(),  "원", paymentMethod, failureReason);

                PaymentNotificationRequest notificationDto = new PaymentNotificationRequest();
                notificationDto.setTargetUserId(member.getId());
                notificationDto.setMessage(message);
                notificationDto.setType("payment_failed");
                notificationDto.setCategory(NotificationCategory.ORDER);
                notificationDto.setLink("/api/orders/payment/fail?message=" + failureReason);
                notificationDto.setAmount(payment.getAmount());
                notificationDto.setPaymentMethod(paymentMethod);
                notificationDto.setOrderId(payment.getOrder().getId().toString());

                // 실시간 알림 전송
                notificationService.sendPaymentNotification(notificationDto);

                // DB에 알림 저장
                notificationService.savePaymentNotification(notificationDto,
                        "/api/orders/payment/fail?message=" + failureReason);

                PaymentService.log.info("결제 실패 알림 전송 완료: userId={}, amount={}, reason={}",
                        member.getId(), payment.getAmount(), failureReason);
            }
        } catch (Exception e) {
            PaymentService.log.error("결제 실패 알림 전송 실패: paymentId={}, error={}", payment.getId(), e.getMessage());
        }
    }

    /**
     * 결제 취소 알림 전송
     */
    private void sendPaymentCancellationNotification(Payment payment) {
        try {
            Member member = memberRepository.findById(payment.getOrder().getOrderMember().getId())
                    .orElse(null);

            if (member != null) {
                String paymentMethod = getPaymentMethodDisplayName(payment.getPaymentType());
                String message = String.format("결제가 취소되었습니다. 금액: %,d%s, 결제수단: %s",
                        payment.getAmount(), "원", paymentMethod);

                PaymentNotificationRequest notificationDto = new PaymentNotificationRequest();
                notificationDto.setTargetUserId(member.getId());
                notificationDto.setMessage(message);
                notificationDto.setType("payment_cancelled");
                notificationDto.setCategory(NotificationCategory.ORDER);
                notificationDto.setLink("/api/orders/payment/cancel?orderId=" + payment.getOrder().getId());
                notificationDto.setAmount(payment.getAmount());
                notificationDto.setPaymentMethod(paymentMethod);
                notificationDto.setOrderId(payment.getOrder().getId().toString());

                // 실시간 알림 전송
                notificationService.sendPaymentNotification(notificationDto);

                // DB에 알림 저장
                notificationService.savePaymentNotification(notificationDto,
                        "/api/orders/payment/cancel?orderId=" + payment.getOrder().getId());

                PaymentService.log.info("결제 취소 알림 전송 완료: userId={}, amount={}", member.getId(), payment.getAmount());
            }
        } catch (Exception e) {
            PaymentService.log.error("결제 취소 알림 전송 실패: paymentId={}, error={}", payment.getId(), e.getMessage());
        }
    }

    /**
     * 결제 수단 표시명 반환
     */
    private String getPaymentMethodDisplayName(PaymentType paymentType) {
        switch (paymentType) {
            case CARD:
                return "신용카드";
            case BANK_TRANSFER:
                return "계좌이체";
            default:
                return "기타";
        }
    }



    /**
     * 결제를 검증하고 최종 처리합니다.
     * @param requestDto (impUid, merchantUid 포함)
     * @param member (현재 로그인한 사용자)
     */
    @Transactional
    public void verifyPayment(PaymentVerifyRequestDto requestDto, Member member) {
        System.out.println("MarId 뭐 그런거 ::::: "+requestDto.getMerchantUid());
        // 1. 우리 DB에서 주문 정보 조회
        // findByMerchantUid는 Optional<Payment>를 반환하므로 .orElseThrow()로 예외 처리
        Payment payment = paymentRepository.findByMerchantUid(requestDto.getMerchantUid())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다."));

        // 2. 주문한 사용자가 맞는지 확인 (선택적이지만 보안상 좋음)
        if (!payment.getOrder().getOrderMember().getId().equals(member.getId())) {
            throw new SecurityException("주문 정보에 접근할 권한이 없습니다.");
        }

        // 3. IamportService를 통해 아임포트 서버의 실제 결제 정보 조회
        com.siot.IamportRestClient.response.Payment iamportPayment = iamportService.getPaymentInfoByImpUid(requestDto.getImpUid());

        // 4. DB에 저장된 금액과 아임포트 서버의 실제 결제 금액 비교
        Long expectedAmount = payment.getAmount(); // DB에 기록된 결제되어야 할 금액
        Long actualAmount = iamportPayment.getAmount().longValue(); // 아임포트 서버에 기록된 실제 결제된 금액

        if (!expectedAmount.equals(actualAmount)) {
            // 결제 금액이 위변조된 경우
            PaymentService.log.error("결제 금액 위변조 시도: expected={}, actual={}, impUid={}",
                    expectedAmount, actualAmount, requestDto.getImpUid());
            // TODO: 결제 취소 로직을 여기에 추가할 수도 있음 (iamportService.cancelPayment(...))
            throw new IllegalStateException("결제 금액이 일치하지 않습니다.");
        }

        // 5. 모든 검증 통과! 결제 완료 처리
        PaymentService.log.info("결제 검증 성공! impUid={}, merchantUid={}", requestDto.getImpUid(), requestDto.getMerchantUid());

        // 형이 이미 만들어둔 completePayment 메서드를 재활용하자.
        // 이 메서드는 Payment와 Order 상태를 COMPLETED로 변경해 줄 거야.
        // 단, completePayment가 impUid를 받으니, Payment 객체를 업데이트하고 저장하는 로직으로 변경
        payment.complete(); // Payment 상태를 COMPLETED로 변경
        payment.setImpUid(requestDto.getImpUid()); // 성공한 impUid를 기록
        payment.getOrder().complete(); // Order 상태를 COMPLETED로 변경

        paymentRepository.save(payment);

        // 결제 성공 알림 전송
        sendPaymentSuccessNotification(payment);
    }

}
