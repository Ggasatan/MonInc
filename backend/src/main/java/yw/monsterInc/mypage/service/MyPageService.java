package yw.monsterInc.mypage.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import yw.monsterInc.Product.entity.SaveOption;
import yw.monsterInc.Product.repository.SaveOptionRepository;
import yw.monsterInc.member.Repository.MemberRepository;
import yw.monsterInc.member.entity.Member;
import yw.monsterInc.mypage.dto.MemberUpdateRequestDto;
import yw.monsterInc.mypage.dto.SavedOptionResponseDto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional // 이 클래스의 public 메서드는 하나의 트랜잭션으로 묶인다. (매우 중요!)
public class MyPageService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder; // 비밀번호 암호화를 위해 주입
    private final SaveOptionRepository saveOptionRepository;

    // 회원 정보 수정 메서드
    public void updateMemberInfo(Long memberId, MemberUpdateRequestDto updateDto) {
        // 1. memberId로 영속성 컨텍스트에 있는 Member 엔티티를 찾아온다.
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원을 찾을 수 없습니다. id=" + memberId));

        // 2. DTO의 값으로 Member 엔티티의 필드를 변경한다. (더티 체킹 활용)
        //    @Transactional 덕분에, 이 메서드가 끝나면 JPA가 변경된 내용을 감지해서 자동으로 UPDATE 쿼리를 날려준다.
        member.setName(updateDto.getName());
        member.setPhoneNum(updateDto.getPhoneNum());
        member.setBirthDate(updateDto.getBirthDate()); // Member 엔티티의 타입에 맞게 변환 필요 시 추가

        // 3. 비밀번호 필드가 비어있지 않은 경우에만 업데이트
        if (StringUtils.hasText(updateDto.getPassword())) {
            member.setPassword(passwordEncoder.encode(updateDto.getPassword()));
        }
    }
    @Transactional(readOnly = true)
    public List<SavedOptionResponseDto> findMySavedOptions(Long memberId) {
        return saveOptionRepository.findAllByMember_Id(memberId).stream()
                .map(SavedOptionResponseDto::new)
                .collect(Collectors.toList());
    }

    // [신규] 저장된 옵션 삭제 로직
    public void deleteSavedOption(Long memberId, Long savedOptionId) {
        SaveOption savedOption = saveOptionRepository.findById(savedOptionId)
                .orElseThrow(() -> new IllegalArgumentException("해당 저장 옵션을 찾을 수 없습니다."));

        // 삭제하려는 옵션이 정말로 현재 로그인한 유저의 것인지 확인 (보안)
        if (!savedOption.getMember().getId().equals(memberId)) {
            throw new IllegalStateException("삭제 권한이 없습니다.");
        }

        saveOptionRepository.delete(savedOption);
    }
}
