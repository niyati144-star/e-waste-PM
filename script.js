/* ================= DATA LAYER ================= */
const STAGES = ["Registered","Assigned","Inspection","Repair","Reuse","Recycle","Dispose"];
const STATUS_TO_BADGE = {Active:"badge-active",Repair:"badge-repair",Reused:"badge-reused",Recycled:"badge-recycled",Disposed:"badge-disposed"};
const STATUS_COLORS = {Active:"#10B981",Repair:"#F59E0B",Reused:"#0F766E",Recycled:"#7C3AED",Disposed:"#EF4444"};

function seedData(){
  return [
    {id:"LT001",name:"Dell Latitude 5420",category:"Laptop",brand:"Dell",model:"Latitude 5420",serial:"DL123456",
     purchaseDate:"2023-01-10",purchaseYear:"2023",purchaseCost:"68000",warrantyExpiry:"2026-01-10",
     department:"IT",location:"Lab 2",owner:"IT Department",condition:"Good",status:"Active",
     history:[{stage:"Registered",date:"2023-01-10",remarks:"Initial registration"},
              {stage:"Assigned to IT",date:"2023-01-12",remarks:"Deployed to IT department"}],
     repairs:[]},
    {id:"LT002",name:"HP ProBook",category:"Laptop",brand:"HP",model:"ProBook 440",serial:"HP998821",
     purchaseDate:"2022-03-05",purchaseYear:"2022",purchaseCost:"54000",warrantyExpiry:"2025-03-05",
     department:"HR",location:"HR Office",owner:"HR Department",condition:"Good",status:"Reused",
     history:[{stage:"Registered",date:"2022-03-05",remarks:"Initial registration"},
              {stage:"Assigned to HR",date:"2022-03-08",remarks:"Deployed to HR"},
              {stage:"Reused",date:"2024-11-02",remarks:"Reassigned to new joiner"}],
     repairs:[]},
    {id:"MON001",name:"Dell Monitor",category:"Monitor",brand:"Dell",model:"P2419H",serial:"DM445210",
     purchaseDate:"2021-06-20",purchaseYear:"2021",purchaseCost:"12500",warrantyExpiry:"2024-06-20",
     department:"IT",location:"Lab 2",owner:"IT Department",condition:"Fair",status:"Repair",
     history:[{stage:"Registered",date:"2021-06-20",remarks:"Initial registration"},
              {stage:"Assigned to IT",date:"2021-06-22",remarks:"Deployed to IT lab"},
              {stage:"Inspection",date:"2024-06-15",remarks:"Flickering screen reported"},
              {stage:"Under Repair",date:"2024-06-20",remarks:"Sent for panel repair"}],
     repairs:[{date:"2024-06-20",issue:"Screen flickering",technician:"Rahul",cost:"1200",status:"In Progress"}]},
    {id:"MOB001",name:"Samsung Galaxy Tab",category:"Tablet",brand:"Samsung",model:"Tab A8",serial:"SG778123",
     purchaseDate:"2022-09-12",purchaseYear:"2022",purchaseCost:"21000",warrantyExpiry:"2024-09-12",
     department:"Library",location:"Front Desk",owner:"Library",condition:"Poor",status:"Recycled",
     history:[{stage:"Registered",date:"2022-09-12",remarks:"Initial registration"},
              {stage:"Assigned to Library",date:"2022-09-14",remarks:"Deployed to front desk"},
              {stage:"Inspection",date:"2025-02-01",remarks:"Battery swelling detected"},
              {stage:"Recycled",date:"2025-02-10",remarks:"Sent to certified recycler"}],
     repairs:[]},
    {id:"LT003",name:"Lenovo ThinkPad T14",category:"Laptop",brand:"Lenovo",model:"ThinkPad T14",serial:"LN552090",
     purchaseDate:"2020-02-18",purchaseYear:"2020",purchaseCost:"71000",warrantyExpiry:"2023-02-18",
     department:"Finance",location:"Finance Office",owner:"Finance Department",condition:"Poor",status:"Disposed",
     history:[{stage:"Registered",date:"2020-02-18",remarks:"Initial registration"},
              {stage:"Assigned to Finance",date:"2020-02-20",remarks:"Deployed to finance"},
              {stage:"Inspection",date:"2025-04-01",remarks:"Motherboard failure"},
              {stage:"Disposed",date:"2025-04-15",remarks:"End of life, disposed"}],
     repairs:[{date:"2024-01-10",issue:"Battery replacement",technician:"Sneha",cost:"2500",status:"Completed"}]},
    {id:"PR001",name:"Canon LaserJet Printer",category:"Printer",brand:"Canon",model:"LBP2900",serial:"CN331298",
     purchaseDate:"2023-05-22",purchaseYear:"2023",purchaseCost:"9800",warrantyExpiry:"2025-05-22",
     department:"Administration",location:"Admin Block",owner:"Administration",condition:"Excellent",status:"Active",
     history:[{stage:"Registered",date:"2023-05-22",remarks:"Initial registration"},
              {stage:"Assigned to Administration",date:"2023-05-24",remarks:"Deployed to admin block"}],
     repairs:[]},
  ];
}

function getAssets(){
  let a = JSON.parse(localStorage.getItem("ewaste_assets")||"null");
  if(!a){ a = seedData(); saveAssets(a); }
  return a;
}
function saveAssets(a){ localStorage.setItem("ewaste_assets", JSON.stringify(a)); }
function getAsset(id){ return getAssets().find(x=>x.id===id); }
function getSettings(){
  let s = JSON.parse(localStorage.getItem("ewaste_settings")||"null");
  if(!s){ s = {name:"Admin",email:"admin@ewastetrack.org",role:"Administrator",notifications:true,darkMode:false,language:"English"}; localStorage.setItem("ewaste_settings",JSON.stringify(s)); }
  return s;
}
function saveSettings(s){ localStorage.setItem("ewaste_settings", JSON.stringify(s)); }

