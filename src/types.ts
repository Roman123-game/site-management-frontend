export type EmployeeStatus = "install" | "repair" | "upgrade" | "free";
export interface Employee {
  id: string; name: string; role: string; status: EmployeeStatus;
  x: number; y: number; task: string; phone: string;
}
export const STATUS_META: Record<EmployeeStatus, {label:string;color:string;soft:string}> = {
  install:{label:"Install",color:"#3b82f6",soft:"#eaf2ff"},
  repair:{label:"Repair",color:"#f59e0b",soft:"#fff5df"},
  upgrade:{label:"Upgrade",color:"#8b5cf6",soft:"#f2edff"},
  free:{label:"Free",color:"#10a779",soft:"#e5f7f0"}
};
export const DEFAULT_EMPLOYEES: Employee[] = [
  {id:"e-1",name:"John Smith",role:"Field technician",status:"install",x:22,y:29,task:"Unit A · First fix",phone:"+1 555 0101"},
  {id:"e-2",name:"David Cohen",role:"Electrician",status:"repair",x:46,y:23,task:"Panel room · Fault 04",phone:"+1 555 0102"},
  {id:"e-3",name:"Michael Levy",role:"Site technician",status:"free",x:72,y:33,task:"Available for assignment",phone:"+1 555 0103"},
  {id:"e-4",name:"Alex Brown",role:"Network installer",status:"upgrade",x:34,y:67,task:"Level 2 · Network",phone:"+1 555 0104"},
  {id:"e-5",name:"Daniel Green",role:"Field technician",status:"install",x:78,y:72,task:"Unit C · Equipment",phone:"+1 555 0105"},
  {id:"e-6",name:"James Wilson",role:"Maintenance",status:"free",x:57,y:51,task:"Available for assignment",phone:"+1 555 0106"}
];