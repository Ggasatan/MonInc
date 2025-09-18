package yw.monsterInc.order.entity;

import jakarta.persistence.*;
import lombok.*;
import yw.monsterInc.Product.entity.Product;
import yw.monsterInc.Product.entity.SaveOption;
import yw.monsterInc.global.BaseEntity;
import yw.monsterInc.member.entity.Member;
import yw.monsterInc.order.constant.OrderStatus;

@Getter
@Setter
@Table(name="orders")
@Entity
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Order  extends BaseEntity {
    @Id
    @Column(name = "order_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="order_member")
    private Member orderMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="order_option")
    private SaveOption orderOption;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Payment payment;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus; // PENDING, COMPLETED, CANCELLED, FAILED

    private int totalPrice;

    // ✅ [추가] 배송 정보 필드
    @Column(name = "recipient_name", length = 30)
    private String recipientName;

    @Column(name = "recipient_phone", length = 11)
    private String recipientPhone;

    @Column(name = "recipient_address")
    private String recipientAddress;

    @Column(name = "recipient_detail_address")
    private String recipientDetailAddress;

    @Column(name = "request_message")
    private String requestMessage;

    public void complete() {
        this.orderStatus = OrderStatus.COMPLETED;
    }

    public void cancel() {
        this.orderStatus = OrderStatus.CANCELLED;
    }

    public void fail() {
        this.orderStatus = OrderStatus.FAILED;
    }

    // ✅ [추가] 배송 정보를 업데이트하는 비즈니스 메서드
    public void updateDeliveryInfo(String recipientName, String recipientPhone, String recipientAddress, String recipientDetailAddress, String requestMessage) {
        this.recipientName = recipientName;
        this.recipientPhone = recipientPhone;
        this.recipientAddress = recipientAddress;
        this.recipientDetailAddress = recipientDetailAddress;
        this.requestMessage = requestMessage;
    }
}
