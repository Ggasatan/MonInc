package yw.monsterInc.notification.service;

import java.util.ArrayList;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import yw.monsterInc.member.entity.Member;
import yw.monsterInc.notification.constant.NotificationCategory;
import yw.monsterInc.notification.dto.NotificationRequest;
import yw.monsterInc.notification.dto.PaymentNotificationRequest;
import yw.monsterInc.notification.entity.Notification;
import yw.monsterInc.notification.repository.NotificationRepository;


@Service
public class NotificationService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final NotificationRepository notificationRepository;

    @Value("${notification.nestjs.url.user}")
    private String nestjsNotifyUrl;

    @Value("${notification.nestjs.url.admin}")
    private String nestjsAdminNotifyUrl;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    /**
     4  * 사용자 로그인 시 환영 알림을 생성하고 전송합니다.
     5  * (Member 객체에 getUsername() 메서드가 있다고 가정합니다.)
     6  *
     7  * @param member 로그인한 사용자 엔티티
     8  */
    public void sendWelcomeNotification(Member member) {
        String message = member.getName() + "님, 환영합니다.";

        // DB에 저장할 Notification 객체 생성
        System.out.println("++++++++++++알림 객체 만듭니다잉~~~~~~~~~~~~~");
        Notification notification = Notification.builder()
            .targetUserId(member.getId())
            .senderUserId(0L) // 시스템 알림은 sender ID를 0으로 설정
            .message(message)
            .type("WELCOME")
            .category(NotificationCategory.ADMIN)
            .isRead(false)
            .link("/") // 알림 클릭 시 이동할 URL
            .build();
        notificationRepository.save(notification);

        // 실시간 알림 전송을 위한 DTO 생성 (기존 FollowNotificationRequest 재활용)
        System.out.println("++++++++++++알림Dto에 담습니다잉~~~~~~~~~~~~~");
        NotificationRequest requestDto = new NotificationRequest();
        requestDto.setTargetUserId(member.getId());
        requestDto.setSenderUserId(0L);
        requestDto.setMessage(message);
        requestDto.setType("WELCOME");
        requestDto.setCategory(NotificationCategory.ADMIN);
        requestDto.setLink("/");
        // NestJS로 실시간 알림 전송
        try {
            System.out.println("++++++++++++알림 redis에 담습니다잉~~~~~~~~~~~~~");
                restTemplate.postForObject(nestjsNotifyUrl, requestDto, Void.class);
            } catch (Exception e) {
            System.err.println("실시간 환영 알림 전송 실패: " + e.getMessage());
        }
    }
//
//    public void sendNotification(FollowNotificationRequest dto) {
//        try {
//            restTemplate.postForObject(NESTJS_NOTIFY_URL, dto, Void.class);
//        } catch (Exception e) {
//            // 실시간 알림 서버 에러는 로깅만 하고 계속 진행
//            System.err.println("실시간 알림 전송 실패: " + e.getMessage());
//        }
//    }
//
//    public void sendNotification(ReviewNotificationRequest dto) {
//        try {
//            restTemplate.postForObject(NESTJS_NOTIFY_URL, dto, Void.class);
//        } catch (Exception e) {
//            // 실시간 알림 서버 에러는 로깅만 하고 계속 진행
//            System.err.println("실시간 알림 전송 실패: " + e.getMessage());
//        }
//    }
//
//    public void sendNotification(InquiryNotificationRequest dto) {
//        try {
//            restTemplate.postForObject(NESTJS_NOTIFY_URL, dto, Void.class);
//        } catch (Exception e) {
//            // 실시간 알림 서버 에러는 로깅만 하고 계속 진행
//            System.err.println("실시간 알림 전송 실패: " + e.getMessage());
//        }
//    }
//
//    public void sendNotificationToAdminGroup(SellerRequestNotificationRequest dto) {
//        try {
//            restTemplate.postForObject(NESTJS_ADMIN_NOTIFY_URL, dto, Void.class);
//        } catch (Exception e) {
//            // 실시간 알림 서버 에러는 로깅만 하고 계속 진행
//            System.err.println("관리자 실시간 알림 전송 실패: " + e.getMessage());
//        }
//    }
//
    // 결제 알림 전송 (실시간)
    public void sendPaymentNotification(PaymentNotificationRequest dto) {
        try {
            restTemplate.postForObject(nestjsNotifyUrl, dto, Void.class);
        } catch (Exception e) {
            // 실시간 알림 서버 에러는 로깅만 하고 계속 진행
            System.err.println("결제 실시간 알림 전송 실패: " + e.getMessage());
        }
    }
