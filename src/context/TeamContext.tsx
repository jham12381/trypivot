import React, { createContext, useContext, useState } from "react";

export type TeamAccess =
  | "Administrator"
  | "Project Manager"
  | "Contributor"
  | "Reviewer / Approver"
  | "Viewer";
export type TeamMember = {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  access: TeamAccess;
  stages: string[];
  projectIds: string[];
  responsibilities: string;
  active: boolean;
};

// Sample directory records. Contact fields are intentionally blank, not fabricated.
const seed: TeamMember[] = [
  {
    id: "jm",
    name: "Johnny Ham",
    title: "Development Director",
    department: "Development",
    email: "",
    phone: "",
    access: "Administrator",
    stages: ["Acquisition", "Due Diligence"],
    projectIds: ["1", "2"],
    responsibilities:
      "Acquisitions, purchase agreements, feasibility and due diligence coordination.",
    active: true,
  },
  {
    id: "sc",
    name: "Jordan Nolen",
    title: "Entitlements Manager",
    department: "Planning & Entitlements",
    email: "",
    phone: "",
    access: "Reviewer / Approver",
    stages: ["Entitlements", "Permitting"],
    projectIds: ["1", "2"],
    responsibilities:
      "Zoning, municipal approvals, entitlement conditions and permit coordination.",
    active: true,
  },
  {
    id: "mt",
    name: "Kyle Grey",
    title: "Project Manager",
    department: "Project Management",
    email: "",
    phone: "",
    access: "Project Manager",
    stages: ["Design & Planning", "Construction"],
    projectIds: ["1", "3"],
    responsibilities:
      "Architectural and engineering coordination, schedules and consultant deliverables.",
    active: true,
  },
  {
    id: "ep",
    name: "Alison Owens",
    title: "Construction Manager",
    department: "Construction",
    email: "",
    phone: "",
    access: "Contributor",
    stages: ["Construction", "Closeout"],
    projectIds: ["4"],
    responsibilities:
      "Contractor coordination, inspections, construction progress and closeout.",
    active: true,
  },
];
type TeamContextValue = {
  members: TeamMember[];
  setMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
};
const TeamContext = createContext<TeamContextValue | null>(null);
export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<TeamMember[]>(seed);
  return (
    <TeamContext.Provider value={{ members, setMembers }}>
      {children}
    </TeamContext.Provider>
  );
}
export function useTeam() {
  const value = useContext(TeamContext);
  if (!value) throw new Error("useTeam must be used inside TeamProvider");
  return value;
}
