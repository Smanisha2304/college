package com.smartroute.api.auth.dto;

import com.fasterxml.jackson.databind.JsonNode;

public class RouteHistoryRequest {
    private String source;
    private String destination;
    private String sourceLabel;
    private JsonNode routeData;

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

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

    public JsonNode getRouteData() {
        return routeData;
    }

    public void setRouteData(JsonNode routeData) {
        this.routeData = routeData;
    }
}
