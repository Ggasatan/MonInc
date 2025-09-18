package yw.monsterInc.member.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import yw.monsterInc.member.constant.MemberRole;
import yw.monsterInc.member.entity.Member;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    List<Member> findByMemberRole(MemberRole role);
    Optional<Member> findBySocialId(String socialId);
    // ADMIN 역할을 가진 모든 멤버의 이메일 목록을 조회하는 메서드
    @Query("SELECT m.email FROM Member m WHERE m.memberRole = :role")
    List<String> findEmailsByMemberRole(@Param("role") MemberRole role);
}
