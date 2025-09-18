package yw.monsterInc.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import yw.monsterInc.Product.constant.OptionCategory;
import yw.monsterInc.Product.constant.ProductStatus;
import yw.monsterInc.Product.dto.SaveOptionDto;
import yw.monsterInc.Product.entity.Product;
import yw.monsterInc.Product.repository.ProductRepository;
import yw.monsterInc.Product.service.ProductService;
import yw.monsterInc.member.Repository.MemberRepository;
import yw.monsterInc.member.constant.MemberRole;
import yw.monsterInc.member.entity.Member;

import java.util.Map;
import java.util.Random;

import static yw.monsterInc.Product.constant.ProductStatus.*;

@Configuration
@Profile({"local"}) // 'dev'와 'prod' 프로필 모두에서 적용됩니다.
@RequiredArgsConstructor
public class Datalnitiamizer {
    private final MemberRepository memberRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Bean
    public CommandLineRunner initData(){
        return args -> {
            Random r = new Random();
            if (memberRepository.findByEmail("admin@test.com").isEmpty()){
                Member admin = Member.builder()
                        .email("admin@test.com")
                        .name("몬스터주식회사")
                        .phoneNum("08988880000")
                        .password(passwordEncoder.encode("password"))
                        .memberRole(MemberRole.ADMIN)
                        .birthDate(null)
                        .socialId(null)
                        .socialType(null)
                        .build();
                memberRepository.save(admin);
            }
            Member user = null;
            if (memberRepository.findByEmail("user@test.com").isEmpty()){
                user = Member.builder()
                        .email("user@test.com")
                        .name("마이스와죠스키")
                        .phoneNum("04944440000")
                        .password(passwordEncoder.encode("password"))
                        .memberRole(MemberRole.USER)
                        .birthDate(null)
                        .socialId(null)
                        .socialType(null)
                        .build();
                memberRepository.save(user);
            }

            String[] monName = {"젠트고스트","스켈리","샤키"};
            ProductStatus[] statuses = {ON_SALE,OUT_OF_STOCK, CURRENTLY_UNAVAILABLE, DISCONTINUED};
            Product angryBobProduct = null;

            for (int i = 0 ; i<3 ; i++){
                String materialMapJsonString = null;
                String modelUrl = null;
                ProductStatus statusess ;

                // ✅ 2. i가 1일 때만 Map을 JSON 문자열로 변환해서 변수에 담는다
                if (i == 0) {
                    modelUrl="/models/white_Ghost.glb";
                    statusess = statuses[0];
                } else if (i==2){
                    modelUrl="/models/Sharky.glb";
                    statusess = statuses[3];
                } else {
                    modelUrl="/models/Skeleton.glb";
                    statusess = statuses[3];
                }
                Product productToSave  = Product.builder()
                        .name(monName[i])
                        .monWidth(300+i)
                        .monHigh(500+(7*i))
                        .imageUrl("https://picsum.photos/300/300?random="+i)
                        .modelUrl(modelUrl)
                        .basePrice(r.nextInt(8)+20)
                        .status(statusess)
                        .build();
                Product savedProduct = productRepository.save(productToSave);
                if (i == 0) {
                    angryBobProduct = savedProduct; // ID가 부여된 '앵그리밥' 객체를 저장해 둔다.
                }
            }
        System.out.println("========초기 데이터 생성 완료=========");
        };
    }
}
