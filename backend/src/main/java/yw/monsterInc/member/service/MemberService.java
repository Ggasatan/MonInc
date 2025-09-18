package yw.monsterInc.member.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import yw.monsterInc.global.CustomUserDetails;
import yw.monsterInc.member.Dto.AdditionalInfoRequestDto;
import yw.monsterInc.member.Dto.MemberDto;
import yw.monsterInc.member.Repository.MemberRepository;
import yw.monsterInc.member.constant.MemberRole;
import yw.monsterInc.member.entity.Member;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MemberService implements UserDetailsService {
    private final StringRedisTemplate redisTemplate;
    private final MemberRepository memberRepository;
    private final JavaMailSender javaMailSender;
    private final PasswordEncoder passwordEncoder;
    //redis key접두사
    private static final String AUTH_CODE_PREFIX = "AuthCode:";
    private static final String VERIFIED_PREFIX = "Verified:";


    @Transactional(readOnly = false)
    public Long join(MemberDto memberFormDto) {
        // 2. 이메일 중복 가입 확인
        if (memberRepository.findByEmail(memberFormDto.getEmail()).isPresent()) {
            throw new IllegalStateException("이미 가입된 이메일입니다.");
        }

        if (!isEmailVerified(memberFormDto.getEmail())) {
            throw new IllegalStateException("이메일 인증이 완료되지 않았습니다.");
        }


        // 3. DTO를 Entity로 변환하여 저장
        Member member = Member.createMember(memberFormDto, passwordEncoder);
        Member savedMember = memberRepository.save(member);

        // 4. 사용 완료된 이메일 인증 정보 삭제
        deleteVerifiedEmailState(memberFormDto.getEmail());

        return savedMember.getId();
    }

    /**
     * 인증 메일 발송 및 Redis에 인증 코드 저장
     * @param email 발송할 이메일 주소
     */
    public void sendAuthEmail(String email) {
        log.info("코드생성까지 돌입!");
        String authCode = UUID.randomUUID().toString().substring(0, 8);
        String key = AUTH_CODE_PREFIX + email;
        log.info("인증코드 :{}", authCode);
        // Redis에 인증 코드 저장 (유효 시간 5분)
        redisTemplate.opsForValue().set(key, authCode, Duration.ofMinutes(5));

        // 실제 이메일 발송
        sendEmail(email, "회원가입 이메일 인증", "인증 코드: " + authCode);
        log.info("메일 전송까지 함!");
    }

    /**
     * 이메일 인증 코드 검증
     * @param email 검증할 이메일 주소
     * @param authCode 사용자가 입력한 인증 코드
     * @return 인증 성공 여부
     */
    public boolean verifyAuthCode(String email, String authCode) {
        String key = AUTH_CODE_PREFIX + email;
        String redisAuthCode = redisTemplate.opsForValue().get(key);

        if (redisAuthCode == null || !redisAuthCode.equals(authCode)) {
            return false; // 코드가 없거나 일치하지 않으면 실패
        }

        // 인증 성공 시, 기존 인증 코드는 삭제
        redisTemplate.delete(key);

        // "인증된 이메일" 이라는 상태를 잠시 저장 (회원가입 완료까지 유효, 예: 10분)
        redisTemplate.opsForValue().set(VERIFIED_PREFIX + email, "true", Duration.ofMinutes(10));

        return true;
    }

    /**
     * [중요] 회원가입 로직에서 사용할 최종 인증 확인 메서드
     * @param email 확인할 이메일
     * @return 인증 완료 여부
     */
    public boolean isEmailVerified(String email) {

        return redisTemplate.hasKey(VERIFIED_PREFIX + email);
    }

    /**
     * 회원가입 완료 후, 인증 상태 정보 삭제
     * @param email 삭제할 이메일
     */
    public void deleteVerifiedEmailState(String email) {
        redisTemplate.delete(VERIFIED_PREFIX + email);
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            log.info("메일만들기 돌입!");
            MimeMessage message = javaMailSender.createMimeMessage();
            message.setRecipients(MimeMessage.RecipientType.TO, to);
            message.setSubject(subject);
            message.setText(text);
            javaMailSender.send(message);
            log.info("메일이 감!");
        } catch (MessagingException e) {
            // 실무에서는 Log.error() 등으로 로깅하는 것이 좋습니다.
            log.error("메일 발송 서비스(sendEmail)에서 MessagingException 발생", e);
            throw new RuntimeException("메일 발송에 실패했습니다.", e);
        }
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // ✅ 바로 이 부분에서 DB 조회가 일어납니다!
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("이메일 찾기 실패"+email));

        // DB에서 가져온 정보로 UserDetails를 만듭니다.
        return new CustomUserDetails(member);
    }
    @Transactional
    public void updateMemberDetails(String memberId, AdditionalInfoRequestDto requestDto) {
        // 1. 토큰에서 추출한 ID로 회원 정보를 찾습니다.
        Member member = memberRepository.findByEmail(memberId)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원을 찾을 수 없습니다. ID: " + memberId));

        // 2. DTO에 담겨온 정보로 엔티티를 업데이트합니다.
        //    (MemberEntity에 updateDetails 같은 메소드를 만들어두면 더 깔끔합니다.)
        member.setPhoneNum(requestDto.getPhoneNum());
        member.setBirthDate(requestDto.getBirthDate());

        // 3. 권한을 ROLE_TEMP -> ROLE_USER로 변경하여 정식 회원으로 전환합니다.
        member.setMemberRole(MemberRole.USER);
    }

    
}

