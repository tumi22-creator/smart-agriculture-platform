package com.agriculture.smart_agriculture.service;

import com.agriculture.smart_agriculture.model.Farm;
import com.agriculture.smart_agriculture.model.SensorReading;
import com.agriculture.smart_agriculture.repository.FarmRepository;
import com.agriculture.smart_agriculture.repository.SensorReadingRepository;
import org.springframework.stereotype.Service;
import com.agriculture.smart_agriculture.model.SensorAlert;
import java.util.List;

@Service
public class SensorReadingService {

    private final FarmRepository farmRepository;
    private final SensorReadingRepository sensorReadingRepository;
    private final SensorAlertService sensorAlertService;
    public SensorReadingService(
        FarmRepository farmRepository,
        SensorReadingRepository sensorReadingRepository,
        SensorAlertService sensorAlertService) {
    this.farmRepository = farmRepository;
    this.sensorReadingRepository = sensorReadingRepository;
    this.sensorAlertService = sensorAlertService;
}

    public SensorReading createReading(Long farmId, SensorReading reading) {
    Farm farm = farmRepository.findById(farmId)
            .orElseThrow(() ->
                    new RuntimeException("Farm not found: " + farmId));

    reading.setFarm(farm);
    SensorReading savedReading = sensorReadingRepository.save(reading);

    if (reading.getSoilMoisture() < 30) {
        sensorAlertService.createAlert(
                farmId, "Soil moisture is critically low: "
                        + reading.getSoilMoisture() + "%", "HIGH");
    }

    if (reading.getTemperature() > 35) {
        sensorAlertService.createAlert(
                farmId, "High temperature detected: "
                        + reading.getTemperature() + "°C", "HIGH");
    }

    if (reading.getHumidity() < 25) {
        sensorAlertService.createAlert(
                farmId, "Humidity is critically low: "
                        + reading.getHumidity() + "%", "MEDIUM");
    }

    return savedReading;
}

    public List<SensorReading> getReadingsByFarm(Long farmId) {
        if (!farmRepository.existsById(farmId)) {
            throw new RuntimeException("Farm not found: " + farmId);
        }

        return sensorReadingRepository.findByFarmIdWithFarm(farmId);
    }
}