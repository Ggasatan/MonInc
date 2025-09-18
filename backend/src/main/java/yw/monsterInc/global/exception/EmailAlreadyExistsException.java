package yw.monsterInc.global.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// ✅ 이 예외가 발생하면, Spring이 자동으로 HTTP 409 Conflict 상태 코드를 응답하도록 설정합니다.
// 409 Conflict는 "요청이 서버의 현재 상태와 충돌하여 완료될 수 없음"을 의미하며,
// '이미 존재하는 리소스 생성 시도' 같은 경우에 아주 적합합니다.
@ResponseStatus(HttpStatus.CONFLICT)
public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}