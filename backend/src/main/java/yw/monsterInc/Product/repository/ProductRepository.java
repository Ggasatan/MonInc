package yw.monsterInc.Product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import yw.monsterInc.Product.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
