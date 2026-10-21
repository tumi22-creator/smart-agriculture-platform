package com.agriculture.smart_agriculture.controller;

import com.agriculture.smart_agriculture.model.Farm;
import com.agriculture.smart_agriculture.service.FarmService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farms")
public class FarmController {

    private final FarmService farmService;

    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    @GetMapping
    public List<Farm> getAllFarms() {
        return farmService.getAllFarms();
    }

    @GetMapping("/{id}")
    public Farm getFarmById(@PathVariable Long id) {
        return farmService.getFarmById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Farm createFarm(@Valid @RequestBody Farm farm) {
        return farmService.createFarm(farm);
    }

    @PutMapping("/{id}")
    public Farm updateFarm(
            @PathVariable Long id,
            @Valid @RequestBody Farm farm) {
        return farmService.updateFarm(id, farm);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFarm(@PathVariable Long id) {
        farmService.deleteFarm(id);
    }
}