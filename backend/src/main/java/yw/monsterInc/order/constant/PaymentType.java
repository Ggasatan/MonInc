package yw.monsterInc.order.constant;

public enum PaymentType {
    CARD("카드"),
    BANK_TRANSFER("계좌이체");

    private final String description;

    PaymentType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}