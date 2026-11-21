export type EmployeeStatus = "install" | "repair" | "upgrade" | "remote" | "free";
export interface Employee {
  id: string; name: string; role: string; status: EmployeeStatus;
  x: number; y: number; task: string; phone: string;
}
export type ToolStatus = "in-shipment" | "under-warranty" | "out-of-service";

export interface SiteTool {
  id: string;
  name: string;
  task: string;
  status: ToolStatus;
}

export type StoredEmployee = Omit<Employee, "status"> & {
  status: EmployeeStatus | "call-support";
};

export type ToolTasks = Record<string, string>;
export type CompletedToolTasks = Record<string, string[]>;
export type ToolStatuses = Record<string, ToolStatus>;
export type DirectoryTasks = Record<string, Record<string, string[]>>;

export type TicketStatus = "open" | "assigned" | "in-progress" | "resolved";

export interface Ticket {
  id: string;
  title: string;
  toolNumber: string;
  location: string;
  assignee: string;
  status: TicketStatus;
  priority: "Low" | "Medium" | "High";
  created: string;
}

export type PartStatus = "ordered" | "shipped" | "received";

export interface PartOrder {
  id: string;
  name: string;
  partNumber: string;
  quantity: string;
  supplier: string;
  toolNumber: string;
  status: PartStatus;
  expected: string;
}

export interface ToolGroup {
  className: string;
  location: string;
  tools: SiteTool[];
}

export type SelectedSiteTool = SiteTool & { location: string };