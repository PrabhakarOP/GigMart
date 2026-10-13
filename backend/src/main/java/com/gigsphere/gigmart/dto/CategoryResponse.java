package com.gigsphere.gigmart.dto;

import java.util.UUID;

public class CategoryResponse {
    private UUID id;
    private String name;
    private String icon;
    private Boolean isActive;

    public CategoryResponse() {
    }

    public CategoryResponse(UUID id, String name, String icon, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.isActive = isActive;
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
