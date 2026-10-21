
package com.agriculture.smart_agriculture.controller;

import com.agriculture.smart_agriculture.model.SensorReading;
import com.agriculture.smart_agriculture.service.SensorReadingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farms/{farmId}/sensor-readings")
public class SensorReadingController {

    private final SensorReadingService sensorReadingService;

    public SensorReadingController(
            SensorReadingService sensorReadingService) {
        this.sensorReadingService = sensorReadingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SensorReading createReading(
            @PathVariable Long farmId,
            @Valid @RequestBody SensorReading reading) {
        return sensorReadingService.createReading(farmId, reading);
    }

    @GetMapping
    public List<SensorReading> getReadings(
            @PathVariable Long farmId) {
        return sensorReadingService.getReadingsByFarm(farmId);
    }
}
