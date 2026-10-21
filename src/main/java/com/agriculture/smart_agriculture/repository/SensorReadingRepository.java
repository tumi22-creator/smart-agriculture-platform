
package com.agriculture.smart_agriculture.repository;

import com.agriculture.smart_agriculture.model.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SensorReadingRepository
        extends JpaRepository<SensorReading, Long> {

    @Query("""
        SELECT sr FROM SensorReading sr
        JOIN FETCH sr.farm
        WHERE sr.farm.id = :farmId
        ORDER BY sr.recordedAt DESC
        """)
    List<SensorReading> findByFarmIdWithFarm(
            @Param("farmId") Long farmId);
}
