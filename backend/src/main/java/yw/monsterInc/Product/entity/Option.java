//package yw.monsterInc.Product.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import yw.monsterInc.Product.constant.OptionCategory;
//
//@Getter
//@Setter
//@Table(name="option_data")
//@Entity
//@Builder
//@NoArgsConstructor(access = AccessLevel.PROTECTED)
//@AllArgsConstructor
//public class Option {
//
//    @Id
//    @Column(name = "option_id")
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne
//    @JoinColumn(name = "mon")
//    private Product mon;
//
//    @Enumerated(EnumType.STRING)
//    private OptionCategory parts;
//
//    @Column(name = "option_name")
//    private String optionName;
//
//    @Column(name= "option_value")
//    private String optionValue;
//
//    @Column(name = "option_thumbnail")
//    private String optionThumbnail;
//
//    private int optionPrice;
//
//    private int stock;
//
//
//}
