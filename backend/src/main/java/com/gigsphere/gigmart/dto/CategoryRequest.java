package com.gigsphere.gigmart.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private String icon;

    private Boolean isActive = true;

    public CategoryRequest() {
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
