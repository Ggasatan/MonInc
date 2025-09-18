package yw.monsterInc.Product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import yw.monsterInc.Product.entity.SaveOption;
import yw.monsterInc.member.entity.Member;

import java.util.List;

public interface SaveOptionRepository extends JpaRepository<SaveOption,Long> {
    List<SaveOption> findByMember(Member member);
    List<SaveOption> findAllByMember_Id(Long memberId);
}
