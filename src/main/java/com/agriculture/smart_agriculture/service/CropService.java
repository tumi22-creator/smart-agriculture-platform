
package com.agriculture.smart_agriculture.service;

import com.agriculture.smart_agriculture.model.Crop;
import com.agriculture.smart_agriculture.repository.CropRepository;
import org.springframework.stereotype.Service;
import com.agriculture.smart_agriculture.model.Farm;
import java.util.List;
import com.agriculture.smart_agriculture.repository.FarmRepository;

@Service
public class CropService {

    private final FarmRepository farmRepository;
    private final CropRepository cropRepository;

    public CropService(FarmRepository farmRepository, CropRepository cropRepository) {
        this.farmRepository = farmRepository;
        this.cropRepository = cropRepository;
    }

    public List<Crop> getAllCrops() {
        return cropRepository.findAll();
    }

    public Crop getCropById(Long id) {
        return cropRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Crop not found: " + id));
    }

    public Crop createCrop(Crop crop) {
        crop.setStatus(
                crop.getStatus() == null || crop.getStatus().isBlank()
                        ? "PLANTED" : crop.getStatus()
        );
        return cropRepository.save(crop);
    }

    public Crop updateCrop(Long id, Crop updatedCrop) {
        Crop crop = getCropById(id);

        crop.setName(updatedCrop.getName());
        crop.setVariety(updatedCrop.getVariety());
        crop.setPlantingDate(updatedCrop.getPlantingDate());
        crop.setExpectedHarvestDate(updatedCrop.getExpectedHarvestDate());
        crop.setStatus(updatedCrop.getStatus());

        return cropRepository.save(crop);
    }

    public void deleteCrop(Long id) {
        Crop crop = getCropById(id);
        cropRepository.delete(crop);
    }

    public Crop assignCropToFarm(Long cropId, Long farmId) {
    Crop crop = getCropById(cropId);

    Farm farm = farmRepository.findById(farmId)
            .orElseThrow(() ->
                    new RuntimeException("Farm not found: " + farmId));

    crop.setFarm(farm);
    return cropRepository.save(crop);
}

public List<Crop> getCropsByFarm(Long farmId) {
    if (!farmRepository.existsById(farmId)) {
        throw new RuntimeException("Farm not found: " + farmId);
    }

    return cropRepository.findByFarmId(farmId);
}
}
