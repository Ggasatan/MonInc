//package yw.monsterInc.mypage.dto;
//
//import lombok.AllArgsConstructor;
//import lombok.Getter;
//import yw.monsterInc.Product.constant.OptionCategory; // Option 엔티티의 enum
//import yw.monsterInc.Product.entity.Option;
//
//@Getter
//@AllArgsConstructor
//public class OptionDetailDto {
//    private String optionName;
//    private String optionThumbnail;
//    private OptionCategory category; // 'PARTS'인지 'SKIN'인지 구분하기 위한 카테고리
//
//    // Option 엔티티를 이 DTO로 변환하는 정적 팩토리 메서드
//    public static OptionDetailDto from(Option option) {
//        return new OptionDetailDto(
//                option.getOptionName(),
//                option.getOptionThumbnail(),
//                option.getParts() // Option 엔티티의 카테고리 필드
//        );
//    }
//}