/* ================= APP STATE / ROUTER ================= */
const App = { editingId:null, qrTargetId:null, charts:{} };

function icons(){ if(window.lucide) lucide.createIcons(); }

function navigate(view, param){
  document.querySelectorAll(".nav-item[data-nav]").forEach(n=>n.classList.toggle("active", n.dataset.nav===view));
  const titles = {dashboard:"Dashboard",assets:"Asset Management",'add-asset':"Register New Asset",scanner:"Scan Asset QR Code",
    lifecycle:"Lifecycle Management",reports:"Reports & Analytics",settings:"Settings",
    'asset-details':"Asset Details",'qr-page':"Asset QR Code"};
  document.getElementById("page-title").textContent = titles[view] || "Dashboard";
  document.getElementById("sidebar").classList.remove("open");
  const map = {
    dashboard: renderDashboard, assets: renderAssets, 'add-asset': ()=>renderAddAsset(param),
    scanner: renderScanner, lifecycle: renderLifecycle, reports: renderReports, settings: renderSettings,
    'asset-details': ()=>renderAssetDetails(param), 'qr-page': ()=>renderQRPage(param)
  };
  (map[view]||renderDashboard)();
  window.scrollTo(0,0);
}

document.querySelectorAll(".nav-item[data-nav]").forEach(n=>{
  n.addEventListener("click", ()=> navigate(n.dataset.nav));
});
document.getElementById("logout-btn").addEventListener("click", doLogout);
document.getElementById("menu-toggle-btn")?.addEventListener("click", ()=> document.getElementById("sidebar").classList.toggle("open"));

/* ================= LOGIN ================= */
document.getElementById("login-form").addEventListener("submit", function(e){
  e.preventDefault();
  const s = getSettings();
  document.getElementById("login-view").classList.add("hidden");
  document.getElementById("app-shell").classList.remove("hidden");
  applyProfileChip();
  navigate("dashboard");
});
document.getElementById("forgot-link").addEventListener("click", function(e){
  e.preventDefault();
  showModal("Reset password","This is a prototype — password reset emails aren't actually sent. In a production build this would email a secure reset link.", [{label:"Got it",cls:"btn-primary",action:closeModal}]);
});
function doLogout(){
  document.getElementById("app-shell").classList.add("hidden");
  document.getElementById("login-view").classList.remove("hidden");
  document.getElementById("login-form").reset();
}
function applyProfileChip(){
  const s = getSettings();
  document.getElementById("profile-name-chip").textContent = s.name;
  document.getElementById("profile-role-chip").textContent = s.role;
  document.getElementById("profile-avatar").textContent = (s.name||"A").trim().charAt(0).toUpperCase();
  document.body.classList.toggle("dark", !!s.darkMode);
}

/* ================= MODAL ================= */
function showModal(title, body, buttons){
  const root = document.getElementById("modal-root");
  root.innerHTML = `<div class="modal-overlay" id="modal-overlay"><div class="modal-box">
    <h3>${title}</h3><p>${body}</p>
    <div class="modal-actions" id="modal-actions"></div>
  </div></div>`;
  const actions = document.getElementById("modal-actions");
  buttons.forEach(b=>{
    const btn = document.createElement("button");
    btn.className = "btn "+(b.cls||"btn-secondary");
    btn.textContent = b.label;
    btn.onclick = b.action;
    actions.appendChild(btn);
  });
  document.getElementById("modal-overlay").addEventListener("click", e=>{ if(e.target.id==="modal-overlay") closeModal(); });
}
function closeModal(){ document.getElementById("modal-root").innerHTML=""; }

