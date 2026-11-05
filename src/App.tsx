import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, PointerEvent, CSSProperties } from "react";
import { Activity, ArrowDownUp, Check, CircleHelp, ClipboardList, HardHat, LayoutDashboard, MapPin, MoreHorizontal, Plus, Search, Settings2, ShieldCheck, SlidersHorizontal, Trash2, Users, X } from "lucide-react";
import { DEFAULT_EMPLOYEES, STATUS_META } from "./types";
import type { Employee, EmployeeStatus } from "./types";

const KEY = "fieldboard-employees-v1";
const STATUSES: EmployeeStatus[] = ["install", "repair", "upgrade", "free"];
function loadEmployees(): Employee[] {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) as Employee[] : DEFAULT_EMPLOYEES; }
  catch { return DEFAULT_EMPLOYEES; }
}
const initials = (name: string) => name.trim().split(/\s+/).slice(0,2).map(p => p[0]?.toUpperCase() ?? "").join("");

export default function App() {
  const [employees,setEmployees] = useState<Employee[]>(loadEmployees);
  const [filter,setFilter] = useState<"all"|EmployeeStatus>("all");
  const [search,setSearch] = useState("");
  const [selectedId,setSelectedId] = useState<string|null>("e-1");
  const [showAdd,setShowAdd] = useState(false);
  const [showGuide,setShowGuide] = useState(false);
  const [name,setName] = useState("");
  const [role,setRole] = useState("Field technician");
  const [status,setStatus] = useState<EmployeeStatus>("free");
  const [task,setTask] = useState("");
  const [phone,setPhone] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<string|null>(null);

  useEffect(() => { localStorage.setItem(KEY,JSON.stringify(employees)); },[employees]);
  const selected = employees.find(e=>e.id===selectedId) ?? null;
  const counts = useMemo(() => ({
    all:employees.length,
    install:employees.filter(e=>e.status==="install").length,
    repair:employees.filter(e=>e.status==="repair").length,
    upgrade:employees.filter(e=>e.status==="upgrade").length,
    free:employees.filter(e=>e.status==="free").length
  }),[employees]);
  const visible = employees.filter(e => (filter==="all"||e.status===filter) && (!search.trim()||[e.name,e.role,e.task].some(v=>v.toLowerCase().includes(search.toLowerCase()))));

  function update(id:string,patch:Partial<Employee>) { setEmployees(old=>old.map(e=>e.id===id?{...e,...patch}:e)); }
  function addEmployee(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(!name.trim()) return;
    const item:Employee={id:crypto.randomUUID(),name:name.trim(),role:role.trim()||"Field technician",status,x:48+Math.random()*8,y:43+Math.random()*10,task:task.trim()||(status==="free"?"Available for assignment":"New assignment"),phone:phone.trim()};
    setEmployees(old=>[...old,item]); setSelectedId(item.id); setName("");setRole("Field technician");setStatus("free");setTask("");setPhone("");setShowAdd(false);
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
      <button className="nav-item active"><LayoutDashboard size={18}/>Overview</button>
      <button className="nav-item" onClick={()=>setFilter("all")}><Users size={18}/>Employees <span className="nav-count">{employees.length}</span></button>
      <button className="nav-item" onClick={()=>setShowGuide(true)}><ClipboardList size={18}/>Activity guide</button>
      <div className="sidebar-spacer"/>
      <div className="site-card"><div className="site-card-icon"><MapPin size={17}/></div><div><strong>North District Site</strong><span>Project · ND-024</span></div><MoreHorizontal size={18} className="muted-icon"/></div>
      <button className="nav-item muted-nav" onClick={()=>setShowGuide(true)}><Settings2 size={18}/>Settings</button>
      <div className="profile"><div className="avatar manager">M</div><div className="profile-copy"><strong>Manager</strong><span>Site manager</span></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumbs"><span>Projects</span><span className="crumb-slash">/</span><strong>North District Site</strong></div><div className="topbar-right"><div className="live-indicator"><span/>Local workspace</div><button className="icon-button" aria-label="Help" onClick={()=>setShowGuide(true)}><CircleHelp size={19}/></button><div className="avatar manager top-avatar">M</div></div></header>
      <section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/>PROJECT OVERVIEW</div><h1>Site workforce</h1><p>Monitor your team and manage assignments across the site.</p></div><button className="primary-button" onClick={()=>setShowAdd(true)}><Plus size={17}/>Add employee</button></section>

      <section className="stats-grid" aria-label="Employee status summary">
        <button className={`stat-card total ${filter==="all"?"chosen":""}`} onClick={()=>setFilter("all")}><div className="stat-top"><span>Total employees</span><div className="stat-icon slate"><Users size={17}/></div></div><div className="stat-number">{counts.all}</div><div className="stat-foot">On this site</div></button>
        {STATUSES.map(s=><button key={s} className={`stat-card ${filter===s?"chosen":""}`} onClick={()=>setFilter(filter===s?"all":s)}><div className="stat-top"><span>{STATUS_META[s].label}</span><i className="status-dot" style={{background:STATUS_META[s].color}}/></div><div className="stat-number">{counts[s]}</div><div className="stat-foot">{s==="free"?"Ready for assignment":"Currently assigned"}</div></button>)}
      </section>

      <section className="map-section">
        <div className="section-heading"><div><div className="section-title-row"><h2>Live site map</h2><span className="map-live"><i/>LIVE VIEW</span></div><p>Drag employee markers to update their position.</p></div><div className="map-actions"><button className="secondary-button" onClick={()=>{setFilter("all");setSearch("");}}><SlidersHorizontal size={16}/>Reset filters</button><button className="secondary-button compact" onClick={()=>setShowGuide(true)}><ArrowDownUp size={16}/></button></div></div>
        <div className="map-layout">
          <div className="site-map" ref={mapRef} onPointerUp={()=>{dragging.current=null;}} onPointerLeave={()=>{dragging.current=null;}}>
            <div className="map-grid"/>
            <div className="map-room room-one"><span>ROOM 1</span></div>
           
            <div className="map-room room-three"><span>ROOM 3</span></div>
            <div className="map-label map-label-north">N <b>↑</b></div>
            <div className="map-road road-horizontal"><span></span></div><div className="map-road road-vertical"/>
            <div className="map-room room-two"><span>ROOM 2</span></div>
            <div className="tool-buildings">
              <div className="building building-one"><b>Tool 01</b><div className="building-windows"><i/><i/><i/></div></div>
              <div className="building building-one"><b>Tool 02</b><div className="building-windows"><i/><i/><i/></div></div>
              <div className="building building-one"><b>Tool 03</b><div className="building-windows"><i/><i/><i/></div></div>
            </div>
            <div className="tool-buildings tool-buildings-right">
              <div className="building building-one"><b>Tool 01</b><div className="building-windows"><i/><i/><i/></div></div>
              <div className="building building-one"><b>Tool 02</b><div className="building-windows"><i/><i/><i/></div></div>
              <div className="building building-one"><b>Tool 03</b><div className="building-windows"><i/><i/><i/></div></div>
            </div>
            <div className="tool-buildings tool-buildings-storage">
              <div className="building building-one"><b>Tool 01</b><div className="building-windows"><i/><i/><i/></div></div>
              <div className="building building-one"><b>Tool 02</b><div className="building-windows"><i/><i/><i/></div></div>
              <div className="building building-one"><b>Tool 03</b><div className="building-windows"><i/><i/><i/></div></div>
            </div>
            {visible.map(e=><button key={e.id} className={`employee-marker ${selectedId===e.id?"selected":""}`} style={{left:`${e.x}%`,top:`${e.y}%`,"--marker-color":STATUS_META[e.status].color} as CSSProperties} onPointerDown={event=>{event.preventDefault();dragging.current=e.id;setSelectedId(e.id);event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={moveMarker} onPointerUp={()=>{dragging.current=null;}} onClick={()=>setSelectedId(e.id)} title={`${e.name} · ${STATUS_META[e.status].label}`}><span>{initials(e.name)}</span><small>{STATUS_META[e.status].label}</small></button>)}
            {visible.length===0&&<div className="empty-map">No employees match this filter.</div>}
            <div className="map-legend"><span><i className="legend-install"/>Install</span><span><i className="legend-repair"/>Repair</span><span><i className="legend-upgrade"/>Upgrade</span><span><i className="legend-free"/>Free</span></div><div className="map-scale"><i/>20 m</div>
          </div>
          <aside className="map-side-panel">
            <div className="panel-header"><div><h3>Team on site</h3><p>{visible.length} employees shown</p></div><b>{visible.length}</b></div>
            <div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employees..."/><kbd>/</kbd></div>
            <div className="filter-pills"><button className={filter==="all"?"pill active-pill":"pill"} onClick={()=>setFilter("all")}>All {counts.all}</button>{STATUSES.map(s=><button key={s} className={filter===s?"pill active-pill":"pill"} onClick={()=>setFilter(filter===s?"all":s)}>{STATUS_META[s].label}</button>)}</div>
            <div className="employee-list">{visible.map(e=><button key={e.id} className={`employee-row ${selectedId===e.id?"row-selected":""}`} onClick={()=>setSelectedId(e.id)}><div className="avatar employee-avatar" style={{background:STATUS_META[e.status].soft,color:STATUS_META[e.status].color}}>{initials(e.name)}</div><div className="employee-row-copy"><strong>{e.name}</strong><span>{e.role}</span></div><i className="mini-status" style={{background:STATUS_META[e.status].color}}/></button>)}{visible.length===0&&<div className="empty-list">No matching employees found.</div>}</div>
            <div className="panel-footer"><ShieldCheck size={15}/>Employee positions are saved in this browser.</div>
          </aside>
        </div>
      </section>

      {selected&&<section className="details-card">
        <div className="details-identity"><div className="avatar details-avatar" style={{background:STATUS_META[selected.status].soft,color:STATUS_META[selected.status].color}}>{initials(selected.name)}</div><div><strong>{selected.name}</strong><span>{selected.role}</span></div></div>
        <div className="details-task"><label>CURRENT TASK</label><strong>{selected.task||"No task assigned"}</strong></div><div className="details-task"><label>CONTACT</label><strong>{selected.phone||"Not provided"}</strong></div>
        <div className="details-status"><label htmlFor="employee-status">STATUS</label><select id="employee-status" value={selected.status} onChange={e=>update(selected.id,{status:e.target.value as EmployeeStatus})}>{STATUSES.map(s=><option key={s} value={s}>{STATUS_META[s].label}</option>)}</select></div>
        <button className="delete-button" title="Remove employee" onClick={()=>removeEmployee(selected.id)}><Trash2 size={17}/></button>
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

    {showGuide&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowGuide(false);}}><div className="modal help-modal">
      <div className="modal-heading"><div><label className="modal-kicker">QUICK GUIDE</label><h2>Using the site map</h2><p>Manage your workforce from one visual workspace.</p></div><button className="icon-button" onClick={()=>setShowGuide(false)}><X size={19}/></button></div>
      <div className="guide-item"><div className="guide-icon"><Users size={18}/></div><div><strong>Select an employee</strong><span>Click a marker or team member in the list to view details.</span></div></div>
      <div className="guide-item"><div className="guide-icon"><MapPin size={18}/></div><div><strong>Move a marker</strong><span>Drag an employee circle to change their position on the site map.</span></div></div>
      <div className="guide-item"><div className="guide-icon"><Check size={18}/></div><div><strong>Change a status</strong><span>Use the status selector in employee details. The marker color updates immediately.</span></div></div>
      <div className="guide-note">Frontend-only demo: data is stored in this browser and does not synchronize between devices or users.</div><div className="modal-actions"><button className="primary-button" onClick={()=>setShowGuide(false)}>Got it</button></div>
    </div></div>}
  </div>;
}