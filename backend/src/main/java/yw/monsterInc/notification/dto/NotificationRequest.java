package yw.monsterInc.notification.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import yw.monsterInc.notification.constant.NotificationCategory;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest { // 팔로우 알림 왔을때 요청 데이터(db로 저장할 데이터)
    private Long targetUserId;   // 알림 받을 사람(팔로우 당한 사람)
    private Long senderUserId;   // 팔로우 건 사람
    private Long referenceId;       // 팔로우 관계 ID(필요시)
    private String message;      // 알림 메시지
    private String type = "follow"; // "follow"
    private NotificationCategory category;
    private String link; // 알림 클릭 시 이동할 경로
}