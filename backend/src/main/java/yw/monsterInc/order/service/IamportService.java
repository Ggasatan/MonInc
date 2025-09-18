package yw.monsterInc.order.service;

import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.request.CancelData;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
public class IamportService {

    @Value("${iamport.api.key}")
    private String apiKey;

    @Value("${iamport.api.secret}")
    private String apiSecret;

    private IamportClient iamportClient;

    @PostConstruct
    public void init() {
        // @PostConstruct: 의존성 주입이 완료된 후 실행되는 메서드.
        // apiKey와 apiSecret 값이 설정된 후에 IamportClient를 초기화하기 위해 사용.
        this.iamportClient = new IamportClient(apiKey, apiSecret);
    }

    /**
     * impUid로 아임포트 서버에서 실제 결제 정보를 조회합니다.
     * @param impUid 아임포트 결제 고유 번호
     * @return Payment 객체 (실제 결제 정보)
     */
    public Payment getPaymentInfoByImpUid(String impUid) {
        try {
            // iamportClient의 paymentByImpUid 메서드를 호출하여 결제 정보 조회
            IamportResponse<Payment> response = iamportClient.paymentByImpUid(impUid);

            // 응답의 code가 0이면 성공, 아니면 실패
            if (response.getCode() == 0) {
                log.info("아임포트 서버에서 결제 정보 조회 성공: impUid={}", impUid);
                return response.getResponse(); // 실제 결제 정보(Payment 객체) 반환
            } else {
                log.error("아임포트 결제 정보 조회 실패: code={}, message={}", response.getCode(), response.getMessage());
                // 여기서 커스텀 예외를 던지는 것이 더 좋음
                throw new RuntimeException("아임포트 API 오류: " + response.getMessage());
            }
        } catch (Exception e) {
            log.error("아임포트 API 호출 중 예외 발생: impUid={}", impUid, e);
            throw new RuntimeException("아임포트 API 호출 중 오류 발생", e);
        }
    }

    /**
     * [신규] impUid를 사용하여 결제를 취소(환불)합니다.
     * @param impUid 취소할 결제의 아임포트 고유 번호
     * @param amount 환불 요청 금액
     * @param reason 환불 사유
     */
    public void cancelPaymentByImpUid(String impUid, Long amount, String reason) {
        try {
            // 1. 환불 요청에 필요한 데이터 객체 생성
            CancelData cancelData = new CancelData(impUid, true); // true: 전액 환불
            cancelData.setReason(reason);
            // 아임포트는 금액을 BigDecimal로 받으므로 변환
            cancelData.setChecksum(BigDecimal.valueOf(amount));

            // 2. 아임포트 서버에 환불 요청 API 호출
            IamportResponse<Payment> response = iamportClient.cancelPaymentByImpUid(cancelData);

            // 3. 응답 결과 확인
            if (response.getCode() == 0) {
                log.info("아임포트 결제 취소 성공: impUid={}", impUid);
            } else {
                log.error("아임포트 결제 취소 실패: code={}, message={}", response.getCode(), response.getMessage());
                throw new RuntimeException("아임포트 API 오류: " + response.getMessage());
            }
        } catch (Exception e) {
            log.error("아임포트 API 호출 중 예외 발생 (환불): impUid={}", impUid, e);
            throw new RuntimeException("아임포트 API 호출 중 오류 발생 (환불)", e);
        }
    }
}