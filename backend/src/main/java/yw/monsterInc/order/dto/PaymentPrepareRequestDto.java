package yw.monsterInc.order.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentPrepareRequestDto {
    private Long saveOptionId;

    private DeliveryInfoDto deliveryInfo;

    @Getter
    @Setter
    public static class DeliveryInfoDto {
        private String recipientName;
        private String recipientPhone;
        private String recipientAddress;
        private String recipientDetailAddress;
        private String requestMessage;
    }
}