/* ================= HELPERS ================= */
function fmtDate(d){ if(!d) return "—"; const dt=new Date(d); if(isNaN(dt)) return d; return dt.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
function badge(status){ return `<span class="badge ${STATUS_TO_BADGE[status]||''}">${status}</span>`; }
function destroyChart(key){ if(App.charts[key]){ App.charts[key].destroy(); delete App.charts[key]; } }
function nextAssetId(category){
  const prefixMap = {Laptop:"LT",Monitor:"MON",Tablet:"MOB",Printer:"PR",Desktop:"DT",Other:"AST"};
  const prefix = prefixMap[category]||"AST";
  const all = getAssets().filter(a=>a.id.startsWith(prefix));
  let max = 0;
  all.forEach(a=>{ const n = parseInt(a.id.replace(prefix,""))||0; if(n>max) max=n; });
  return prefix + String(max+1).padStart(3,"0");
}

/* ================= DASHBOARD ================= */
function renderDashboard(){
  const assets = getAssets();
  const s = getSettings();
  const counts = {Active:0,Repair:0,Reused:0,Recycled:0,Disposed:0};
  assets.forEach(a=> counts[a.status] = (counts[a.status]||0)+1 );
  const total = assets.length;

  const el = document.getElementById("page-content");
  el.innerHTML = `
    <div class="page-header">
      <h1>Good Morning, ${s.name} 👋</h1>
      <p>Here's your e-waste lifecycle overview.</p>
    </div>
    <div class="stat-grid">
      ${statCard("layers","Total Assets", total, "+8.5% this month", "#10B981", "#DCFCE7")}
      ${statCard("check-circle-2","Active Assets", counts.Active, "Currently in use", "#10B981", "#DCFCE7")}
      ${statCard("wrench","Under Repair", counts.Repair, "Needs attention", "#F59E0B", "#FEF3C7")}
      ${statCard("refresh-cw","Reused", counts.Reused, "Successfully reused", "#0F766E", "#CCFBF1")}
      ${statCard("recycle","Recycled", counts.Recycled, "Sent to recycler", "#7C3AED", "#EDE9FE")}
      ${statCard("trash-2","Disposed", counts.Disposed, "Final disposal", "#EF4444", "#FEE2E2")}
    </div>
    <div class="charts-grid">
      <div class="card card-pad chart-card"><h3>Asset Status Distribution</h3><div class="chart-wrap"><canvas id="chart-status"></canvas></div></div>
      <div class="card card-pad chart-card"><h3>Assets by Department</h3><div class="chart-wrap"><canvas id="chart-dept"></canvas></div></div>
      <div class="card card-pad chart-card"><h3>Monthly E-Waste Lifecycle Trend</h3><div class="chart-wrap"><canvas id="chart-trend"></canvas></div></div>
    </div>
    <div class="card card-pad">
      <h3 style="margin-bottom:14px;">Recently Updated Assets</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>Asset ID</th><th>Name</th><th>Department</th><th>Status</th></tr></thead>
        <tbody>${assets.slice(0,5).map(a=>`<tr style="cursor:pointer" onclick="navigate('asset-details','${a.id}')">
          <td class="mono-id">${a.id}</td><td>${a.name}</td><td>${a.department}</td><td>${badge(a.status)}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>
  `;
  icons();
  drawDashboardCharts(counts, assets);
}
function statCard(icon,label,val,delta,color,bg){
  return `<div class="stat-card">
    <div class="top"><div class="stat-icon" style="background:${bg};color:${color};"><i data-lucide="${icon}" style="width:18px;height:18px;"></i></div></div>
    <div class="val">${val}</div><div class="lbl">${label}</div>
    <span class="delta" style="color:${color};">${delta}</span>
  </div>`;
}
function drawDashboardCharts(counts, assets){
  destroyChart('status'); destroyChart('dept'); destroyChart('trend');
  App.charts.status = new Chart(document.getElementById('chart-status'), {
    type:'doughnut',
    data:{labels:Object.keys(counts), datasets:[{data:Object.values(counts), backgroundColor:Object.keys(counts).map(k=>STATUS_COLORS[k]), borderWidth:0}]},
    options:{plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11},color:'#64748B'}}},cutout:'62%',maintainAspectRatio:false}
  });
  const depts = ["IT","HR","Finance","Library","Administration"];
  const deptCounts = depts.map(d=> assets.filter(a=>a.department===d).length);
  App.charts.dept = new Chart(document.getElementById('chart-dept'), {
    type:'bar',
    data:{labels:depts, datasets:[{data:deptCounts, backgroundColor:'#10B981', borderRadius:6, maxBarThickness:34}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{precision:0,color:'#64748B'},grid:{color:'#F1F5F9'}},x:{ticks:{color:'#64748B'},grid:{display:false}}}, maintainAspectRatio:false}
  });
  const months = ["January","February","March","April","May","June"];
  const trend = [4,6,5,8,7,total_or(assets)];
  App.charts.trend = new Chart(document.getElementById('chart-trend'), {
    type:'line',
    data:{labels:months, datasets:[{data:trend, borderColor:'#0F766E', backgroundColor:'rgba(15,118,110,.1)', fill:true, tension:.35, pointBackgroundColor:'#0F766E'}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{precision:0,color:'#64748B'},grid:{color:'#F1F5F9'}},x:{ticks:{color:'#64748B'},grid:{display:false}}}, maintainAspectRatio:false}
  });
}
function total_or(assets){ return assets.length; }

/* ================= ASSET MANAGEMENT ================= */
let assetFilters = {q:"",dept:"",cat:"",status:""};
function renderAssets(){
  const el = document.getElementById("page-content");
  el.innerHTML = `
    <div class="page-header-row">
      <div class="page-header"><h1>Asset Management</h1><p>Manage and track all electronic assets.</p></div>
      <button class="btn btn-primary" onclick="navigate('add-asset')"><i data-lucide="plus"></i> Add New Asset</button>
    </div>
    <div class="toolbar">
      <div class="search"><i data-lucide="search" style="width:15px;height:15px;"></i><input id="asset-search" placeholder="Search by Asset ID or name"></div>
      <select id="filter-dept"><option value="">All Departments</option>${["IT","HR","Finance","Library","Administration"].map(d=>`<option>${d}</option>`).join('')}</select>
      <select id="filter-cat"><option value="">All Categories</option>${["Laptop","Monitor","Tablet","Printer","Desktop","Other"].map(d=>`<option>${d}</option>`).join('')}</select>
      <select id="filter-status"><option value="">All Status</option>${["Active","Repair","Reused","Recycled","Disposed"].map(d=>`<option>${d}</option>`).join('')}</select>
    </div>
    <div class="card"><div class="table-wrap">
      <table>
        <thead><tr><th>Asset ID</th><th>Name</th><th>Category</th><th>Department</th><th>Purchase Year</th><th>Condition</th><th>Status</th><th>QR</th><th>Actions</th></tr></thead>
        <tbody id="asset-tbody"></tbody>
      </table>
    </div></div>
  `;
  icons();
  document.getElementById("asset-search").addEventListener("input", e=>{assetFilters.q=e.target.value.toLowerCase(); renderAssetRows();});
  document.getElementById("filter-dept").addEventListener("change", e=>{assetFilters.dept=e.target.value; renderAssetRows();});
  document.getElementById("filter-cat").addEventListener("change", e=>{assetFilters.cat=e.target.value; renderAssetRows();});
  document.getElementById("filter-status").addEventListener("change", e=>{assetFilters.status=e.target.value; renderAssetRows();});
  renderAssetRows();
}
function renderAssetRows(){
  const tbody = document.getElementById("asset-tbody");
  if(!tbody) return;
  let assets = getAssets().filter(a=>{
    if(assetFilters.q && !(a.id.toLowerCase().includes(assetFilters.q) || a.name.toLowerCase().includes(assetFilters.q))) return false;
    if(assetFilters.dept && a.department!==assetFilters.dept) return false;
    if(assetFilters.cat && a.category!==assetFilters.cat) return false;
    if(assetFilters.status && a.status!==assetFilters.status) return false;
    return true;
  });
  if(assets.length===0){
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:30px;">No assets match your search or filters.</td></tr>`;
    return;
  }
  tbody.innerHTML = assets.map(a=>`
    <tr>
      <td class="mono-id">${a.id}</td>
      <td>${a.name}</td>
      <td>${a.category}</td>
      <td>${a.department}</td>
      <td>${a.purchaseYear}</td>
      <td>${a.condition}</td>
      <td>${badge(a.status)}</td>
      <td><button title="View QR" onclick="navigate('qr-page','${a.id}')" style="border:1px solid var(--border);background:#fff;border-radius:8px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:var(--muted);"><i data-lucide="qr-code" style="width:15px;height:15px;"></i></button></td>
      <td><div class="row-actions">
        <button title="View" onclick="navigate('asset-details','${a.id}')"><i data-lucide="eye" style="width:14px;height:14px;"></i></button>
        <button title="Edit" onclick="navigate('add-asset','${a.id}')"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
        <button title="Delete" onclick="confirmDeleteAsset('${a.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
      </div></td>
    </tr>`).join('');
  icons();
}
function confirmDeleteAsset(id){
  showModal("Delete asset", `Are you sure you want to delete <b>${id}</b>? This action can't be undone.`, [
    {label:"Cancel", cls:"btn-secondary", action:closeModal},
    {label:"Delete", cls:"btn-danger-outline", action:()=>{ 
        const a = getAssets().filter(x=>x.id!==id); saveAssets(a); closeModal(); renderAssets(); }}
  ]);
}

