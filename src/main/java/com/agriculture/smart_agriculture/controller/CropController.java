
package com.agriculture.smart_agriculture.controller;

import com.agriculture.smart_agriculture.model.Crop;
import com.agriculture.smart_agriculture.service.CropService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crops")
public class CropController {

    private final CropService cropService;

    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    @GetMapping
    public List<Crop> getAllCrops() {
        return cropService.getAllCrops();
    }

    @GetMapping("/{id}")
    public Crop getCropById(@PathVariable Long id) {
        return cropService.getCropById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Crop createCrop(@Valid @RequestBody Crop crop) {
        return cropService.createCrop(crop);
    }

    @PutMapping("/{id}")
    public Crop updateCrop(@PathVariable Long id,
                           @Valid @RequestBody Crop crop) {
        return cropService.updateCrop(id, crop);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCrop(@PathVariable Long id) {
        cropService.deleteCrop(id);
    }

    @PutMapping("/{cropId}/farm/{farmId}")
public Crop assignCropToFarm(
        @PathVariable Long cropId,
        @PathVariable Long farmId) {
    return cropService.assignCropToFarm(cropId, farmId);
}

@GetMapping("/farm/{farmId}")
public List<Crop> getCropsByFarm(@PathVariable Long farmId) {
    return cropService.getCropsByFarm(farmId);
}
}
