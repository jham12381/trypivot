import React, { createContext, useContext, useState } from "react";

export type Status = "In Progress" | "Needs Review" | "Blocked" | "Completed";
export type TaskStatus = "To Do" | "In Progress" | "Done";
export type Task = {
  id: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  stage: string;
  dueDate?: string;
  priority?: "Low" | "Medium" | "High";
  description?: string;
};
export type Event = { id: string; message: string; date: string };
export type Project = {
  id: string;
  name: string;
  code: string;
  type: string;
  location: string;
  manager: string;
  stageIndex: number;
  status: Status;
  description: string;
  tasks: Task[];
  events: Event[];
};
export const stages = [
  "Acquisition",
  "Due Diligence",
  "Entitlements",
  "Design & Planning",
  "Permitting",
  "Construction",
  "Closeout",
];

const seed: Project[] = [
  {
    id: "1",
    name: "North Ridge Apartments",
    code: "DEV-2026-014",
    type: "Multifamily",
    location: "Kansas City, MO",
    manager: "Johnny Ham",
    stageIndex: 1,
    status: "In Progress",
    description: "Multifamily residential development.",
    tasks: [
      {
        id: "n1",
        title: "Environmental site assessment",
        assignee: "Jordan Nolen",
        status: "Done",
        stage: "Due Diligence",
      },
      {
        id: "n2",
        title: "Review title commitment",
        assignee: "Johnny Ham",
        status: "In Progress",
        stage: "Due Diligence",
      },
      {
        id: "n3",
        title: "Finalize feasibility report",
        assignee: "Kyle Grey",
        status: "To Do",
        stage: "Due Diligence",
      },
    ],
    events: [
      {
        id: "e1",
        message: "Project entered Due Diligence",
        date: "Demo history",
      },
    ],
  },
  {
    id: "2",
    name: "Westfield Commercial",
    code: "DEV-2026-009",
    type: "Commercial",
    location: "Columbus, OH",
    manager: "Jordan Nolen",
    stageIndex: 2,
    status: "Needs Review",
    description: "Commercial development project.",
    tasks: [
      {
        id: "w1",
        title: "Submit zoning application",
        assignee: "Jordan Nolen",
        status: "Done",
        stage: "Entitlements",
      },
      {
        id: "w2",
        title: "Confirm municipal conditions",
        assignee: "Johnny Ham",
        status: "Done",
        stage: "Entitlements",
      },
    ],
    events: [
      { id: "e2", message: "Stage submitted for review", date: "Demo history" },
    ],
  },
  {
    id: "3",
    name: "Oak Creek Residences",
    code: "DEV-2026-021",
    type: "Residential",
    location: "Indianapolis, IN",
    manager: "Kyle Grey",
    stageIndex: 0,
    status: "In Progress",
    description: "Residential development project.",
    tasks: [
      {
        id: "o1",
        title: "Negotiate purchase agreement",
        assignee: "Kyle Grey",
        status: "In Progress",
        stage: "Acquisition",
      },
    ],
    events: [],
  },
  {
    id: "4",
    name: "Central Plaza",
    code: "DEV-2026-005",
    type: "Mixed-Use",
    location: "Nashville, TN",
    manager: "Alison Owens",
    stageIndex: 5,
    status: "Blocked",
    description: "Mixed-use commercial and residential development.",
    tasks: [
      {
        id: "c1",
        title: "Resolve contractor schedule",
        assignee: "Alison Owens",
        status: "To Do",
        stage: "Construction",
      },
    ],
    events: [
      {
        id: "e4",
        message: "Construction flagged as blocked",
        date: "Demo history",
      },
    ],
  },
];
type ProjectContextValue = {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
};
const ProjectContext = createContext<ProjectContextValue | null>(null);
export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(seed);
  return (
    <ProjectContext.Provider value={{ projects, setProjects }}>
      {children}
    </ProjectContext.Provider>
  );
}
export function useProjects() {
  const value = useContext(ProjectContext);
  if (!value)
    throw new Error("useProjects must be used inside ProjectsProvider");
  return value;
}
