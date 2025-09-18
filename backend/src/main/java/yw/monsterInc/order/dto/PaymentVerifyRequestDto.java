package yw.monsterInc.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PaymentVerifyRequestDto {

    @JsonProperty("imp_uid")
    private String impUid;      // 아임포트 결제 고유번호

    @JsonProperty("merchant_uid")
    private String merchantUid; // 우리 시스템의 주문번호
}