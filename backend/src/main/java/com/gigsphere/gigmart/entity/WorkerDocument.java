package com.gigsphere.gigmart.entity;

import com.gigsphere.gigmart.enums.DocumentStatus;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "worker_documents")
public class WorkerDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private WorkerProfile workerProfile;

    @Column(name = "doc_type", nullable = false)
    private String docType;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DocumentStatus status = DocumentStatus.PENDING;

    public WorkerDocument() {
    }

    public WorkerDocument(WorkerProfile workerProfile, String docType, String fileUrl, DocumentStatus status) {
        this.workerProfile = workerProfile;
        this.docType = docType;
        this.fileUrl = fileUrl;
        this.status = status != null ? status : DocumentStatus.PENDING;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public WorkerProfile getWorkerProfile() {
        return workerProfile;
    }

    public void setWorkerProfile(WorkerProfile workerProfile) {
        this.workerProfile = workerProfile;
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
