package com.smartroute.api.auth.dto;

public class RouteHistoryRequest {
    private String destination;
    private String sourceLabel;

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getSourceLabel() {
        return sourceLabel;
    }

    public void setSourceLabel(String sourceLabel) {
        this.sourceLabel = sourceLabel;
    }
}
