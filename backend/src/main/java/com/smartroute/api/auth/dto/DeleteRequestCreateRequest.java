package com.smartroute.api.auth.dto;

import jakarta.validation.constraints.NotNull;

public class DeleteRequestCreateRequest {
    @NotNull
    private Long historyId;

    public Long getHistoryId() {
        return historyId;
    }

    public void setHistoryId(Long historyId) {
        this.historyId = historyId;
    }
}
