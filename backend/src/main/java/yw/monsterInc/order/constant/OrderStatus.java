package yw.monsterInc.order.constant;

public enum OrderStatus {
    PENDING("대기중"),
    COMPLETED("완료"),
    CANCELLED("취소"),
    FAILED("실패");

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
