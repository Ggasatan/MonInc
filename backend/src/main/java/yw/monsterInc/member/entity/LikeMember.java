//package yw.monsterInc.member.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import yw.monsterInc.Product.entity.SaveOption;
//
//@Getter
//@Setter
//@Table(name="like_member")
//@Entity
//@Builder
//@NoArgsConstructor(access = AccessLevel.PROTECTED)
//@AllArgsConstructor
//public class LikeMember {
//    @Id
//    @Column(name = "like_member_id")
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @OneToOne(targetEntity = SaveOption.class, fetch = FetchType.LAZY)
//    @JoinColumn(name = "save_option_id")
//    private Long saveOptionId;
//
//    @OneToOne(targetEntity = Member.class, fetch = FetchType.LAZY)
//    @JoinColumn(name = "member_id")
//    private Long whoLike;
//}