/* ================= ADD / EDIT ASSET ================= */
function renderAddAsset(editId){
  App.editingId = editId || null;
  const existing = editId ? getAsset(editId) : null;
  const el = document.getElementById("page-content");
  el.innerHTML = `
    <div class="page-header">
      <h1>${existing?"Edit Asset":"Register New Asset"}</h1>
      <p>${existing?"Update this electronic asset's information.":"Add a new electronic asset to the lifecycle tracker."}</p>
    </div>
    <div class="card card-pad">
      <form id="asset-form">
        <div class="section-title">Asset Information</div>
        <div class="form-grid">
          ${field("Asset ID","f-id","text",existing?.id||"", !existing ? "Auto-generated if left blank" : "", !!existing)}
          ${field("Asset Name","f-name","text",existing?.name||"","e.g. Dell Latitude 5420")}
          ${selectField("Category","f-category",["Laptop","Monitor","Tablet","Printer","Desktop","Other"],existing?.category)}
          ${field("Brand","f-brand","text",existing?.brand||"","e.g. Dell")}
          ${field("Model","f-model","text",existing?.model||"","e.g. Latitude 5420")}
          ${field("Serial Number","f-serial","text",existing?.serial||"","e.g. DL123456")}
        </div>
        <div class="section-title">Purchase Information</div>
        <div class="form-grid">
          ${field("Purchase Date","f-pdate","date",existing?.purchaseDate||"")}
          ${field("Purchase Year","f-pyear","number",existing?.purchaseYear||"","e.g. 2024")}
          ${field("Purchase Cost (₹)","f-pcost","number",existing?.purchaseCost||"","e.g. 55000")}
          ${field("Warranty Expiry","f-warranty","date",existing?.warrantyExpiry||"")}
        </div>
        <div class="section-title">Assignment</div>
        <div class="form-grid">
          ${selectField("Department","f-dept",["IT","HR","Finance","Library","Administration"],existing?.department)}
          ${field("Current Location","f-loc","text",existing?.location||"","e.g. Lab 2")}
          ${field("Current Owner","f-owner","text",existing?.owner||"","e.g. IT Department")}
        </div>
        <div class="section-title">Condition</div>
        <div class="form-grid">
          ${selectField("Current Condition","f-condition",["Excellent","Good","Fair","Poor"],existing?.condition)}
          ${selectField("Status","f-status",["Active","Repair","Reused","Recycled","Disposed"],existing?.status||"Active")}
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary"><i data-lucide="qr-code"></i> ${existing?"Save Changes":"Register Asset & Generate QR"}</button>
          <button type="button" class="btn btn-secondary" onclick="navigate('assets')">Cancel</button>
        </div>
      </form>
    </div>
    <div id="qr-preview-holder"></div>
  `;
  icons();
  document.getElementById("asset-form").addEventListener("submit", handleAssetSubmit);
}
function field(label,id,type,val,placeholder,disabled){
  return `<div class="field"><label>${label}</label><input type="${type}" id="${id}" value="${val}" placeholder="${placeholder||''}" ${disabled?'disabled style="background:#F1F5F9;"':''}></div>`;
}
function selectField(label,id,options,selected){
  return `<div class="field"><label>${label}</label><select id="${id}">${options.map(o=>`<option ${o===selected?'selected':''}>${o}</option>`).join('')}</select></div>`;
}
function handleAssetSubmit(e){
  e.preventDefault();
  const category = document.getElementById("f-category").value;
  let id = document.getElementById("f-id").value.trim();
  const isEdit = !!App.editingId;
  if(!isEdit && !id) id = nextAssetId(category);
  const assets = getAssets();
  if(!isEdit && assets.find(a=>a.id===id)){
    showModal("Duplicate Asset ID", `An asset with ID <b>${id}</b> already exists. Please use a different ID.`, [{label:"OK",cls:"btn-primary",action:closeModal}]);
    return;
  }
  const data = {
    id, name:document.getElementById("f-name").value.trim()||"Unnamed Asset",
    category, brand:document.getElementById("f-brand").value.trim(),
    model:document.getElementById("f-model").value.trim(), serial:document.getElementById("f-serial").value.trim(),
    purchaseDate:document.getElementById("f-pdate").value, purchaseYear:document.getElementById("f-pyear").value,
    purchaseCost:document.getElementById("f-pcost").value, warrantyExpiry:document.getElementById("f-warranty").value,
    department:document.getElementById("f-dept").value, location:document.getElementById("f-loc").value.trim(),
    owner:document.getElementById("f-owner").value.trim(), condition:document.getElementById("f-condition").value,
    status:document.getElementById("f-status").value
  };
  if(isEdit){
    const idx = assets.findIndex(a=>a.id===App.editingId);
    data.history = assets[idx].history; data.repairs = assets[idx].repairs;
    assets[idx] = data;
    saveAssets(assets);
    showModal("Asset updated", `<b>${id}</b> has been updated successfully.`, [{label:"View asset",cls:"btn-primary",action:()=>{closeModal(); navigate('asset-details',id);}}]);
  } else {
    data.history = [{stage:"Registered", date:new Date().toISOString().slice(0,10), remarks:"Initial registration"}];
    data.repairs = [];
    assets.push(data);
    saveAssets(assets);
    showQrPreview(data);
  }
}
function showQrPreview(asset){
  const holder = document.getElementById("qr-preview-holder");
  holder.innerHTML = `<div class="card card-pad qr-preview">
      <h3 style="margin-bottom:16px;">Asset Registered — QR Code Generated</h3>
      <div id="qr-canvas-holder"><canvas id="qr-canvas"></canvas></div>
      <div class="qr-meta">
        <div class="aid">${asset.id}</div>
        <div class="an">${asset.name} · ${asset.department}</div>
      </div>
      <div class="qr-buttons">
        <button class="btn btn-primary" onclick="navigate('qr-page','${asset.id}')"><i data-lucide="arrow-right"></i> Open QR Page</button>
        <button class="btn btn-secondary" onclick="navigate('assets')">Back to Assets</button>
      </div>
    </div>`;
  icons();
  QRCode.toCanvas(document.getElementById("qr-canvas"), assetQrPayload(asset), {width:180,margin:1,color:{dark:"#0F172A",light:"#FFFFFF"}});
  holder.scrollIntoView({behavior:"smooth",block:"center"});
}
function assetQrPayload(asset){ return `EWASTE-ASSET:${asset.id}`; }

