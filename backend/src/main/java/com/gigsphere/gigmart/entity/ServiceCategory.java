package com.gigsphere.gigmart.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "service_categories", indexes = {
        @Index(name = "idx_category_name", columnList = "name", unique = true)
})
public class ServiceCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "icon")
    private String icon;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public ServiceCategory() {
    }

    public ServiceCategory(String name, String icon, Boolean isActive) {
        this.name = name;
        this.icon = icon;
        this.isActive = isActive != null ? isActive : true;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }
}
