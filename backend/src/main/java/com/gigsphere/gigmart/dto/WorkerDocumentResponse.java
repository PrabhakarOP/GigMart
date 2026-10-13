package com.gigsphere.gigmart.dto;

import com.gigsphere.gigmart.enums.DocumentStatus;
import java.util.UUID;

public class WorkerDocumentResponse {
    private UUID id;
    private UUID workerProfileId;
    private String docType;
    private String fileUrl;
    private DocumentStatus status;

    public WorkerDocumentResponse() {
    }

    public WorkerDocumentResponse(UUID id, UUID workerProfileId, String docType, String fileUrl, DocumentStatus status) {
        this.id = id;
        this.workerProfileId = workerProfileId;
        this.docType = docType;
        this.fileUrl = fileUrl;
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public DocumentStatus getStatus() {
        return status;
    }

    public void setStatus(DocumentStatus status) {
        this.status = status;
    }
}
