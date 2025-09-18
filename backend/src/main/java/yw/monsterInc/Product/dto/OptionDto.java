//package yw.monsterInc.Product.dto;
//
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//import lombok.Setter;
//import yw.monsterInc.Product.constant.OptionCategory;
//import yw.monsterInc.Product.entity.Option;
//
//@Getter
//@Setter
//@NoArgsConstructor
//public class OptionDto {
//    private Long productId;
//
//    private OptionCategory parts;
//
//    private String optionName;
//
//    private String optionValue;
//
//    private String optionThumbnail;
//
//    private int optionPrice;
//
//    private int stock;
//
//    public OptionDto(Option entity) {
//        this.productId = entity.getId(); // 💡 실제 Entity의 getter 메소드 이름에 맞춰야 해.
//        this.parts = entity.getParts(); // 💡 parts 필드가 Enum이라면 .name()으로 문자열을 가져와야 해.
//        this.optionName = entity.getOptionName();
//        this.optionValue = entity.getOptionValue();
//        this.optionThumbnail = entity.getOptionThumbnail();
//        this.optionPrice = entity.getOptionPrice();
//        this.stock = entity.getStock();
//    }
//}
