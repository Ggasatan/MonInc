package yw.monsterInc.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import yw.monsterInc.member.entity.Member;
import yw.monsterInc.order.entity.Order;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByOrderMemberOrderByRegTimeDesc(Member member);
    /**
     * [수정] 페치 조인을 사용하여 N+1 문제 해결
     * o.orderOption (SaveOption) 과 so.mon (Product) 데이터를 한번의 쿼리로 모두 가져온다.
     */
    @Query("SELECT o FROM Order o " +
            "JOIN FETCH o.orderOption so " +
            "JOIN FETCH so.mon " +
            "WHERE o.orderMember = :member " +
            "ORDER BY o.regTime DESC")
    List<Order> findByOrderMemberWithDetails(@Param("member") Member member);
}
