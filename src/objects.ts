import type {
  Employee,
  EmployeeStatus,
  PartOrder,
  PartStatus,
  Ticket,
  TicketStatus,
  ToolGroup,
  ToolStatus
} from "./types";

export const STATUS_META: Record<EmployeeStatus, {label:string;color:string;soft:string}> = {
  install:{label:"Install",color:"#3b82f6",soft:"#eaf2ff"},
  repair:{label:"Repair",color:"#f59e0b",soft:"#fff5df"},
  upgrade:{label:"Upgrade",color:"#8b5cf6",soft:"#f2edff"},
  remote:{label:"Remote",color:"#ef4444",soft:"#feecec"},
  free:{label:"Free",color:"#10a779",soft:"#e5f7f0"}
};

export const STATUSES: EmployeeStatus[] = ["install", "repair", "upgrade", "remote", "free"];

export const DEFAULT_EMPLOYEES: Employee[] = [
  {id:"e-1",name:"John Smith",role:"Field technician",status:"install",x:22,y:29,task:"Unit A · First fix",phone:"+1 555 0101"},
  {id:"e-2",name:"David Cohen",role:"Electrician",status:"repair",x:46,y:23,task:"Panel room · Fault 04",phone:"+1 555 0102"},
  {id:"e-3",name:"Michael Levy",role:"Site technician",status:"free",x:72,y:33,task:"Available for assignment",phone:"+1 555 0103"},
  {id:"e-4",name:"Alex Brown",role:"Network installer",status:"upgrade",x:34,y:67,task:"Level 2 · Network",phone:"+1 555 0104"},
  {id:"e-5",name:"Daniel Green",role:"Field technician",status:"install",x:78,y:72,task:"Unit C · Equipment",phone:"+1 555 0105"},
  {id:"e-6",name:"James Wilson",role:"Maintenance",status:"free",x:57,y:51,task:"Available for assignment",phone:"+1 555 0106"}
];

export const TOOL_DIRECTORIES = ["Logistics Integrity", "Shipment Brackets", "Mechanical", "PC & Electronics", "Leveling Aligment", "Hookups & Facilites"];

export const LOGISTICS_INTEGRITY_TASKS = [
  "Tilt & G-hock sensors: inspect indicators, record values and take verification images",
  "Granite Base Assembly: release and position stage supporting legs (x4)"
];

export const SHIPMENT_BRACKETS_TASKS = [
  "Stage XY Mechanism: remove brackets from main XY stage",
  "East Axis (XYZ): remove travel brackets from east axis",
  "West Axis (XYZ): remove travel brackets from west axis"
];

export const TOOL_STATUSES: ToolStatus[] = ["in-shipment", "under-warranty", "out-of-service"];

export const TOOL_STATUS_META: Record<ToolStatus, {label:string;color:string}> = {
  "in-shipment":{label:"In shipment",color:"#3b82f6"},
  "under-warranty":{label:"Under warranty",color:"#10a779"},
  "out-of-service":{label:"Out of service",color:"#ef4444"}
};

export const TICKET_STATUSES: TicketStatus[] = ["open","assigned","in-progress","resolved"];

export const TICKET_STATUS_META: Record<TicketStatus,{label:string;color:string;soft:string}> = {
  open:{label:"Open",color:"#ef4444",soft:"#feecec"},
  assigned:{label:"Assigned",color:"#3b82f6",soft:"#eaf2ff"},
  "in-progress":{label:"In progress",color:"#f59e0b",soft:"#fff5df"},
  resolved:{label:"Closed",color:"#10a779",soft:"#e5f7f0"}
};

export const DEFAULT_TICKETS: Ticket[] = [
  {id:"TK-1001",title:"Faulty panel connection",toolNumber:"01",location:"Room 1 · Panel A",assignee:"John Smith",status:"in-progress",priority:"High",created:"Today, 09:20"},
  {id:"TK-1002",title:"Network equipment upgrade",toolNumber:"02",location:"Room 2 · Level 2",assignee:"Alex Brown",status:"assigned",priority:"Medium",created:"Today, 08:45"},
  {id:"TK-1003",title:"Replace damaged cable",toolNumber:"03",location:"Eng Room · Bay 4",assignee:"David Cohen",status:"open",priority:"High",created:"Yesterday, 16:10"},
  {id:"TK-1004",title:"Routine maintenance check",toolNumber:"04",location:"Gowning Room",assignee:"Michael Levy",status:"resolved",priority:"Low",created:"Yesterday, 13:30"},
  {id:"TK-1005",title:"Equipment installation",toolNumber:"05",location:"Storage Area",assignee:"Daniel Green",status:"assigned",priority:"Medium",created:"Nov 20, 11:15"}
];

export const PART_STATUSES: PartStatus[] = ["ordered","shipped","received"];

export const PART_STATUS_META: Record<PartStatus,{label:string;color:string;soft:string}> = {
  ordered:{label:"Ordered",color:"#f59e0b",soft:"#fff5df"},
  shipped:{label:"Shipped",color:"#3b82f6",soft:"#eaf2ff"},
  received:{label:"Received",color:"#10a779",soft:"#e5f7f0"}
};

export const DEFAULT_PARTS: PartOrder[] = [
  {id:"PR-2001",name:"Control panel fuse",partNumber:"PF-4401",quantity:"12",supplier:"TechSupply Co.",toolNumber:"01",status:"shipped",expected:"Nov 23"},
  {id:"PR-2002",name:"Network switch module",partNumber:"NS-820",quantity:"3",supplier:"Network Depot",toolNumber:"02",status:"ordered",expected:"Nov 26"},
  {id:"PR-2003",name:"Rubber drive belt",partNumber:"RB-318",quantity:"2",supplier:"Motion Parts",toolNumber:"04",status:"received",expected:"Nov 20"}
];

export const TOOL_GROUPS: ToolGroup[] = [
  { className: "tool-buildings", location: "west area", tools: [{ id: "site-a-01", name: "Tool 01", task: "Logistics Integrity", status: "under-warranty" }, { id: "site-a-02", name: "Tool 02", task: "Shipment Brackets", status: "in-shipment" }, { id: "site-a-03", name: "Tool 03", task: "Mechanical", status: "under-warranty" }] },
  { className: "tool-buildings tool-buildings-right tool-buildings-room-two", location: "east area", tools: [{ id: "site-b-01", name: "Tool 01", task: "PC & Electronics", status: "under-warranty" }, { id: "site-b-02", name: "Tool 02", task: "Hookups & Facilites", status: "out-of-service" }, { id: "site-b-03", name: "Tool 03", task: "Logistics Integrity", status: "under-warranty" }] },
  { className: "tool-buildings tool-buildings-room-two-bottom", location: "south area", tools: [{ id: "site-c-04", name: "Tool 04", task: "Shipment Brackets", status: "in-shipment" }, { id: "site-c-05", name: "Tool 05", task: "Mechanical", status: "under-warranty" }] },
  { className: "tool-buildings tool-buildings-storage", location: "storage area", tools: [{ id: "storage-01", name: "Tool 01", task: "PC & Electronics", status: "under-warranty" }, { id: "storage-02", name: "Tool 02", task: "Hookups & Facilites", status: "out-of-service" }, { id: "storage-03", name: "Tool 03", task: "Logistics Integrity", status: "under-warranty" }] }
];