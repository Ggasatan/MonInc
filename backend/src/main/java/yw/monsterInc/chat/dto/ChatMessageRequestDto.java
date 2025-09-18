package yw.monsterInc.chat.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageRequestDto {
    private String sender;
    private String content;
    private String type;
    private String recipient;
}