/* ================= QR PAGE ================= */
function renderQRPage(id){
  const asset = getAsset(id);
  const el = document.getElementById("page-content");
  if(!asset){ el.innerHTML = emptyState("Asset not found","This asset may have been deleted."); return; }
  el.innerHTML = `
    <div class="page-header"><h1>Asset QR Code</h1></div>
    <div class="card card-pad qr-preview">
      <div id="qr-canvas-holder"><canvas id="qr-canvas"></canvas></div>
      <div class="qr-meta">
        <div class="aid">Asset ID: ${asset.id}</div>
        <div class="an">Asset Name: ${asset.name}</div>
        <div class="an">Department: ${asset.department}</div>
        <div style="margin-top:6px;">${badge(asset.status)}</div>
      </div>
      <div class="qr-buttons">
        <button class="btn btn-primary" id="qr-download"><i data-lucide="download"></i> Download QR</button>
        <button class="btn btn-secondary" id="qr-print"><i data-lucide="printer"></i> Print QR</button>
        <button class="btn btn-secondary" onclick="navigate('scanner')"><i data-lucide="scan-line"></i> Scan QR</button>
      </div>
      <div class="qr-hint">Scan this QR code to view the complete lifecycle and current status of this asset.</div>
    </div>
  `;
  icons();
  QRCode.toCanvas(document.getElementById("qr-canvas"), assetQrPayload(asset), {width:200,margin:1,color:{dark:"#0F172A",light:"#FFFFFF"}});
  document.getElementById("qr-download").addEventListener("click", ()=>{
    const canvas = document.getElementById("qr-canvas");
    const link = document.createElement("a");
    link.download = asset.id+"-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
  document.getElementById("qr-print").addEventListener("click", ()=> window.print());
}

/* ================= QR SCANNER ================= */
function renderScanner(){
  const el = document.getElementById("page-content");
  el.innerHTML = `
    <div class="page-header"><h1>Scan Asset QR Code</h1></div>
    <div class="card card-pad" style="text-align:center;max-width:520px;margin:0 auto;">
      <div class="scan-frame">
        <div class="corner c1"></div><div class="corner c2"></div><div class="corner c3"></div><div class="corner c4"></div>
        <i data-lucide="qr-code" style="width:64px;height:64px;color:#A7F3D0;"></i>
      </div>
      <p style="margin-top:16px;color:var(--muted);font-size:13px;">Place the asset QR code inside the frame.</p>
      <p style="margin-top:4px;color:var(--muted);font-size:11.5px;">(Camera scanning isn't wired up in this prototype — use manual entry below.)</p>
      <div style="margin:22px 0 6px;font-size:12.5px;color:var(--muted);font-weight:600;">Or enter Asset ID manually</div>
      <div style="display:flex;gap:10px;max-width:320px;margin:10px auto 0;">
        <input id="scan-input" placeholder="e.g. LT001" style="flex:1;border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;text-transform:uppercase;">
        <button class="btn btn-primary" id="scan-search-btn"><i data-lucide="search"></i> Search</button>
      </div>
      <div id="scan-result" style="margin-top:20px;text-align:left;"></div>
    </div>
  `;
  icons();
  const doSearch = ()=>{
    const id = document.getElementById("scan-input").value.trim().toUpperCase();
    const result = document.getElementById("scan-result");
    if(!id){ result.innerHTML = `<div class="alert alert-error"><i data-lucide="alert-circle" style="width:15px;height:15px;"></i> Enter an Asset ID to search.</div>`; icons(); return; }
    const asset = getAsset(id);
    if(!asset){
      result.innerHTML = `<div class="alert alert-error"><i data-lucide="alert-circle" style="width:15px;height:15px;"></i> No asset found with ID "${id}".</div>`;
    } else {
      result.innerHTML = `<div class="card card-pad" style="cursor:pointer;" onclick="navigate('asset-details','${asset.id}')">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div><div style="font-weight:700;color:var(--navy);">${asset.name}</div><div style="font-size:12px;color:var(--muted);">${asset.id} · ${asset.department}</div></div>
          ${badge(asset.status)}
        </div>
        <div style="margin-top:10px;font-size:12px;color:var(--secondary);font-weight:600;">View full lifecycle history →</div>
      </div>`;
    }
    icons();
  };
  document.getElementById("scan-search-btn").addEventListener("click", doSearch);
  document.getElementById("scan-input").addEventListener("keydown", e=>{ if(e.key==="Enter") doSearch(); });
}

/* ================= ASSET DETAILS ================= */
function renderAssetDetails(id){
  const asset = getAsset(id);
  const el = document.getElementById("page-content");
  if(!asset){ el.innerHTML = emptyState("Asset not found","This asset may have been deleted."); return; }
  el.innerHTML = `
    <div class="page-header-row">
      <div class="page-header"><h1>${asset.name}</h1><p>${asset.id} · ${asset.category}</p></div>
      <div style="display:flex;gap:10px;align-items:center;">
        ${badge(asset.status)}
        <button class="btn btn-secondary" onclick="navigate('qr-page','${asset.id}')"><i data-lucide="qr-code"></i> QR Code</button>
        <button class="btn btn-primary" onclick="navigate('add-asset','${asset.id}')"><i data-lucide="pencil"></i> Edit</button>
      </div>
    </div>
    <div class="detail-grid">
      <div>
        <div class="card card-pad">
          <h3 style="margin-bottom:16px;">Asset Information</h3>
          <div class="info-grid">
            ${infoItem("Asset ID",asset.id)} ${infoItem("Category",asset.category)}
            ${infoItem("Brand",asset.brand)} ${infoItem("Model",asset.model)}
            ${infoItem("Serial Number",asset.serial)} ${infoItem("Purchase Year",asset.purchaseYear)}
            ${infoItem("Department",asset.department)} ${infoItem("Location",asset.location)}
            ${infoItem("Owner",asset.owner)} ${infoItem("Condition",asset.condition)}
            ${infoItem("Purchase Cost","₹"+(asset.purchaseCost||"—"))} ${infoItem("Warranty Expiry",fmtDate(asset.warrantyExpiry))}
          </div>
        </div>
        <div class="card card-pad" style="margin-top:18px;">
          <h3 style="margin-bottom:16px;">Repair History</h3>
          ${asset.repairs && asset.repairs.length ? `<div class="table-wrap"><table>
            <thead><tr><th>Date</th><th>Issue</th><th>Technician</th><th>Cost</th><th>Status</th></tr></thead>
            <tbody>${asset.repairs.map(r=>`<tr><td>${fmtDate(r.date)}</td><td>${r.issue}</td><td>${r.technician}</td><td class="repair-cost">₹${r.cost}</td><td>${badge(r.status==='Completed'?'Active':'Repair')}</td></tr>`).join('')}</tbody>
          </table></div>` : `<p style="color:var(--muted);font-size:13px;">No repair records for this asset.</p>`}
        </div>
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:18px;">Lifecycle Timeline</h3>
        <div class="timeline">${renderTimeline(asset)}</div>
      </div>
    </div>
  `;
  icons();
}
function infoItem(k,v){ return `<div class="info-item"><div class="k">${k}</div><div class="v">${v||'—'}</div></div>`; }
function renderTimeline(asset){
  const done = asset.history||[];
  const doneStageNames = done.map(h=>h.stage);
  const remaining = STAGES.filter(s => !doneStageNames.some(d=> d.toLowerCase().includes(s.toLowerCase())));
  let html = done.map((h,i)=>{
    const isLast = i===done.length-1 && remaining.length>0;
    return `<div class="tl-item done">
      <div class="tl-dot-wrap"><div class="tl-dot ${isLast?'current':''}"></div>${(i<done.length-1||remaining.length>0)?'<div class="tl-line"></div>':''}</div>
      <div class="tl-content"><div class="t">${h.stage}</div><div class="d">${fmtDate(h.date)}${h.remarks?' · '+h.remarks:''}</div></div>
    </div>`;
  }).join('');
  html += remaining.map((s,i)=>`<div class="tl-item future">
      <div class="tl-dot-wrap"><div class="tl-dot future"></div>${i<remaining.length-1?'<div class="tl-line"></div>':''}</div>
      <div class="tl-content"><div class="t">${s}</div><div class="d">Not yet reached</div></div>
    </div>`).join('');
  return html;
}
function emptyState(title,sub){ return `<div class="card card-pad" style="text-align:center;padding:60px 20px;color:var(--muted);"><i data-lucide="search-x" style="width:40px;height:40px;margin:0 auto 12px;"></i><div style="font-weight:700;color:var(--navy);">${title}</div><div style="font-size:13px;margin-top:4px;">${sub}</div></div>`; }

/* ================= LIFECYCLE MANAGEMENT ================= */
function renderLifecycle(selectedId){
  const assets = getAssets();
  const sel = selectedId || (assets[0] && assets[0].id);
  const el = document.getElementById("page-content");
  el.innerHTML = `
    <div class="page-header"><h1>Lifecycle Management</h1><p>Update and progress an asset through its lifecycle stages.</p></div>
    <div class="card card-pad">
      <div class="field" style="max-width:320px;"><label>Select Asset</label>
        <select id="lc-select">${assets.map(a=>`<option value="${a.id}" ${a.id===sel?'selected':''}>${a.id} — ${a.name}</option>`).join('')}</select>
      </div>
      <div id="lc-body"></div>
    </div>
  `;
  icons();
  document.getElementById("lc-select").addEventListener("change", e=> renderLcBody(e.target.value));
  renderLcBody(sel);
}
function renderLcBody(id){
  const asset = getAsset(id);
  const body = document.getElementById("lc-body");
  if(!asset){ body.innerHTML=""; return; }
  const currentStageIndex = lastReachedStageIndex(asset);
  body.innerHTML = `
    <div style="margin:18px 0;">
      <div class="info-item" style="margin-bottom:14px;"><div class="k">Current Status</div><div class="v" style="margin-top:4px;">${badge(asset.status)}</div></div>
      <div class="stage-track">
        ${STAGES.map((s,i)=>{
          const state = i<currentStageIndex?"done":(i===currentStageIndex?"current":"");
          return `<div class="stage-step ${state}"><div class="circle">${i<currentStageIndex?'✓':(i+1)}</div><div class="lbl">${s}</div></div>${i<STAGES.length-1?`<div class="stage-connector ${i<currentStageIndex?'done':''}"></div>`:''}`;
        }).join('')}
      </div>
    </div>
    <div class="section-title">Update Lifecycle</div>
    <form id="lc-form" class="form-grid">
      <div class="field"><label>Asset ID</label><input type="text" value="${asset.id}" disabled style="background:#F1F5F9;"></div>
      <div class="field"><label>New Status</label><select id="lc-status">${STATUS_TO_BADGE ? Object.keys(STATUS_TO_BADGE).map(s=>`<option ${s===asset.status?'selected':''}>${s}</option>`).join('') : ''}</select></div>
      <div class="field"><label>Date</label><input type="date" id="lc-date" value="${new Date().toISOString().slice(0,10)}"></div>
      <div class="field" style="grid-column:1/-1;"><label>Remarks</label><input type="text" id="lc-remarks" placeholder="e.g. Sent for motherboard repair"></div>
      <div style="grid-column:1/-1;"><button type="submit" class="btn btn-primary"><i data-lucide="refresh-cw"></i> Update Lifecycle</button></div>
    </form>
  `;
  icons();
  document.getElementById("lc-form").addEventListener("submit", function(e){
    e.preventDefault();
    const assets = getAssets();
    const idx = assets.findIndex(a=>a.id===asset.id);
    const newStatus = document.getElementById("lc-status").value;
    const date = document.getElementById("lc-date").value || new Date().toISOString().slice(0,10);
    const remarks = document.getElementById("lc-remarks").value.trim();
    const stageLabel = statusToStageLabel(newStatus);
    assets[idx].status = newStatus;
    assets[idx].history.push({stage:stageLabel, date, remarks: remarks || `Status updated to ${newStatus}`});
    saveAssets(assets);
    renderLcBody(asset.id);
    showModal("Lifecycle updated", `${asset.id} has been moved to <b>${newStatus}</b>.`, [{label:"OK",cls:"btn-primary",action:closeModal}]);
  });
}
function statusToStageLabel(status){
  const map = {Active:"Assigned",Repair:"Under Repair",Reused:"Reused",Recycled:"Recycled",Disposed:"Disposed"};
  return map[status] || status;
}
function lastReachedStageIndex(asset){
  let idx = 0;
  (asset.history||[]).forEach(h=>{
    STAGES.forEach((s,i)=>{ if(h.stage.toLowerCase().includes(s.toLowerCase()) && i>idx) idx=i; });
  });
  return idx;
}

/* ================= REPORTS ================= */
function renderReports(){
  const assets = getAssets();
  const total = assets.length;
  const counts = {Active:0,Repair:0,Reused:0,Recycled:0,Disposed:0};
  assets.forEach(a=> counts[a.status] = (counts[a.status]||0)+1 );
  const pct = n => total? Math.round((n/total)*100) : 0;
  const el = document.getElementById("page-content");
  el.innerHTML = `
    <div class="page-header-row">
      <div class="page-header"><h1>Reports & Analytics</h1><p>Insights across your electronic asset lifecycle.</p></div>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-secondary" id="export-btn"><i data-lucide="download"></i> Export Report</button>
        <button class="btn btn-secondary" id="print-btn"><i data-lucide="printer"></i> Print Report</button>
      </div>
    </div>
    <div class="stat-grid" style="grid-template-columns:repeat(5,1fr);">
      ${statCard("layers","Total Assets", total, "All registered assets", "#10B981", "#DCFCE7")}
      ${statCard("wrench","Repair Rate", pct(counts.Repair)+"%", "of total assets", "#F59E0B", "#FEF3C7")}
      ${statCard("refresh-cw","Reuse Rate", pct(counts.Reused)+"%", "of total assets", "#0F766E", "#CCFBF1")}
      ${statCard("recycle","Recycling Rate", pct(counts.Recycled)+"%", "of total assets", "#7C3AED", "#EDE9FE")}
      ${statCard("trash-2","Disposed Assets", counts.Disposed, "final disposal", "#EF4444", "#FEE2E2")}
    </div>
    <div class="charts-grid">
      <div class="card card-pad chart-card"><h3>Asset Status Distribution</h3><div class="chart-wrap"><canvas id="r-chart-status"></canvas></div></div>
      <div class="card card-pad chart-card"><h3>Assets by Department</h3><div class="chart-wrap"><canvas id="r-chart-dept"></canvas></div></div>
      <div class="card card-pad chart-card"><h3>Monthly Recycling Trend</h3><div class="chart-wrap"><canvas id="r-chart-recycle"></canvas></div></div>
    </div>
    <div class="card card-pad chart-card" style="max-width:100%;"><h3>Repair Cost by Asset</h3><div class="chart-wrap"><canvas id="r-chart-cost"></canvas></div></div>
  `;
  icons();
  destroyChart('r-status'); destroyChart('r-dept'); destroyChart('r-recycle'); destroyChart('r-cost');
  App.charts['r-status'] = new Chart(document.getElementById('r-chart-status'), {
    type:'doughnut', data:{labels:Object.keys(counts), datasets:[{data:Object.values(counts), backgroundColor:Object.keys(counts).map(k=>STATUS_COLORS[k]), borderWidth:0}]},
    options:{plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11},color:'#64748B'}}},cutout:'62%',maintainAspectRatio:false}
  });
  const depts = ["IT","HR","Finance","Library","Administration"];
  App.charts['r-dept'] = new Chart(document.getElementById('r-chart-dept'), {
    type:'bar', data:{labels:depts, datasets:[{data:depts.map(d=>assets.filter(a=>a.department===d).length), backgroundColor:'#10B981', borderRadius:6, maxBarThickness:34}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{precision:0,color:'#64748B'},grid:{color:'#F1F5F9'}},x:{ticks:{color:'#64748B'},grid:{display:false}}}, maintainAspectRatio:false}
  });
  App.charts['r-recycle'] = new Chart(document.getElementById('r-chart-recycle'), {
    type:'line', data:{labels:["Jan","Feb","Mar","Apr","May","Jun"], datasets:[{data:[1,0,2,1,3,counts.Recycled], borderColor:'#7C3AED', backgroundColor:'rgba(124,58,237,.1)', fill:true, tension:.35, pointBackgroundColor:'#7C3AED'}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{precision:0,color:'#64748B'},grid:{color:'#F1F5F9'}},x:{ticks:{color:'#64748B'},grid:{display:false}}}, maintainAspectRatio:false}
  });
  const repaired = assets.filter(a=> a.repairs && a.repairs.length);
  App.charts['r-cost'] = new Chart(document.getElementById('r-chart-cost'), {
    type:'bar', data:{labels:repaired.map(a=>a.id), datasets:[{data:repaired.map(a=> a.repairs.reduce((s,r)=>s+(parseFloat(r.cost)||0),0)), backgroundColor:'#F59E0B', borderRadius:6, maxBarThickness:40}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{color:'#64748B'},grid:{color:'#F1F5F9'}},x:{ticks:{color:'#64748B'},grid:{display:false}}}, maintainAspectRatio:false}
  });
  document.getElementById("print-btn").addEventListener("click", ()=> window.print());
  document.getElementById("export-btn").addEventListener("click", exportCsv);
}
function exportCsv(){
  const assets = getAssets();
  const headers = ["Asset ID","Name","Category","Brand","Department","Purchase Year","Condition","Status"];
  const rows = assets.map(a=>[a.id,a.name,a.category,a.brand,a.department,a.purchaseYear,a.condition,a.status]);
  let csv = headers.join(",")+"\n"+rows.map(r=>r.map(v=>`"${(v||'').toString().replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ewaste-asset-report.csv";
  link.click();
}

/* ================= SETTINGS ================= */
function renderSettings(){
  const s = getSettings();
  const el = document.getElementById("page-content");
  el.innerHTML = `
    <div class="page-header"><h1>Settings</h1><p>Manage your profile, application preferences and security.</p></div>
    <div class="card card-pad" style="margin-bottom:18px;">
      <h3 style="margin-bottom:16px;">Profile</h3>
      <form id="profile-form" class="form-grid">
        <div class="field"><label>Name</label><input type="text" id="s-name" value="${s.name}"></div>
        <div class="field"><label>Email</label><input type="email" id="s-email" value="${s.email}"></div>
        <div class="field"><label>Role</label><input type="text" id="s-role" value="${s.role}"></div>
        <div style="grid-column:1/-1;"><button class="btn btn-primary" type="submit"><i data-lucide="save"></i> Save Profile</button></div>
      </form>
    </div>
    <div class="card card-pad" style="margin-bottom:18px;">
      <h3 style="margin-bottom:6px;">Application Settings</h3>
      <div class="settings-toggle">
        <div><div class="t">Notifications</div><div class="s">Receive alerts for repairs and lifecycle updates.</div></div>
        <div class="switch ${s.notifications?'on':''}" id="toggle-notif"><div class="knob"></div></div>
      </div>
      <div class="settings-toggle">
        <div><div class="t">Dark Mode</div><div class="s">Switch to a darker color scheme.</div></div>
        <div class="switch ${s.darkMode?'on':''}" id="toggle-dark"><div class="knob"></div></div>
      </div>
      <div class="settings-toggle">
        <div><div class="t">Language</div><div class="s">Interface display language.</div></div>
        <select id="s-lang" style="border:1px solid var(--border);border-radius:8px;padding:8px 10px;"><option ${s.language==='English'?'selected':''}>English</option><option ${s.language==='Hindi'?'selected':''}>Hindi</option></select>
      </div>
    </div>
    <div class="card card-pad">
      <h3 style="margin-bottom:6px;">Security</h3>
      <div class="settings-toggle">
        <div><div class="t">Change Password</div><div class="s">Update your account password.</div></div>
        <button class="btn btn-secondary" id="change-pw-btn">Change Password</button>
      </div>
      <div class="settings-toggle">
        <div><div class="t">Logout</div><div class="s">Sign out of this session.</div></div>
        <button class="btn btn-danger-outline" id="settings-logout-btn">Logout</button>
      </div>
    </div>
  `;
  icons();
  document.getElementById("profile-form").addEventListener("submit", function(e){
    e.preventDefault();
    const s2 = getSettings();
    s2.name = document.getElementById("s-name").value.trim()||"Admin";
    s2.email = document.getElementById("s-email").value.trim();
    s2.role = document.getElementById("s-role").value.trim()||"Administrator";
    saveSettings(s2); applyProfileChip();
    showModal("Profile saved","Your profile changes have been saved.", [{label:"OK",cls:"btn-primary",action:closeModal}]);
  });
  document.getElementById("toggle-notif").addEventListener("click", function(){ const s2=getSettings(); s2.notifications=!s2.notifications; saveSettings(s2); this.classList.toggle("on"); });
  document.getElementById("toggle-dark").addEventListener("click", function(){ const s2=getSettings(); s2.darkMode=!s2.darkMode; saveSettings(s2); this.classList.toggle("on"); document.body.classList.toggle("dark", s2.darkMode); });
  document.getElementById("s-lang").addEventListener("change", function(){ const s2=getSettings(); s2.language=this.value; saveSettings(s2); });
  document.getElementById("change-pw-btn").addEventListener("click", ()=> showModal("Change password","This is a prototype — wire this up to a real auth backend to enable password changes.", [{label:"Got it",cls:"btn-primary",action:closeModal}]));
  document.getElementById("settings-logout-btn").addEventListener("click", doLogout);
}

/* ================= INIT ================= */
icons();