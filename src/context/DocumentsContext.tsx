import React, { createContext, useContext, useState } from "react";

export type DocumentStatus =
  | "Draft"
  | "Needs Review"
  | "In Review"
  | "Approved"
  | "Archived";
export type ProjectDocument = {
  id: string;
  name: string;
  projectId: string;
  stage: string;
  category: string;
  status: DocumentStatus;
  version: number;
  uploadedBy: string;
  updatedAt: string;
  notes: string;
};

const seed: ProjectDocument[] = [
  {
    id: "doc-1",
    name: "Phase I Environmental Assessment.pdf",
    projectId: "1",
    stage: "Due Diligence",
    category: "Environmental",
    status: "Approved",
    version: 1,
    uploadedBy: "Sarah Collins",
    updatedAt: "2026-11-01",
    notes: "Initial environmental assessment",
  },
  {
    id: "doc-2",
    name: "ALTA Boundary Survey.pdf",
    projectId: "1",
    stage: "Due Diligence",
    category: "Survey",
    status: "Needs Review",
    version: 1,
    uploadedBy: "James Mitchell",
    updatedAt: "2026-11-04",
    notes: "Awaiting survey review",
  },
  {
    id: "doc-3",
    name: "Site Development Plans.pdf",
    projectId: "2",
    stage: "Entitlements",
    category: "Plans",
    status: "In Review",
    version: 3,
    uploadedBy: "Sarah Collins",
    updatedAt: "2026-11-05",
    notes: "Updated site access and parking",
  },
  {
    id: "doc-4",
    name: "Purchase Agreement.pdf",
    projectId: "3",
    stage: "Acquisition",
    category: "Legal",
    status: "Draft",
    version: 1,
    uploadedBy: "Michael Turner",
    updatedAt: "2026-11-03",
    notes: "Pending negotiation",
  },
  {
    id: "doc-5",
    name: "Construction Schedule.pdf",
    projectId: "4",
    stage: "Construction",
    category: "Construction",
    status: "Needs Review",
    version: 2,
    uploadedBy: "Emily Parker",
    updatedAt: "2026-11-06",
    notes: "Contractor schedule revisions",
  },
];

type DocumentsContextValue = {
  documents: ProjectDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<ProjectDocument[]>>;
};
const DocumentsContext = createContext<DocumentsContextValue | null>(null);
export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<ProjectDocument[]>(seed);
  return (
    <DocumentsContext.Provider value={{ documents, setDocuments }}>
      {children}
    </DocumentsContext.Provider>
  );
}
export function useDocuments() {
  const value = useContext(DocumentsContext);
  if (!value)
    throw new Error("useDocuments must be used inside DocumentsProvider");
  return value;
}
