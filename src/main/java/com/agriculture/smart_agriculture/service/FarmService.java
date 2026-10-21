package com.agriculture.smart_agriculture.service;

import com.agriculture.smart_agriculture.model.Farm;
import com.agriculture.smart_agriculture.repository.FarmRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FarmService {

    private final FarmRepository farmRepository;

    public FarmService(FarmRepository farmRepository) {
        this.farmRepository = farmRepository;
    }

    public List<Farm> getAllFarms() {
        return farmRepository.findAll();
    }

    public Farm getFarmById(Long id) {
        return farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm not found: " + id));
    }

    public Farm createFarm(Farm farm) {
        return farmRepository.save(farm);
    }

    public Farm updateFarm(Long id, Farm updatedFarm) {
        Farm farm = getFarmById(id);

        farm.setName(updatedFarm.getName());
        farm.setLocation(updatedFarm.getLocation());
        farm.setSizeInHectares(updatedFarm.getSizeInHectares());
        farm.setSoilType(updatedFarm.getSoilType());

        return farmRepository.save(farm);
    }

    public void deleteFarm(Long id) {
        farmRepository.delete(getFarmById(id));
    }
}