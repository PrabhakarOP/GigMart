package com.gigsphere.gigmart.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gigsphere.gigmart.enums.GigStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class GigUpdateRequest {
    private String title;
    private String description;
    private BigDecimal budget;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime scheduledAt;

    private GigStatus status;

    public GigUpdateRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public GigStatus getStatus() {
        return status;
    }

    public void setStatus(GigStatus status) {
        this.status = status;
    }
}