//
//    // 알림을 DB에 저장하는 메서드
//    public Notification saveNotification(FollowNotificationRequest dto, String link) {
//        // 팔로우 알림의 경우 중복 체크
//        if ("follow".equals(dto.getType())) {
//            // 같은 사용자 간의 팔로우 알림이 이미 존재하는지 확인
//            boolean exists = notificationRepository.existsBySenderUserIdAndTargetUserIdAndType(
//                    dto.getSenderUserId(), dto.getTargetUserId(), "follow");
//
//            if (exists) {
//                // 이미 팔로우 알림이 존재하면 null 반환 (알림 생성하지 않음)
//                return null;
//            }
//        }
//
//        Notification notification = Notification.builder()
//                .senderUserId(dto.getSenderUserId())
//                .targetUserId(dto.getTargetUserId())
//                .message(dto.getMessage())
//                .type(dto.getType())
//                .category(dto.getCategory())
//                .isRead(false)
//                .link(link)
//                .build();
//        return notificationRepository.save(notification);
//    }

    // 사용자의 읽지 않은 알림 개수 조회
    public long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByTargetUserIdAndIsReadFalse(userId);
    }

    // 관리자의 읽지 않은 알림 개수 조회 (개인 + 관리자 알림)
    public long getUnreadNotificationCountForAdmin(Long userId) {
        return notificationRepository.countUserAndAdminUnreadNotifications(userId, NotificationCategory.ADMIN);
    }
//
//    // 작가 신청 알림을 DB에 저장하는 메서드
//    public Notification saveSellerRequestNotification(SellerRequestNotificationRequest dto, String link) {
//        // 판매자 요청 알림 저장
//        StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
//        for (int i = 1; i < Math.min(stackTrace.length, 8); i++) {
//            // 스택 트레이스 정보
//        }
//        Notification notification = Notification.builder()
//                .senderUserId(0L) // 시스템에서 보내는 알림이므로 0으로 설정
//                .targetUserId(dto.getTargetUserId())
//                .message(dto.getMessage())
//                .type(dto.getType())
//                .category(dto.getCategory())
//                .isRead(false)
//                .link(link)
//                .build();
//        return notificationRepository.save(notification);
//    }
//
    // 결제 알림을 DB에 저장하는 메서드
    public Notification savePaymentNotification(PaymentNotificationRequest dto, String link) {
        // 결제 알림 저장
        Notification notification = Notification.builder()
                .senderUserId(0L) // 시스템에서 보내는 알림이므로 0으로 설정
                .targetUserId(dto.getTargetUserId())
                .message(dto.getMessage())
                .type(dto.getType())
                .category(dto.getCategory())
                .isRead(false)
                .link(link)
                .build();
        return notificationRepository.save(notification);
    }
