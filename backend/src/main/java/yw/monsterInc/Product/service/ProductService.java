package yw.monsterInc.Product.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import yw.monsterInc.Product.dto.*;
import yw.monsterInc.Product.entity.Product;
import yw.monsterInc.Product.entity.SaveOption;
import yw.monsterInc.Product.repository.ProductRepository;
import yw.monsterInc.Product.repository.SaveOptionRepository;
import yw.monsterInc.member.Repository.MemberRepository;
import yw.monsterInc.member.entity.Member;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service // 이 클래스가 비즈니스 로직을 담당하는 서비스 계층임을 명시
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository; // 데이터 조회를 위해 Repository를 주입받음
    private final SaveOptionRepository saveOptionRepository;
    private final MemberRepository memberRepository;
    private final ObjectMapper objectMapper;


    /**
     * 모든 상품 목록을 조회하여 ProductResponseDto 리스트로 변환 후 반환한다.
     * @return ProductResponseDto의 리스트
     */
    @Transactional(readOnly = true)
    public List<ProductResponseDto> findAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductResponseDto::new) // 생성자 참조로 더 깔끔하게
                .collect(Collectors.toList());
    }

//    public void saveOption(OptionDto optionDto) {
//        // 1. DTO에서 productId를 이용해 Product 엔터티를 조회합니다.
//        Product product = productRepository.getReferenceById(optionDto.getProductId());
//        if (product.getId()==null){
//            System.out.println("=========해당 상품을 찾을 수 없습니다. : "+optionDto.getProductId());
//        }
//        optionRepository.save(
//                Option.builder()
//                        .parts(optionDto.getParts())
//                        .optionName(optionDto.getOptionName())
//                        .optionPrice(optionDto.getOptionPrice())
//                        .stock(optionDto.getStock())
//                        .optionValue(optionDto.getOptionValue())
//                        .optionThumbnail(optionDto.getOptionThumbnail())
//                        .mon(product) // @JoinColumn 필드에는 조회한 Product 객체를 그대로 전달합니다.
//                        .build()
//        );
//        // 2. 빌더 패턴을 사용하여 Option 엔터티를 생성합니다.
//    }

    @Transactional // 데이터를 저장하므로 readOnly=false (기본값)
    public void saveProduct(ProductDto productDto) {

        productRepository.save(
                Product.builder()
                        .name(productDto.getName())
                        .imageUrl(productDto.getImageUrl())
                        .modelUrl(productDto.getModelUrl())
                        .monWidth(productDto.getMonWidth())
                        .monHigh(productDto.getMonHigh())
                        .basePrice(productDto.getBasePrice())
                        .status(productDto.getStatus())
                        .build()
        );
    }

    public SaveOption  saveSaveOption(SaveOptionDto saveOptionDto, Long memberId){

        Product mon = productRepository.getReferenceById(saveOptionDto.getMon());
        if (mon.getId()==null){
            System.out.println("=========해당 상품을 찾을 수 없습니다. : "+saveOptionDto.getMon());
        }
        Member member = memberRepository.getReferenceById(memberId);

        return saveOptionRepository.save(
                SaveOption.builder()
                        .saveName(saveOptionDto.getSaveName())
                        .mon(mon)
                        .member(member)
                        .materialOverrides(saveOptionDto.getMaterialOverrides())
                        .build()
        );
    }

//    @Transactional(readOnly = true)
//    public List<OptionDto> findOptionsByProductId(Long productId){
//        List<Option>options = optionRepository.findAllByMon_Id(productId);
//        // 2. 조회된 Entity 'List'를 DTO 'List'로 변환한다. (Stream API 사용)
//        return options.stream()
//                .map(option -> new OptionDto(option)) // Entity -> DTO 변환
//                .collect(Collectors.toList()); // 최종적으로 List로 수집
//    }

    /**
     * ✅ [추가] ID로 상품 하나를 조회하여 ProductDetailDto로 반환한다.
     */
    @Transactional(readOnly = true)
    public ProductDetailDto findProductById(Long productId) {
        // 1. Repository를 통해 ID로 Product Entity를 DB에서 조회한다.
        Product product = productRepository.findById(productId)
                // 💡 [코드 확인 필요] 상품이 없을 경우 예외 처리
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다. id=" + productId));
        // 2. 조회한 Entity를 DTO로 변환하여 반환한다.
        return new ProductDetailDto(product, objectMapper);
    }

    // ✅ [추가] 특정 멤버 ID로 저장된 모든 옵션을 DTO 리스트로 조회하는 메소드
    @Transactional(readOnly = true)
    public List<SavedOptionSimpleDto> findSavedOptionsByMemberId(Long memberId) {
        return saveOptionRepository.findAllByMember_Id(memberId).stream()
                .map(SavedOptionSimpleDto::new) // saveOption -> new SavedOptionSimpleDto(saveOption)
                .collect(Collectors.toList());
    }

}