
package com.agriculture.smart_agriculture.repository;

import com.agriculture.smart_agriculture.model.Farm;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmRepository extends JpaRepository<Farm, Long> {
}
