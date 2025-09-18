package yw.monsterInc.global.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import yw.monsterInc.global.Dto.ErrorResponseDto;

// ✅ @RestControllerAdvice: 모든 @RestController에서 발생하는 예외를 이 클래스가 가로채도록 설정합니다.
@RestControllerAdvice
public class GlobalExceptionHandler {
    // ✅ @ExceptionHandler에 우리가 만든 Custom Exception 클래스를 지정합니다.
    //    이제 EmailAlreadyExistsException 타입의 예외가 발생하면 무조건 이 메소드가 실행됩니다.
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDto> handleEmailAlreadyExistsException(
            EmailAlreadyExistsException ex,
            HttpServletRequest request
    ) {
        System.out.println("GlobalExceptionHandler가 이메일 중복 예외를 잡았습니다: " + ex.getMessage());
        // 우리가 만든 ErrorResponse DTO를 생성합니다.
        // HttpStatus.CONFLICT는 409 상태 코드를 의미합니다.
        ErrorResponseDto errorResponse = ErrorResponseDto.of(
                HttpStatus.CONFLICT,
                ex.getMessage(), // 서비스에서 던진 메시지를 그대로 사용
                request.getRequestURI() // 에러가 발생한 요청 경로
        );

        // 생성된 ErrorResponse 객체를 ResponseEntity에 담아 프론트엔드로 반환합니다.
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<String> handleCustomException(CustomException e) {
        // CustomException에 담겨있던 상태 코드와 메시지를 사용하여 ResponseEntity를 생성하고 반환합니다.
        // 이것이 프론트엔드로 전송됩니다.
        return ResponseEntity.status(e.getStatus()).body(e.getMessage());
    }

}
