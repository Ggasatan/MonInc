package yw.monsterInc.order.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderDeliveryUpdateDto {
    private String recipientName;
    private String recipientPhone;
    private String recipientAddress;
    private String recipientDetailAddress;
    private String requestMessage;
}