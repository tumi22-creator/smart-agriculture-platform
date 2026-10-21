
package com.agriculture.smart_agriculture.repository;

import com.agriculture.smart_agriculture.model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CropRepository extends JpaRepository<Crop, Long> {

    List<Crop> findByFarmId(Long farmId);
}
