package yw.monsterInc.Product.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import yw.monsterInc.Product.dto.*;
import yw.monsterInc.Product.entity.SaveOption;
import yw.monsterInc.Product.service.ProductService;
import yw.monsterInc.global.CustomUserDetails;

import java.util.List;

@RestController
@RequestMapping("/api/products") // 이 컨트롤러의 모든 API는 '/api'로 시작
@RequiredArgsConstructor // final 필드에 대한 생성자를 자동으로 만들어줘. (의존성 주입)
public class ProductController {

    // final로 선언해서 의존성 주입을 받을 Service (아직 만들진 않았어)
    private final ProductService productService;

    /**
     * ✅ [추가] 상품 상세 정보를 조회하는 API
     * 프론트엔드의 GET /api/products/{productId} 요청을 처리
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDetailDto> getProductDetail(@PathVariable Long productId) {
        // 1. Service에게 상품 조회를 위임
        ProductDetailDto productDto = productService.findProductById(productId);

        // 2. 조회된 DTO를 ResponseEntity에 담아 성공(200 OK) 상태와 함께 반환
        return ResponseEntity.ok(productDto);
    }

    @GetMapping("/grid") // GET /api/products 요청을 처리
    public List<ProductResponseDto> getProducts() {
        // Service에게 상품 목록 조회를 위임하고, 결과를 그대로 반환.
        return productService.findAllProducts();
    }
//
//    @GetMapping("{productId}/options")
//    public List<OptionDto> getProductOption(@PathVariable Long productId){
//        return productService.findOptionsByProductId(productId);
//    }

    @PostMapping("/options")
    public ResponseEntity<SaveOptionResponseDto> saveSelectedOptions(
            // @RequestBody: HTTP 요청의 본문(body)에 담겨 온 JSON 데이터를
            // SaveOptionRequestDto 객체로 자동으로 변환해서 받아줘.
            @RequestBody SaveOptionDto requestDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            // 예를 들어 401 Unauthorized 에러를 반환
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long memberId = userDetails.getMember().getId();
        SaveOption saveOption = productService.saveSaveOption(requestDto, memberId); // Service에 DTO를 그대로 전달

        // 성공적으로 처리되었음을 클라이언트에게 알림.
        // 보통은 저장된 리소스의 ID나 상태 메시지를 담아서 보내는 게 더 좋아.
        // 예: return ResponseEntity.ok("성공적으로 저장되었습니다.");
        // 예: return ResponseEntity.constant(HttpStatus.CREATED).body(savedId);
        return ResponseEntity.ok(new SaveOptionResponseDto(saveOption));
    }
    @GetMapping("/me/saved-options")
    public ResponseEntity<List<SavedOptionSimpleDto>> getMySavedOptions(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long memberId = userDetails.getMember().getId();
        List<SavedOptionSimpleDto> myOptions = productService.findSavedOptionsByMemberId(memberId);
        return ResponseEntity.ok(myOptions);
    }

}
