
package com.agriculture.smart_agriculture.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "farms")
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Farm name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Location is required")
    @Column(nullable = false)
    private String location;

    @Positive(message = "Farm size must be greater than zero")
    private double sizeInHectares;

    private String soilType;

    public Farm() {
    }

    public Farm(String name, String location,
                double sizeInHectares, String soilType) {
        this.name = name;
        this.location = location;
        this.sizeInHectares = sizeInHectares;
        this.soilType = soilType;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public double getSizeInHectares() {
        return sizeInHectares;
    }

    public void setSizeInHectares(double sizeInHectares) {
        this.sizeInHectares = sizeInHectares;
    }

    public String getSoilType() {
        return soilType;
    }

    public void setSoilType(String soilType) {
        this.soilType = soilType;
    }
}
