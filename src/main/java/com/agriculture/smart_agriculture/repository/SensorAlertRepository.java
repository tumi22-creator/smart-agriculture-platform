
package com.agriculture.smart_agriculture.repository;

import com.agriculture.smart_agriculture.model.SensorAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SensorAlertRepository
        extends JpaRepository<SensorAlert, Long> {

    List<SensorAlert> findByFarmIdOrderByCreatedAtDesc(Long farmId);

    List<SensorAlert> findByFarmIdAndResolvedFalseOrderByCreatedAtDesc(
            Long farmId);
}
