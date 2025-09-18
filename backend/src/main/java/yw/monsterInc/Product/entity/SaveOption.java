package yw.monsterInc.Product.entity;

import jakarta.persistence.*;
import lombok.*;
import yw.monsterInc.global.BaseEntity;
import yw.monsterInc.member.entity.Member;

@Getter
@Setter
@Entity
@Table(name = "save_option") // 테이블 이름을 명시적으로 지정하는 것이 좋습니다.
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class SaveOption extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "save_option_id") // 기본 키 컬럼 이름도 명시적으로 지정
    private Long id;

    private String saveName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product mon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id ")
    private Member member;

    // ✅ [추가] JSON 문자열을 저장할 새로운 컬럼
    @Lob // Large Object의 약자로, TEXT 타입 컬럼에 매핑됩니다.
    @Column(name = "material_overrides")
    private String materialOverrides;
}