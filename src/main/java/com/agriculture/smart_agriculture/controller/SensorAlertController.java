
package com.agriculture.smart_agriculture.controller;

import com.agriculture.smart_agriculture.model.SensorAlert;
import com.agriculture.smart_agriculture.service.SensorAlertService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farms/{farmId}/alerts")
public class SensorAlertController {

    private final SensorAlertService alertService;

    public SensorAlertController(SensorAlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public List<SensorAlert> getAlerts(@PathVariable Long farmId) {
        return alertService.getAlerts(farmId);
    }

    @GetMapping("/active")
    public List<SensorAlert> getActiveAlerts(@PathVariable Long farmId) {
        return alertService.getActiveAlerts(farmId);
    }

    @PutMapping("/{alertId}/resolve")
    public SensorAlert resolveAlert(@PathVariable Long farmId,
                                    @PathVariable Long alertId) {
        return alertService.resolveAlert(alertId);
    }
}