//
//    // 좋아요 알림을 DB에 저장하는 메서드 (최초 좋아요에만 알림)
//    public Notification saveLikeNotification(Long senderUserId, Long targetUserId, Long productId, String message, String link) {
//        // 중복 체크: sender, target, type, productId
//        boolean exists = notificationRepository.existsBySenderUserIdAndTargetUserIdAndTypeAndProductId(
//                senderUserId, targetUserId, "like", productId);
//        if (exists) {
//            // 이미 알림이 존재하면 null 반환 (알림 생성하지 않음)
//            return null;
//        }
//        Notification notification = Notification.builder()
//                .senderUserId(senderUserId)
//                .targetUserId(targetUserId)
//                .message(message)
//                .type("like")
//                .category(com.creatorworks.nexus.notification.entity.NotificationCategory.SOCIAL)
//                .isRead(false)
//                .link(link)
//                .productId(productId)
//                .build();
//        return notificationRepository.save(notification);
//    }
//
//    // 후기 알림을 DB에 저장하는 메서드
//    public Notification saveReviewNotification(Long senderUserId, Long targetUserId, Long productId, String message, String link, int rating) {
//        // 중복 체크: sender, target, type, productId
//        boolean exists = notificationRepository.existsBySenderUserIdAndTargetUserIdAndTypeAndProductId(
//                senderUserId, targetUserId, "review", productId);
//        if (exists) {
//            // 이미 알림이 존재하면 null 반환 (알림 생성하지 않음)
//            return null;
//        }
//        Notification notification = Notification.builder()
//                .senderUserId(senderUserId)
//                .targetUserId(targetUserId)
//                .message(message)
//                .type("review")
//                .category(com.creatorworks.nexus.notification.entity.NotificationCategory.SOCIAL)
//                .isRead(false)
//                .link(link)
//                .productId(productId)
//                .build();
//        return notificationRepository.save(notification);
//    }
//
//    // 문의 알림을 DB에 저장하는 메서드
//    public Notification saveInquiryNotification(Long senderUserId, Long targetUserId, Long productId, String message, String link) {
//        // 문의는 같은 상품에 여러 번 달 수 있으므로 중복 체크하지 않음
//        Notification notification = Notification.builder()
//                .senderUserId(senderUserId)
//                .targetUserId(targetUserId)
//                .message(message)
//                .type("inquiry")
//                .category(com.creatorworks.nexus.notification.entity.NotificationCategory.SOCIAL)
//                .isRead(false)
//                .link(link)
//                .productId(productId)
//                .build();
//        return notificationRepository.save(notification);
//    }
//
    // 사용자의 알림 목록 조회
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByTargetUserIdOrderByCreatedAtDesc(userId);
    }

    // 관리자의 알림 목록 조회 (개인 + 관리자 알림)
    public List<Notification> getNotificationsForAdmin(Long userId) {
        return notificationRepository.findUserAndAdminNotifications(userId, NotificationCategory.ADMIN);
    }

    // 전체 알림 읽음 처리
    public void markAllAsRead(Long userId) {
        List<Notification> notis = notificationRepository.findByTargetUserIdAndIsReadFalse(userId);
        for (Notification n : notis) n.setIsRead(true);
        notificationRepository.saveAll(notis);
    }

    // 관리자의 전체 알림 읽음 처리 (개인 + 관리자 알림)
    public void markAllAsReadForAdmin(Long userId) {
        // 개인 알림 읽음 처리
        List<Notification> personalNotis = notificationRepository.findByTargetUserIdAndIsReadFalse(userId);
        for (Notification n : personalNotis) n.setIsRead(true);

        // 관리자 알림 읽음 처리 (TARGET_USER_ID = 0, ADMIN 카테고리)
        List<Notification> adminNotis = notificationRepository.findByTargetUserIdAndCategoryOrderByCreatedAtDesc(
                0L, NotificationCategory.ADMIN);
        List<Notification> unreadAdminNotis = adminNotis.stream()
                .filter(n -> !n.getIsRead())
                .collect(java.util.stream.Collectors.toList());
        for (Notification n : unreadAdminNotis) n.setIsRead(true);

        // 모든 변경사항 저장
        List<Notification> allNotis = new ArrayList<>();
        allNotis.addAll(personalNotis);
        allNotis.addAll(unreadAdminNotis);
        if (!allNotis.isEmpty()) {
            notificationRepository.saveAll(allNotis);
        }
    }

    // 개별 알림 읽음 처리
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification == null) {
            return;
        }

        // 개인 알림이거나 관리자 알림인 경우 읽음 처리
        boolean isPersonalNotification = notification.getTargetUserId().equals(userId);
        boolean isAdminNotification = notification.getTargetUserId().equals(0L) &&
                notification.getCategory() == NotificationCategory.ADMIN;

        if (isPersonalNotification || isAdminNotification) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }
}