package yw.monsterInc.chat.controller;

import java.util.List;
import java.util.Optional;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import lombok.RequiredArgsConstructor;
import yw.monsterInc.chat.constant.ChatMessageType;
import yw.monsterInc.chat.dto.ChatMessageRequestDto;
import yw.monsterInc.chat.entity.ChatMessage;
import yw.monsterInc.chat.service.ChatMessageService;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageService chatMessageService;
    private static final String INTERNAL_API_SECRET = "our-super-secret-key-for-internal-communication-12345";
    private static final String INTERNAL_API_HEADER = "X-Internal-API-Secret";
    private void checkInternalApiSecret(HttpServletRequest request) {
        String secretHeader = request.getHeader(INTERNAL_API_HEADER);
        if (!INTERNAL_API_SECRET.equals(secretHeader)) {
            // 키가 없거나 일치하지 않으면 예외 발생 -> 403 Forbidden과 유사한 효과
            throw new SecurityException("Invalid internal API secret");
        }
    }

    /**
     * 채팅 메시지 저장
     */
    @PostMapping("/messages")
    public ResponseEntity<ChatMessage> saveMessage(@RequestBody ChatMessageRequestDto request, HttpServletRequest servletRequest) {
        checkInternalApiSecret(servletRequest); // 검문!
        System.out.println("채팅 메시지 저장 요청: sender=" + request.getSender() + ", content=" + request.getContent() + ", type=" + request.getType() + ", recipient=" + request.getRecipient());
        ChatMessage savedMessage = chatMessageService.saveMessage(
                request.getSender(),
                request.getContent(),
                ChatMessageType.valueOf(request.getType().toUpperCase()),
                request.getRecipient()
        );
        return ResponseEntity.ok(savedMessage);
    }

    /**
     * 특정 사용자와의 채팅 내역 조회
     */
    @GetMapping("/messages/history/{username}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable String username) {
        System.out.println("🔍 채팅 내역 조회 요청: username=" + username);
        List<ChatMessage> history = chatMessageService.getChatHistory(username);
        System.out.println("📋 조회된 채팅 내역 수: " + history.size());
        for (ChatMessage msg : history) {
            System.out.println("  - " + msg.getSender() + " -> " + msg.getRecipient() + ": " + msg.getContent());
        }
        return ResponseEntity.ok(history);
    }

    /**
     * 사용자명 패턴 매칭으로 채팅 내역 조회 (정규화된 사용자명 지원)
     */
    @GetMapping("/messages/history/pattern/{username}")
    public ResponseEntity<List<ChatMessage>> getChatHistoryByPattern(@PathVariable String username) {
        System.out.println("🔍 패턴 매칭 채팅 내역 조회 요청: username=" + username);
        List<ChatMessage> history = chatMessageService.getChatHistoryByPattern(username);
        System.out.println("📋 패턴 매칭으로 조회된 채팅 내역 수: " + history.size());
        for (ChatMessage msg : history) {
            System.out.println("  - " + msg.getSender() + " -> " + msg.getRecipient() + ": " + msg.getContent());
        }
        return ResponseEntity.ok(history);
    }

    /**
     * 전체 채팅 내역 조회
     */
    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> getAllMessages() {
        List<ChatMessage> messages = chatMessageService.getAllMessages();
        return ResponseEntity.ok(messages);
    }

    /**
     * 모든 채팅 사용자 목록 조회
     */
    @GetMapping("/messages/users")
    public ResponseEntity<List<String>> getAllChatUsers(HttpServletRequest servletRequest) {
        checkInternalApiSecret(servletRequest); // 검문!
        System.out.println("👥 모든 채팅 사용자 목록 조회 요청");
        List<String> users = chatMessageService.getAllChatUsers();
        System.out.println("📋 조회된 사용자 목록: " + users);
        return ResponseEntity.ok(users);
    }

    /**
     * 특정 사용자의 최근 메시지 조회
     */
    @GetMapping("/messages/last/{username}")
    public ResponseEntity<ChatMessage> getLastMessage(@PathVariable String username) {
        System.out.println("📨 사용자 최근 메시지 조회 요청: username=" + username);
        ChatMessage lastMessage = chatMessageService.getLastMessage(username);
        System.out.println("📋 조회된 최근 메시지: " + (lastMessage != null ? lastMessage.getContent() : "없음"));
        return Optional.ofNullable(chatMessageService.getLastMessage(username))
                .map(ResponseEntity::ok) // 메시지가 있으면 200 OK와 함께 메시지 반환
                .orElse(ResponseEntity.noContent().build());
    }
}
