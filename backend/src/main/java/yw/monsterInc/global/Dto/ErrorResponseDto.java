package yw.monsterInc.global.Dto;

import lombok.Getter;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;

@Getter
public class ErrorResponseDto {
    private final LocalDateTime timestamp = LocalDateTime.now();
    private final int status;
    private final String error;
    private final String message;
    private final String path;

    // 생성자를 통해 필드를 초기화합니다.
    public ErrorResponseDto(int status, String error, String message, String path) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    /**
     * 더 간단한 생성을 위한 정적 팩토리 메소드입니다.
     * 이 메소드를 사용하면 new ErrorResponseDto(...) 보다 더 간결하게 객체를 생성할 수 있습니다.
     * 예시: ErrorResponseDto.of(HttpStatus.CONFLICT, "에러메시지", "/api/path")
     */
    public static ErrorResponseDto of(HttpStatus httpStatus, String message, String path) {
        // httpStatus.value()는 숫자 코드(e.g., 409)를 반환합니다.
        // httpStatus.getReasonPhrase()는 상태 메시지(e.g., "Conflict")를 반환합니다.
        return new ErrorResponseDto(httpStatus.value(), httpStatus.getReasonPhrase(), message, path);
    }
}
