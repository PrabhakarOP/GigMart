package com.gigsphere.gigmart.dto;

import java.util.UUID;

public class AddressResponse {
    private UUID id;
    private UUID userId;
    private String line1;
    private String city;
    private String pincode;
    private Float latitude;
    private Float longitude;

    public AddressResponse() {
    }

    public AddressResponse(UUID id, UUID userId, String line1, String city, String pincode, Float latitude, Float longitude) {
        this.id = id;
        this.userId = userId;
        this.line1 = line1;
        this.city = city;
        this.pincode = pincode;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getLine1() {
        return line1;
    }

    public void setLine1(String line1) {
        this.line1 = line1;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public Float getLatitude() {
        return latitude;
    }

    public void setLatitude(Float latitude) {
        this.latitude = latitude;
    }

    public Float getLongitude() {
        return longitude;
    }

    public void setLongitude(Float longitude) {
        this.longitude = longitude;
    }
}
