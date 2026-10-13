package com.gigsphere.gigmart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class WorkerDocumentRequest {

    @NotNull(message = "Worker profile ID is required")
    private UUID workerProfileId;

    @NotBlank(message = "Document type is required (e.g. ID, CERTIFICATE)")
    private String docType;

    @NotBlank(message = "File URL is required")
    private String fileUrl;

    public WorkerDocumentRequest() {
    }

    public UUID getWorkerProfileId() {
        return workerProfileId;
    }

    public void setWorkerProfileId(UUID workerProfileId) {
        this.workerProfileId = workerProfileId;
    }

    public String getDocType() {
        return docType;
    }

    public void setDocType(String docType) {
        this.docType = docType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
}
