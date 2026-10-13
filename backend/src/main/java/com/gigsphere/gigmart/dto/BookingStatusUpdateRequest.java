package com.gigsphere.gigmart.dto;

import com.gigsphere.gigmart.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;

public class BookingStatusUpdateRequest {

    @NotNull(message = "Status is required (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)")
    private BookingStatus status;

    public BookingStatusUpdateRequest() {
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
}
