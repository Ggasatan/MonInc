package yw.monsterInc.notification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // 추가
import org.springframework.security.core.annotation.AuthenticationPrincipal; // 추가
import org.springframework.web.bind.annotation.*;
import yw.monsterInc.global.CustomUserDetails;
import yw.monsterInc.member.entity.Member;
import yw.monsterInc.notification.entity.Notification;
import yw.monsterInc.notification.service.NotificationService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
// 컨트롤러 레벨에서 인증된 사용자만 접근 가능하도록 설정 (anonymousUser 접근을 원천 차단)
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;
    // MemberRepository는 보통 Service 계층에서만 사용되므로 컨트롤러에서 제거하는 것을 권장합니다.

    // @Autowired 대신 생성자 주입을 사용하는 것이 좋습니다. (권장사항)
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getUnreadNotificationCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Member member = userDetails.getMember();
        long unreadCount;

        // userDetails에서 직접 권한을 확인하는 것이 더 객체지향적입니다.
        if (isAdmin(userDetails)) {
            unreadCount = notificationService.getUnreadNotificationCountForAdmin(member.getId());
        } else {
            unreadCount = notificationService.getUnreadNotificationCount(member.getId());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("count", unreadCount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Member member = userDetails.getMember();
        List<Notification> notifications;

        if (isAdmin(userDetails)) {
            notifications = notificationService.getNotificationsForAdmin(member.getId());
        } else {
            notifications = notificationService.getNotificationsByUserId(member.getId());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("notifications", notifications);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Member member = userDetails.getMember();

        if (isAdmin(userDetails)) {
            notificationService.markAllAsReadForAdmin(member.getId());
        } else {
            notificationService.markAllAsRead(member.getId());
        }

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        Member member = userDetails.getMember();
        notificationService.markAsRead(id, member.getId());
        return ResponseEntity.ok().build();
    }

    /**
     * CustomUserDetails 객체로부터 관리자 여부를 확인하는 private 헬퍼 메소드
     */
    private boolean isAdmin(CustomUserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
    }
}