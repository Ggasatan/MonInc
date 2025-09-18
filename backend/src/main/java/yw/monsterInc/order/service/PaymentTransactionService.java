package yw.monsterInc.order.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import yw.monsterInc.Product.entity.Product;
import yw.monsterInc.Product.entity.SaveOption;
import yw.monsterInc.Product.repository.ProductRepository;
import yw.monsterInc.Product.repository.SaveOptionRepository;
import yw.monsterInc.member.entity.Member;
import yw.monsterInc.order.constant.OrderStatus;
import yw.monsterInc.order.constant.PaymentStatus;
import yw.monsterInc.order.constant.PaymentType;
import yw.monsterInc.order.dto.PaymentPrepareRequestDto;
import yw.monsterInc.order.dto.PaymentPrepareResponseDto;
import yw.monsterInc.order.entity.Order;
import yw.monsterInc.order.entity.Payment;
import yw.monsterInc.order.repository.OrderRepository;
import yw.monsterInc.order.repository.PaymentRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class PaymentTransactionService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final SaveOptionRepository saveOptionRepository;
    private final ProductRepository productRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public PaymentPrepareResponseDto preparePayment(PaymentPrepareRequestDto requestDto, Member member) {
        SaveOption saveOption = saveOptionRepository.findById(requestDto.getSaveOptionId())
                .orElseThrow(() -> new IllegalArgumentException("해당 저장 옵션을 찾을 수 없습니다. id=" + requestDto.getSaveOptionId()));

        Optional<Product> product = productRepository.findById(saveOption.getMon().getId());
        int totalPrice = product.get().getBasePrice();
        PaymentPrepareRequestDto.DeliveryInfoDto deliveryInfo = requestDto.getDeliveryInfo();
        Order order = Order.builder()
                .orderMember(member)
                .orderOption(saveOption)
                .totalPrice(totalPrice)
                .orderStatus(OrderStatus.PENDING)
                .isRead(false)
                .recipientName(deliveryInfo.getRecipientName())
                .recipientPhone(deliveryInfo.getRecipientPhone())
                .recipientAddress(deliveryInfo.getRecipientAddress())
                .recipientDetailAddress(deliveryInfo.getRecipientDetailAddress())
                .requestMessage(deliveryInfo.getRequestMessage())
                .build();
        orderRepository.save(order);
        orderRepository.flush();

        String merchantUid = "ORD-" + UUID.randomUUID().toString().substring(0, 8) + "-" + order.getId();

        // 형의 기존 createPayment 메서드를 재활용해서 Payment 생성
        this.createPayment(order, PaymentType.CARD, (long) totalPrice, null, merchantUid, null, null, null);

        return PaymentPrepareResponseDto.builder()
                .merchantUid(merchantUid)
                .productName(saveOption.getMon().getName())
                .amount((long) totalPrice)
                .buyerEmail(member.getEmail())
                .buyerName(member.getName())
                .build();
    }   /**
     * 결제 정보를 생성합니다.
     */
    public Payment createPayment(Order order, PaymentType paymentType, Long amount,
                                 String impUid, String merchantUid, String customerUid,
                                 String cardNumber, String cardType) {

        // 중복 결제 방지
        if (impUid != null && paymentRepository.existsByImpUid(impUid)) {
            throw new IllegalArgumentException("이미 처리된 결제입니다: " + impUid);
        }

        // 중복 주문 방지
        if (merchantUid != null && paymentRepository.existsByMerchantUid(merchantUid)) {
            throw new IllegalArgumentException("이미 존재하는 주문입니다: " + merchantUid);
        }

        Payment payment = Payment.builder()
                .order(order)
                .paymentType(paymentType)
                .paymentStatus(PaymentStatus.PENDING)
                .amount(amount)
                .impUid(impUid)
                .merchantUid(merchantUid)
                .customerUid(customerUid)
                .cardNumber(cardNumber)
                .cardType(cardType)
                .build();

        return paymentRepository.save(payment);
    }


    /**
     * 카드 결제를 처리합니다.
     */
    public Payment processCardPayment(Order order, Long amount, String impUid, String merchantUid,
                                      String customerUid, String cardNumber, String cardType) {
        return createPayment(order,PaymentType.CARD, amount, impUid, merchantUid, customerUid, cardNumber, cardType);
    }

    /**
     * 정기결제를 처리합니다.
     */
    public Payment processRecurringPayment(Order order, Long amount, String impUid, String merchantUid,
                                           String customerUid, String cardNumber, String cardType,
                                           LocalDateTime nextBillingDate) {
        Payment payment = createPayment(order,PaymentType.CARD, amount, impUid, merchantUid,
                customerUid, cardNumber, cardType);
        payment.setNextBillingDate(nextBillingDate);
        return paymentRepository.save(payment);
    }

}
