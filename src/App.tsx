import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, PointerEvent, CSSProperties } from "react";
import { Activity, ArrowDownUp, Check, CircleHelp, ClipboardList, HardHat, LayoutDashboard, MapPin, MoreHorizontal, Plus, Search, Settings2, ShieldCheck, SlidersHorizontal, Trash2, Users, X } from "lucide-react";
import { DEFAULT_EMPLOYEES, STATUS_META } from "./types";
import type {
  CompletedToolTasks,
  DirectoryTasks,
  Employee,
  EmployeeStatus,
  Ticket,
  TicketStatus,
  SiteTool,
  StoredEmployee,
  SelectedSiteTool,
  ToolStatuses,
  ToolGroup,
  ToolTasks,
  ToolStatus
} from "./types";

const KEY = "fieldboard-employees-v1";
const TOOL_TASKS_KEY = "fieldboard-tool-tasks-v1";
const COMPLETED_TOOL_TASKS_KEY = "fieldboard-completed-tool-tasks-v1";
const TOOL_STATUSES_KEY = "fieldboard-tool-statuses-v1";
const TOOL_DIRECTORY_TASKS_KEY = "fieldboard-tool-directory-tasks-v1";
const STATUSES: EmployeeStatus[] = ["install", "repair", "upgrade", "remote", "free"];
const TOOL_DIRECTORIES = ["Logistics Integrity", "Shipment Brackets", "Mechanical", "PC & Electronics", "Leveling Aligment", "Hookups & Facilites"];
const LOGISTICS_INTEGRITY_TASKS = [
  "Tilt & G-hock sensors: inspect indicators, record values and take verification images",
  "Granite Base Assembly: release and position stage supporting legs (x4)"
];
const SHIPMENT_BRACKETS_TASKS = [
  "Stage XY Mechanism: remove brackets from main XY stage",
  "East Axis (XYZ): remove travel brackets from east axis",
  "West Axis (XYZ): remove travel brackets from west axis"
];
const TOOL_STATUSES: ToolStatus[] = ["in-shipment", "under-warranty", "out-of-service"];
const TOOL_STATUS_META: Record<ToolStatus, {label:string;color:string}> = {
  "in-shipment":{label:"In shipment",color:"#3b82f6"},
  "under-warranty":{label:"Under warranty",color:"#10a779"},
  "out-of-service":{label:"Out of service",color:"#ef4444"}
};
const TICKET_STATUSES: TicketStatus[] = ["open","assigned","in-progress","resolved"];
const TICKET_STATUS_META: Record<TicketStatus,{label:string;color:string;soft:string}> = {
  open:{label:"Open",color:"#ef4444",soft:"#feecec"},
  assigned:{label:"Assigned",color:"#3b82f6",soft:"#eaf2ff"},
  "in-progress":{label:"In progress",color:"#f59e0b",soft:"#fff5df"},
  resolved:{label:"Closed",color:"#10a779",soft:"#e5f7f0"}
};
const DEFAULT_TICKETS: Ticket[] = [
  {id:"TK-1001",title:"Faulty panel connection",toolNumber:"01",location:"Room 1 · Panel A",assignee:"John Smith",status:"in-progress",priority:"High",created:"Today, 09:20"},
  {id:"TK-1002",title:"Network equipment upgrade",toolNumber:"02",location:"Room 2 · Level 2",assignee:"Alex Brown",status:"assigned",priority:"Medium",created:"Today, 08:45"},
  {id:"TK-1003",title:"Replace damaged cable",toolNumber:"03",location:"Eng Room · Bay 4",assignee:"David Cohen",status:"open",priority:"High",created:"Yesterday, 16:10"},
  {id:"TK-1004",title:"Routine maintenance check",toolNumber:"04",location:"Gowning Room",assignee:"Michael Levy",status:"resolved",priority:"Low",created:"Yesterday, 13:30"},
  {id:"TK-1005",title:"Equipment installation",toolNumber:"05",location:"Storage Area",assignee:"Daniel Green",status:"assigned",priority:"Medium",created:"Nov 20, 11:15"}
];
const TOOL_GROUPS: ToolGroup[] = [
  { className: "tool-buildings", location: "west area", tools: [{ id: "site-a-01", name: "Tool 01", task: "Logistics Integrity", status: "under-warranty" }, { id: "site-a-02", name: "Tool 02", task: "Shipment Brackets", status: "in-shipment" }, { id: "site-a-03", name: "Tool 03", task: "Mechanical", status: "under-warranty" }] },
  { className: "tool-buildings tool-buildings-right tool-buildings-room-two", location: "east area", tools: [{ id: "site-b-01", name: "Tool 01", task: "PC & Electronics", status: "under-warranty" }, { id: "site-b-02", name: "Tool 02", task: "Hookups & Facilites", status: "out-of-service" }, { id: "site-b-03", name: "Tool 03", task: "Logistics Integrity", status: "under-warranty" }] },
  { className: "tool-buildings tool-buildings-room-two-bottom", location: "south area", tools: [{ id: "site-c-04", name: "Tool 04", task: "Shipment Brackets", status: "in-shipment" }, { id: "site-c-05", name: "Tool 05", task: "Mechanical", status: "under-warranty" }] },
  { className: "tool-buildings tool-buildings-storage", location: "storage area", tools: [{ id: "storage-01", name: "Tool 01", task: "PC & Electronics", status: "under-warranty" }, { id: "storage-02", name: "Tool 02", task: "Hookups & Facilites", status: "out-of-service" }, { id: "storage-03", name: "Tool 03", task: "Logistics Integrity", status: "under-warranty" }] }
];
function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(KEY);
    const employees = raw ? JSON.parse(raw) as StoredEmployee[] : DEFAULT_EMPLOYEES;
    return employees.map(({status,...employee})=>({...employee,status:status==="call-support"?"remote":status}));
  }
  catch { return DEFAULT_EMPLOYEES; }
}
function loadToolTasks(): ToolTasks {
  const defaults = Object.fromEntries(TOOL_GROUPS.flatMap(group => group.tools.map(tool => [tool.id, tool.task])));
  try {
    const raw = localStorage.getItem(TOOL_TASKS_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as ToolTasks;
    return Object.fromEntries(Object.entries({...defaults,...saved}).map(([toolId,task])=>[toolId,typeof task==="string"&&task?task:""]));
  } catch {
    return defaults;
  }
}
function loadCompletedToolTasks(): CompletedToolTasks {
  try {
    const raw = localStorage.getItem(COMPLETED_TOOL_TASKS_KEY);
    return raw ? JSON.parse(raw) as CompletedToolTasks : {};
  } catch {
    return {};
  }
}
function loadToolStatuses(): ToolStatuses {
  const defaults = Object.fromEntries(TOOL_GROUPS.flatMap(group => group.tools.map(tool => [tool.id, tool.status])));
  try {
    const raw = localStorage.getItem(TOOL_STATUSES_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) as ToolStatuses } : defaults;
  } catch {
    return defaults;
  }
}
function loadDirectoryTasks(): DirectoryTasks {
  const defaults: DirectoryTasks = {};
  for (const tool of TOOL_GROUPS.flatMap(group => group.tools)) {
    defaults[tool.id] = Object.fromEntries(TOOL_DIRECTORIES.map(directory => [
      directory,
      directory==="Logistics Integrity"?LOGISTICS_INTEGRITY_TASKS:
      directory==="Shipment Brackets"?SHIPMENT_BRACKETS_TASKS:[]
    ]));
  }
  try {
    const raw = localStorage.getItem(TOOL_DIRECTORY_TASKS_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as DirectoryTasks;
    return Object.fromEntries(Object.entries(defaults).map(([toolId,directories])=>{
      const savedDirectories=saved[toolId] ?? {};
      const logistics=[...new Set([...(savedDirectories["Logistics Integrity"]??[]),...LOGISTICS_INTEGRITY_TASKS])]
        .filter(task=>task!== "Install door");
      const shipment=[...new Set([...(savedDirectories["Shipment Brackets"]??[]),...SHIPMENT_BRACKETS_TASKS])];
      return [toolId,{...directories,...savedDirectories,"Logistics Integrity":logistics,"Shipment Brackets":shipment}];
    }));
  } catch {
    return defaults;
  }
}
const initials = (name: string) => name.trim().split(/\s+/).slice(0,2).map(p => p[0]?.toUpperCase() ?? "").join("");
export default function App() {
  const [employees,setEmployees] = useState<Employee[]>(loadEmployees);
  const [activeTab,setActiveTab] = useState<"overview"|"tickets">("overview");
  const [tickets,setTickets] = useState<Ticket[]>(DEFAULT_TICKETS);
  const [selectedTicketId,setSelectedTicketId] = useState<string|null>("TK-1001");
  const [ticketFilter,setTicketFilter] = useState<"all"|TicketStatus>("all");
  const [toolTasks,setToolTasks] = useState<ToolTasks>(loadToolTasks);
  const [completedToolTasks,setCompletedToolTasks] = useState<CompletedToolTasks>(loadCompletedToolTasks);
  const [toolStatuses,setToolStatuses] = useState<ToolStatuses>(loadToolStatuses);
  const [directoryTasks,setDirectoryTasks] = useState<DirectoryTasks>(loadDirectoryTasks);
  const [filter,setFilter] = useState<"all"|EmployeeStatus>("all");
  const [search,setSearch] = useState("");
  const [selectedId,setSelectedId] = useState<string|null>("e-1");
  const [selectedTool,setSelectedTool] = useState<SelectedSiteTool|null>(null);
  const [toolTaskDraft,setToolTaskDraft] = useState("");
  const [toolDirectoryDraft,setToolDirectoryDraft] = useState(TOOL_DIRECTORIES[0]);
  const [editingToolTask,setEditingToolTask] = useState(false);
  const [showAdd,setShowAdd] = useState(false);
  const [showTicketAdd,setShowTicketAdd] = useState(false);
  const [ticketTitle,setTicketTitle] = useState("");
  const [ticketToolNumber,setTicketToolNumber] = useState("");
  const [ticketLocation,setTicketLocation] = useState("");
  const [ticketAssignee,setTicketAssignee] = useState("");
  const [ticketStatus,setTicketStatus] = useState<TicketStatus>("open");
  const [ticketPriority,setTicketPriority] = useState<"Low"|"Medium"|"High">("Medium");
  const [showGuide,setShowGuide] = useState(false);
  const [name,setName] = useState("");
  const [role,setRole] = useState("Field technician");
  const [status,setStatus] = useState<EmployeeStatus>("free");
  const [task,setTask] = useState("");
  const [phone,setPhone] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<string|null>(null);

  useEffect(() => { localStorage.setItem(KEY,JSON.stringify(employees)); },[employees]);
  useEffect(() => { localStorage.setItem(TOOL_TASKS_KEY,JSON.stringify(toolTasks)); },[toolTasks]);
  useEffect(() => { localStorage.setItem(COMPLETED_TOOL_TASKS_KEY,JSON.stringify(completedToolTasks)); },[completedToolTasks]);
  useEffect(() => { localStorage.setItem(TOOL_STATUSES_KEY,JSON.stringify(toolStatuses)); },[toolStatuses]);
  useEffect(() => { localStorage.setItem(TOOL_DIRECTORY_TASKS_KEY,JSON.stringify(directoryTasks)); },[directoryTasks]);
  const selected = employees.find(e=>e.id===selectedId) ?? null;
  const visibleTickets = tickets.filter(ticket=>ticketFilter==="all"||ticket.status===ticketFilter);
  const selectedTicket = tickets.find(ticket=>ticket.id===selectedTicketId) ?? null;
  const counts = useMemo(() => ({
    all:employees.length,
    install:employees.filter(e=>e.status==="install").length,
    repair:employees.filter(e=>e.status==="repair").length,
    upgrade:employees.filter(e=>e.status==="upgrade").length,
    remote:employees.filter(e=>e.status==="remote").length,
    free:employees.filter(e=>e.status==="free").length
  }),[employees]);
  const visible = employees.filter(e => (filter==="all"||e.status===filter) && (!search.trim()||[e.name,e.role,e.task].some(v=>v.toLowerCase().includes(search.toLowerCase()))));

  function update(id:string,patch:Partial<Employee>) { setEmployees(old=>old.map(e=>e.id===id?{...e,...patch}:e)); }
  function openTool(tool:SiteTool,location:string) {
    setSelectedTool({...tool,location});
    setEditingToolTask(false);
    setToolDirectoryDraft(TOOL_DIRECTORIES[0]);
  }
  function toggleToolTaskCompletion(toolId:string,task:string,completed:boolean) {
    setCompletedToolTasks(old=>{
      const tasks = old[toolId] ?? [];
      const nextTasks = completed ? [...new Set([...tasks,task])] : tasks.filter(item=>item!==task);
      return {...old,[toolId]:nextTasks};
    });
  }
  function updateToolStatus(toolId:string,status:ToolStatus) {
    setToolStatuses(old=>({...old,[toolId]:status}));
  }
  function saveToolTask(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!selectedTool)return;
    const task=toolTaskDraft.trim();
    if(!task)return;
    setToolTasks(old=>({...old,[selectedTool.id]:task}));
    setDirectoryTasks(old=>{
      const directories=Object.fromEntries(TOOL_DIRECTORIES.map(directory=>[directory,[...(old[selectedTool.id]?.[directory]??[]).filter(item=>item!==task)]]));
      directories[toolDirectoryDraft]=[...new Set([...(directories[toolDirectoryDraft]??[]),task])];
      return {...old,[selectedTool.id]:directories};
    });
    setSelectedTool(null);
    setEditingToolTask(false);
  }
  function removeToolTask() {
    if(!selectedTool)return;
    setToolTasks(old=>({...old,[selectedTool.id]:""}));
    setDirectoryTasks(old=>({
      ...old,
      [selectedTool.id]:Object.fromEntries(TOOL_DIRECTORIES.map(directory=>[
        directory,
        (old[selectedTool.id]?.[directory]??[]).filter(task=>task!==toolTasks[selectedTool.id])
      ]))
    }));
    setSelectedTool(null);
    setEditingToolTask(false);
  }
  function addEmployee(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(!name.trim()) return;
    const item:Employee={id:crypto.randomUUID(),name:name.trim(),role:role.trim()||"Field technician",status,x:48+Math.random()*8,y:43+Math.random()*10,task:task.trim()||(status==="free"?"Available for assignment":"New assignment"),phone:phone.trim()};
    setEmployees(old=>[...old,item]); setSelectedId(item.id); setName("");setRole("Field technician");setStatus("free");setTask("");setPhone("");setShowAdd(false);
  }
  function addTicket(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!ticketTitle.trim())return;
    const nextNumber=1001+tickets.length;
    const item:Ticket={
      id:`TK-${nextNumber}`,
      title:ticketTitle.trim(),
      toolNumber:ticketToolNumber.trim(),
      location:ticketLocation.trim()||"North District Site",
      assignee:ticketAssignee.trim()||"Unassigned",
      status:ticketStatus,
      priority:ticketPriority,
      created:"Just now"
    };
    setTickets(old=>[item,...old]);
    setSelectedTicketId(item.id);
    setTicketTitle("");setTicketToolNumber("");setTicketLocation("");setTicketAssignee("");setTicketStatus("open");setTicketPriority("Medium");
    setShowTicketAdd(false);
  }
  function removeEmployee(id:string) {
    if(!window.confirm("Remove this employee from the site?")) return;
    setEmployees(old=>old.filter(e=>e.id!==id)); if(selectedId===id)setSelectedId(null);
  }
  function moveMarker(event:PointerEvent<HTMLButtonElement>) {
    if(!dragging.current||!mapRef.current)return;
    const r=mapRef.current.getBoundingClientRect();
    update(dragging.current,{x:Math.max(4,Math.min(96,(event.clientX-r.left)/r.width*100)),y:Math.max(7,Math.min(93,(event.clientY-r.top)/r.height*100))});
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><HardHat size={21}/></div><div><strong>fieldboard</strong><span>SITE OPERATIONS</span></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <button className={`nav-item ${activeTab==="overview"?"active":""}`} onClick={()=>setActiveTab("overview")}><LayoutDashboard size={18}/>Overview</button>
      <button className={`nav-item ${activeTab==="tickets"?"active":""}`} onClick={()=>setActiveTab("tickets")}><ClipboardList size={18}/>Tickets</button>
      <button className="nav-item" onClick={()=>setShowGuide(true)}><ClipboardList size={18}/>Activity guide</button>
      <div className="sidebar-spacer"/>
      <div className="site-card"><div className="site-card-icon"><MapPin size={17}/></div><div><strong>North District Site</strong><span>Project · ND-024</span></div><MoreHorizontal size={18} className="muted-icon"/></div>
      <button className="nav-item muted-nav" onClick={()=>setShowGuide(true)}><Settings2 size={18}/>Settings</button>
      <div className="profile"><div className="avatar manager">M</div><div className="profile-copy"><strong>Manager</strong><span>Site manager</span></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumbs"><span>Projects</span><span className="crumb-slash">/</span><strong>North District Site</strong></div><div className="topbar-right"><div className="live-indicator"><span/>Local workspace</div><button className="icon-button" aria-label="Help" onClick={()=>setShowGuide(true)}><CircleHelp size={19}/></button><div className="avatar manager top-avatar">M</div></div></header>
      <section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/>{activeTab==="tickets"?"TICKET OVERVIEW":"PROJECT OVERVIEW"}</div><h1>{activeTab==="tickets"?"Site tickets":"Site workforce"}</h1><p>{activeTab==="tickets"?"Review and manage assignments across the site.":"Monitor your team and manage assignments across the site."}</p></div><button className="primary-button" onClick={()=>activeTab==="tickets" ? setShowTicketAdd(true) : setShowAdd(true)}><Plus size={17}/>{activeTab==="tickets"?"Add ticket":"Add employee"}</button></section>

      {activeTab==="overview"&&<section className="stats-grid" aria-label="Employee status summary">
        <button className={`stat-card total ${filter==="all"?"chosen":""}`} onClick={()=>setFilter("all")}><div className="stat-top"><span>Total employees</span><div className="stat-icon slate"><Users size={17}/></div></div><div className="stat-number">{counts.all}</div><div className="stat-foot">On this site</div></button>
        {STATUSES.map(s=><button key={s} className={`stat-card ${filter===s?"chosen":""}`} onClick={()=>setFilter(filter===s?"all":s)}><div className="stat-top"><span>{STATUS_META[s].label}</span><i className="status-dot" style={{background:STATUS_META[s].color}}/></div><div className="stat-number">{counts[s]}</div><div className="stat-foot">{s==="free"?"Ready for assignment":"Currently assigned"}</div></button>)}
      </section>}

      {activeTab==="tickets"&&<><section className="stats-grid" aria-label="Ticket status summary">
        <button className={`stat-card total ${ticketFilter==="all"?"chosen":""}`} onClick={()=>setTicketFilter("all")}><div className="stat-top"><span>Total tickets</span><div className="stat-icon slate"><ClipboardList size={17}/></div></div><div className="stat-number">{tickets.length}</div><div className="stat-foot">At this site</div></button>
        {TICKET_STATUSES.map(status=><button key={status} className={`stat-card ${ticketFilter===status?"chosen":""}`} onClick={()=>setTicketFilter(ticketFilter===status?"all":status)}><div className="stat-top"><span>{TICKET_STATUS_META[status].label}</span><i className="status-dot" style={{background:TICKET_STATUS_META[status].color}}/></div><div className="stat-number">{tickets.filter(ticket=>ticket.status===status).length}</div><div className="stat-foot">{status==="resolved"?"Completed":"Requires attention"}</div></button>)}
      </section>
      <section className="tickets-section">
        <div className="section-heading"><div><div className="section-title-row"><h2>Tickets</h2><span className="map-live"><i/>LIVE VIEW</span></div><p>Manage active requests and assignments across the site.</p></div><div className="map-actions"><button className="secondary-button" onClick={()=>setTicketFilter("all")}><SlidersHorizontal size={16}/>Reset filters</button></div></div>
        <div className="ticket-grid">{visibleTickets.map(ticket=><button key={ticket.id} className={`ticket-card ${selectedTicketId===ticket.id?"ticket-selected":""}`} onClick={()=>setSelectedTicketId(ticket.id)}>
          <div className="ticket-card-top"><strong>{ticket.id}</strong><span className="ticket-status" style={{background:TICKET_STATUS_META[ticket.status].soft,color:TICKET_STATUS_META[ticket.status].color}}>{TICKET_STATUS_META[ticket.status].label}</span></div>
          <h3>{ticket.title}</h3>
          <div className="ticket-tool-number">Tool {ticket.toolNumber}</div>
          <div className="ticket-location"><MapPin size={14}/>{ticket.location}</div>
          <div className="ticket-card-footer"><span>{ticket.assignee}</span><b className={`priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</b></div>
        </button>)}</div>
      </section>
      {selectedTicket&&<section className="ticket-details-card">
        <div className="ticket-details-heading"><div><label>SELECTED TICKET</label><strong>{selectedTicket.id}</strong></div><span className="ticket-status" style={{background:TICKET_STATUS_META[selectedTicket.status].soft,color:TICKET_STATUS_META[selectedTicket.status].color}}>{TICKET_STATUS_META[selectedTicket.status].label}</span></div>
        <div className="ticket-details-title"><strong>{selectedTicket.title}</strong><span><MapPin size={13}/>{selectedTicket.location}</span></div>
        <div className="ticket-details-field"><label>TOOL NUMBER</label><strong>Tool {selectedTicket.toolNumber}</strong></div>
        <div className="ticket-details-field"><label>ASSIGNEE</label><strong>{selectedTicket.assignee}</strong></div>
        <div className="ticket-details-field"><label>STATUS</label><select value={selectedTicket.status} onChange={event=>setTickets(old=>old.map(ticket=>ticket.id===selectedTicket.id?{...ticket,status:event.target.value as TicketStatus}:ticket))}>{TICKET_STATUSES.map(status=><option key={status} value={status}>{TICKET_STATUS_META[status].label}</option>)}</select></div>
      </section>}</>}

      {activeTab==="overview"&&<section className="map-section">
        <div className="section-heading"><div><div className="section-title-row"><h2>Live site map</h2><span className="map-live"><i/>LIVE VIEW</span></div><p>Drag employee markers to update their position.</p></div><div className="map-actions"><button className="secondary-button" onClick={()=>{setFilter("all");setSearch("");}}><SlidersHorizontal size={16}/>Reset filters</button><button className="secondary-button compact" onClick={()=>setShowGuide(true)}><ArrowDownUp size={16}/></button></div></div>
        <div className="map-layout">
          <div className="site-map" ref={mapRef} onPointerUp={()=>{dragging.current=null;}} onPointerLeave={()=>{dragging.current=null;}}>
            <div className="map-grid"/>
            <div className="map-room room-one"><span>ROOM 1</span></div>
            <div className="map-label main-room-label">MAIN ROOM</div>
            <div className="map-room room-three"><span>ENG ROOM</span></div>
            <div className="map-room room-four"><span>GOWNING ROOM</span></div>
            <div className="map-label map-label-north">N <b>↑</b></div>
            <div className="map-road road-horizontal"><span></span></div><div className="map-road road-horizontal road-horizontal-upper"/><div className="map-road road-horizontal road-horizontal-top"><span></span></div><div className="map-road road-vertical"/>
            <div className="map-room room-two"><span>ROOM 2</span></div>
            {TOOL_GROUPS.map(group=><div key={group.className} className={group.className}>{group.tools.map(tool=>{
              const toolStatus = toolStatuses[tool.id] ?? tool.status;
              return <button type="button" key={tool.id} className="building building-one" onClick={()=>openTool(tool,group.location)} aria-label={`Edit ${tool.name} task in ${group.location}`} title={`${tool.name}: ${TOOL_STATUS_META[toolStatus].label} — ${toolTasks[tool.id]}`}><b>{tool.name}</b><span className="tool-status-badge" style={{"--tool-status-color":TOOL_STATUS_META[toolStatus].color} as CSSProperties}>{TOOL_STATUS_META[toolStatus].label}</span><div className="building-windows"><i/><i/><i/></div></button>;
            })}</div>)}
            {visible.map(e=><button key={e.id} className={`employee-marker ${selectedId===e.id?"selected":""}`} style={{left:`${e.x}%`,top:`${e.y}%`,"--marker-color":STATUS_META[e.status].color} as CSSProperties} onPointerDown={event=>{event.preventDefault();dragging.current=e.id;setSelectedId(e.id);event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={moveMarker} onPointerUp={()=>{dragging.current=null;}} onClick={()=>setSelectedId(e.id)} title={`${e.name} · ${STATUS_META[e.status].label}`}><span>{initials(e.name)}</span><small>{STATUS_META[e.status].label}</small></button>)}
            {visible.length===0&&<div className="empty-map">No employees match this filter.</div>}
            <div className="map-legend"><span><i className="legend-install"/>Install</span><span><i className="legend-repair"/>Repair</span><span><i className="legend-upgrade"/>Upgrade</span><span><i className="legend-remote"/>Remote</span><span><i className="legend-free"/>Free</span></div><div className="map-scale"><i/>20 m</div>
          </div>
          <aside className="map-side-panel">
            <div className="panel-header"><div><h3>Team on site</h3><p>{visible.length} employees shown</p></div><b>{visible.length}</b></div>
            <div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employees..."/><kbd>/</kbd></div>
            <div className="filter-pills"><button className={filter==="all"?"pill active-pill":"pill"} onClick={()=>setFilter("all")}>All {counts.all}</button>{STATUSES.map(s=><button key={s} className={filter===s?"pill active-pill":"pill"} onClick={()=>setFilter(filter===s?"all":s)}>{STATUS_META[s].label}</button>)}</div>
            <div className="employee-list">{visible.map(e=><button key={e.id} className={`employee-row ${selectedId===e.id?"row-selected":""}`} onClick={()=>setSelectedId(e.id)}><div className="avatar employee-avatar" style={{background:STATUS_META[e.status].soft,color:STATUS_META[e.status].color}}>{initials(e.name)}</div><div className="employee-row-copy"><strong>{e.name}</strong><span>{e.role}</span></div><i className="mini-status" style={{background:STATUS_META[e.status].color}}/></button>)}{visible.length===0&&<div className="empty-list">No matching employees found.</div>}</div>
            <div className="panel-footer"><ShieldCheck size={15}/>Employee positions are saved in this browser.</div>
          </aside>
        </div>
      </section>}

      {activeTab==="overview"&&selected&&<section className="details-card">
        <div className="details-identity"><div className="avatar details-avatar" style={{background:STATUS_META[selected.status].soft,color:STATUS_META[selected.status].color}}>{initials(selected.name)}</div><div><strong>{selected.name}</strong><span>{selected.role}</span></div></div>
        <div className="details-task"><label>CURRENT TASK</label><strong>{selected.task||"No task assigned"}</strong></div><div className="details-task"><label>CONTACT</label><strong>{selected.phone||"Not provided"}</strong></div>
        <div className="details-status-actions">
          <div className="details-status"><label htmlFor="employee-status">STATUS</label><select id="employee-status" value={selected.status} onChange={e=>update(selected.id,{status:e.target.value as EmployeeStatus})}>{STATUSES.map(s=><option key={s} value={s}>{STATUS_META[s].label}</option>)}</select></div>
          <button className="delete-button" title="Remove employee" onClick={()=>removeEmployee(selected.id)}><Trash2 size={17}/></button>
        </div>
      </section>}
      <footer className="page-footer"><span>FIELDBOARD · SITE OPERATIONS</span><span><Activity size={13}/>Frontend demo · Local browser storage</span></footer>
    </main>

    {showAdd&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAdd(false);}}><form className="modal" onSubmit={addEmployee}>
      <div className="modal-heading"><div><label className="modal-kicker">TEAM MANAGEMENT</label><h2>Add employee</h2><p>Add a team member to the site map.</p></div><button type="button" className="icon-button" onClick={()=>setShowAdd(false)}><X size={19}/></button></div>
      <label>Full name<input autoFocus required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Taylor Morgan"/></label>
      <label>Job role<input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Electrician"/></label>
      <label>Current assignment<input value={task} onChange={e=>setTask(e.target.value)} placeholder="e.g. Building A · Floor 2"/></label>
      <label>Phone number<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 555 0100"/></label>
      <label>Initial status<select value={status} onChange={e=>setStatus(e.target.value as EmployeeStatus)}>{STATUSES.map(s=><option key={s} value={s}>{STATUS_META[s].label}</option>)}</select></label>
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setShowAdd(false)}>Cancel</button><button type="submit" className="primary-button"><Plus size={16}/>Add to site</button></div>
    </form></div>}

    {showTicketAdd&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowTicketAdd(false);}}><form className="modal" onSubmit={addTicket}>
      <div className="modal-heading"><div><label className="modal-kicker">TICKET MANAGEMENT</label><h2>Add ticket</h2><p>Create a new assignment for the site team.</p></div><button type="button" className="icon-button" onClick={()=>setShowTicketAdd(false)}><X size={19}/></button></div>
      <label>Ticket title<input autoFocus required value={ticketTitle} onChange={e=>setTicketTitle(e.target.value)} placeholder="Describe the issue"/></label>
      <label>Tool number<input type="number" min="1" value={ticketToolNumber} onChange={e=>setTicketToolNumber(e.target.value)} placeholder="e.g. 01"/></label>
      <label>Location<input value={ticketLocation} onChange={e=>setTicketLocation(e.target.value)} placeholder="e.g. Room 2 · Bay 4"/></label>
      <label>Assignee<input value={ticketAssignee} onChange={e=>setTicketAssignee(e.target.value)} placeholder="Employee name"/></label>
      <label>Status<select value={ticketStatus} onChange={e=>setTicketStatus(e.target.value as TicketStatus)}>{TICKET_STATUSES.map(status=><option key={status} value={status}>{TICKET_STATUS_META[status].label}</option>)}</select></label>
      <label>Priority<select value={ticketPriority} onChange={e=>setTicketPriority(e.target.value as "Low"|"Medium"|"High")}><option>Low</option><option>Medium</option><option>High</option></select></label>
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setShowTicketAdd(false)}>Cancel</button><button type="submit" className="primary-button"><Plus size={16}/>Add ticket</button></div>
    </form></div>}

    {selectedTool&&!editingToolTask&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedTool(null);}}><div className="modal">
      <div className="modal-heading"><div><label className="modal-kicker">SITE TOOL · {selectedTool.location.toUpperCase()}</label><h2>{selectedTool.name} tasks</h2><p>Mark tasks complete as work is finished.</p></div><button type="button" className="icon-button" aria-label="Close task list" onClick={()=>setSelectedTool(null)}><X size={19}/></button></div>
      <div className="tool-modal-status"><span>Status</span><span className="tool-status-badge tool-status-badge-modal" style={{"--tool-status-color":TOOL_STATUS_META[toolStatuses[selectedTool.id] ?? selectedTool.status].color} as CSSProperties}>{TOOL_STATUS_META[toolStatuses[selectedTool.id] ?? selectedTool.status].label}</span></div>
      <label className="tool-status-label" htmlFor="tool-status"><span>Tool status</span><select id="tool-status" value={toolStatuses[selectedTool.id] ?? selectedTool.status} onChange={e=>updateToolStatus(selectedTool.id,e.target.value as ToolStatus)}>{TOOL_STATUSES.map(status=><option key={status} value={status}>{TOOL_STATUS_META[status].label}</option>)}</select></label>
      <div className="tool-directory-list" role="group" aria-label="Tool directories">{TOOL_DIRECTORIES.map(directory=>{
        const tasks=directoryTasks[selectedTool.id]?.[directory]??[];
        return <section key={directory} className="tool-directory"><h3>{directory}</h3>{tasks.length===0?<p className="tool-directory-empty">No tasks</p>:tasks.map(task=><label key={task} className="tool-task-option">
          <span>{task}</span>
          <input type="checkbox" aria-label={`Mark ${task} complete`} checked={completedToolTasks[selectedTool.id]?.includes(`${directory}::${task}`) ?? false} onChange={event=>toggleToolTaskCompletion(selectedTool.id,`${directory}::${task}`,event.target.checked)} onClick={event=>event.stopPropagation()}/>
        </label>)}</section>;
      })}</div>
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>{setToolTaskDraft(toolTasks[selectedTool.id] ?? "");setToolDirectoryDraft(TOOL_DIRECTORIES.find(directory=>(directoryTasks[selectedTool.id]?.[directory]??[]).includes(toolTasks[selectedTool.id]))??TOOL_DIRECTORIES[0]);setEditingToolTask(true);}}>Edit current task</button></div>
    </div></div>}

    {selectedTool&&editingToolTask&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedTool(null);}}><form className="modal" onSubmit={saveToolTask}>
      <div className="modal-heading"><div><label className="modal-kicker">SITE TOOL · {selectedTool.location.toUpperCase()}</label><h2>Edit task</h2><p>Update the to-do task for {selectedTool.name}.</p></div><button type="button" className="icon-button" aria-label="Close tool task editor" onClick={()=>setSelectedTool(null)}><X size={19}/></button></div>
      <div className="tool-modal-status"><span>Status</span><span className="tool-status-badge tool-status-badge-modal" style={{"--tool-status-color":TOOL_STATUS_META[toolStatuses[selectedTool.id] ?? selectedTool.status].color} as CSSProperties}>{TOOL_STATUS_META[toolStatuses[selectedTool.id] ?? selectedTool.status].label}</span></div>
      <label htmlFor="tool-directory">Directory<select id="tool-directory" value={toolDirectoryDraft} onChange={e=>setToolDirectoryDraft(e.target.value)}>{TOOL_DIRECTORIES.map(directory=><option key={directory} value={directory}>{directory}</option>)}</select></label>
      <label htmlFor="tool-task">To-do task<textarea id="tool-task" autoFocus rows={4} value={toolTaskDraft} onChange={e=>setToolTaskDraft(e.target.value)} placeholder="Enter a task for this tool..."/></label>
      <div className="modal-actions"><button type="button" className="remove-task-button" onClick={removeToolTask}>Remove task</button><button type="button" className="secondary-button" onClick={()=>setEditingToolTask(false)}>Back to tasks</button><button type="submit" className="primary-button">Save task</button></div>
    </form></div>}

    {showGuide&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowGuide(false);}}><div className="modal help-modal">
      <div className="modal-heading"><div><label className="modal-kicker">QUICK GUIDE</label><h2>Using the site map</h2><p>Manage your workforce from one visual workspace.</p></div><button className="icon-button" onClick={()=>setShowGuide(false)}><X size={19}/></button></div>
      <div className="guide-item"><div className="guide-icon"><Users size={18}/></div><div><strong>Select an employee</strong><span>Click a marker or team member in the list to view details.</span></div></div>
      <div className="guide-item"><div className="guide-icon"><MapPin size={18}/></div><div><strong>Move a marker</strong><span>Drag an employee circle to change their position on the site map.</span></div></div>
      <div className="guide-item"><div className="guide-icon"><Check size={18}/></div><div><strong>Change a status</strong><span>Use the status selector in employee details. The marker color updates immediately.</span></div></div>
      <div className="guide-note">Frontend-only demo: data is stored in this browser and does not synchronize between devices or users.</div><div className="modal-actions"><button className="primary-button" onClick={()=>setShowGuide(false)}>Got it</button></div>
    </div></div>}
  </div>;
}