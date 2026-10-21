
package com.agriculture.smart_agriculture.service;

import com.agriculture.smart_agriculture.model.Farm;
import com.agriculture.smart_agriculture.model.SensorAlert;
import com.agriculture.smart_agriculture.repository.FarmRepository;
import com.agriculture.smart_agriculture.repository.SensorAlertRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SensorAlertService {

    private final FarmRepository farmRepository;
    private final SensorAlertRepository alertRepository;

    public SensorAlertService(
            FarmRepository farmRepository,
            SensorAlertRepository alertRepository) {
        this.farmRepository = farmRepository;
        this.alertRepository = alertRepository;
    }

    public SensorAlert createAlert(
            Long farmId, String message, String severity) {

        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() ->
                        new RuntimeException("Farm not found: " + farmId));

        SensorAlert alert = new SensorAlert();
        alert.setFarm(farm);
        alert.setMessage(message);
        alert.setSeverity(severity);
        alert.setResolved(false);

        return alertRepository.save(alert);
    }

    public List<SensorAlert> getAlerts(Long farmId) {
        if (!farmRepository.existsById(farmId)) {
            throw new RuntimeException("Farm not found: " + farmId);
        }

        return alertRepository.findByFarmIdOrderByCreatedAtDesc(farmId);
    }

    public List<SensorAlert> getActiveAlerts(Long farmId) {
        if (!farmRepository.existsById(farmId)) {
            throw new RuntimeException("Farm not found: " + farmId);
        }

        return alertRepository
                .findByFarmIdAndResolvedFalseOrderByCreatedAtDesc(farmId);
    }

    public SensorAlert resolveAlert(Long alertId) {
        SensorAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() ->
                        new RuntimeException("Alert not found: " + alertId));

        alert.setResolved(true);
        return alertRepository.save(alert);
    }
}
