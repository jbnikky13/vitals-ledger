(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))n(l);new MutationObserver(l=>{for(const i of l)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&n(u)}).observe(document,{childList:!0,subtree:!0});function t(l){const i={};return l.integrity&&(i.integrity=l.integrity),l.referrerPolicy&&(i.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?i.credentials="include":l.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(l){if(l.ep)return;l.ep=!0;const i=t(l);fetch(l.href,i)}})();const S="vitals-ledger:v1",g=()=>({profile:{name:"",dob:"",bloodType:"",height:""},vitals:[],workouts:[],medical:{allergies:[],medications:[],conditions:[],surgeries:[],family:[]}});function x(){try{const a=localStorage.getItem(S);if(!a)return g();const e=JSON.parse(a),t=g();return{profile:{...t.profile,...e.profile||{}},vitals:e.vitals||[],workouts:e.workouts||[],medical:{...t.medical,...e.medical||{}}}}catch(a){return console.error("Could not read local data, starting fresh.",a),g()}}let s=x();function c(){localStorage.setItem(S,JSON.stringify(s))}function h(){return Math.random().toString(36).slice(2,10)+Date.now().toString(36)}const o={get state(){return s},updateProfile(a){s.profile={...s.profile,...a},c()},addVital(a){s.vitals.push({id:h(),...a}),s.vitals.sort((e,t)=>e.date.localeCompare(t.date)),c()},deleteVital(a){s.vitals=s.vitals.filter(e=>e.id!==a),c()},addWorkout(a){s.workouts.push({id:h(),...a}),s.workouts.sort((e,t)=>t.date.localeCompare(e.date)),c()},deleteWorkout(a){s.workouts=s.workouts.filter(e=>e.id!==a),c()},addMedical(a,e){s.medical[a].push({id:h(),...e}),c()},deleteMedical(a,e){s.medical[a]=s.medical[a].filter(t=>t.id!==e),c()},exportJSON(){return JSON.stringify(s,null,2)},importJSON(a){const e=JSON.parse(a);s={...g(),...e},c()},wipeAll(){s=g(),c()}},M=document.getElementById("app");let m="vitals",p="allergies";const E=[{key:"allergies",label:"Allergies"},{key:"medications",label:"Medications"},{key:"conditions",label:"Conditions"},{key:"surgeries",label:"Surgeries"},{key:"family",label:"Family history"}];function b(a){return a?new Date(a+"T00:00:00").toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):""}function L(a){return a.length?a[a.length-1]:null}function d(){const a=o.state,e=L(a.vitals);M.innerHTML=`
    <header class="hero">
      <p class="title">Vitals Ledger</p>
      <p class="subtitle">Your record. Your device. Nothing leaves it.</p>
      <div class="vitals-strip">
        ${f("Weight",e==null?void 0:e.weight,"kg")}
        ${f("Resting HR",e==null?void 0:e.restingHR,"bpm")}
        ${f("VO2 max",e==null?void 0:e.vo2max,"")}
        ${f("Height",a.profile.height,"cm")}
      </div>
    </header>

    <nav class="tabs">
      ${y("vitals","Vitals")}
      ${y("workouts","Workouts")}
      ${y("medical","Medical")}
      ${y("export","Summary")}
    </nav>

    <main id="tab-content"></main>

    <footer class="privacy-note">Stored only in this browser. No account, no server, no sync.</footer>
  `,document.querySelectorAll("nav.tabs button").forEach(n=>{n.addEventListener("click",()=>{m=n.dataset.tab,d()})});const t=document.getElementById("tab-content");m==="vitals"&&(t.innerHTML="",O(t)),m==="workouts"&&D(t),m==="medical"&&N(t),m==="export"&&H(t)}function f(a,e,t){return`<div class="stat">
    <span class="value">${e??"—"}${e?`<span class="unit">${t}</span>`:""}</span>
    <span class="label">${a}</span>
  </div>`}function y(a,e){return`<button data-tab="${a}" class="${m===a?"active":""}">${e}</button>`}function O(a){const e=o.state;a.innerHTML=`
    <div class="section-title">
      <div><span class="eyebrow">Log an entry</span>New reading</div>
    </div>
    <div class="card">
      <form class="entry-form" id="vital-form">
        <label class="full">Date
          <input type="date" name="date" value="${new Date().toISOString().slice(0,10)}" required />
        </label>
        <label>Weight (kg)<input type="number" step="0.1" name="weight" placeholder="e.g. 71.5" /></label>
        <label>Resting HR (bpm)<input type="number" name="restingHR" placeholder="e.g. 54" /></label>
        <label>VO2 max<input type="number" step="0.1" name="vo2max" placeholder="e.g. 48.2" /></label>
        <label>Height (cm)<input type="number" step="0.1" name="height" placeholder="one-off, optional" /></label>
        <label class="full">Notes<textarea name="notes" placeholder="Optional"></textarea></label>
        <div class="btn-row"><button type="submit" class="btn btn-primary">Save entry</button></div>
      </form>
    </div>

    <div class="section-title"><div><span class="eyebrow">History</span>Past readings</div></div>
    <div class="card" id="vital-list">
      ${e.vitals.length===0?$("No vitals logged yet."):[...e.vitals].reverse().map(t=>`
        <div class="entry-row">
          <div class="main">
            <div class="label">${b(t.date)}</div>
            <div class="meta">
              ${t.weight?`Weight <span class="num">${t.weight} kg</span> · `:""}
              ${t.restingHR?`HR <span class="num">${t.restingHR} bpm</span> · `:""}
              ${t.vo2max?`VO2 <span class="num">${t.vo2max}</span>`:""}
            </div>
            ${t.notes?`<div class="meta">${r(t.notes)}</div>`:""}
          </div>
          <button class="del" data-id="${t.id}">Delete</button>
        </div>
      `).join("")}
    </div>
  `,document.getElementById("vital-form").addEventListener("submit",t=>{t.preventDefault();const n=new FormData(t.target);n.get("height")&&o.updateProfile({height:n.get("height")}),o.addVital({date:n.get("date"),weight:n.get("weight")?Number(n.get("weight")):null,restingHR:n.get("restingHR")?Number(n.get("restingHR")):null,vo2max:n.get("vo2max")?Number(n.get("vo2max")):null,notes:n.get("notes")||""}),d()}),document.getElementById("vital-list").querySelectorAll(".del").forEach(t=>{t.addEventListener("click",()=>{o.deleteVital(t.dataset.id),d()})})}function D(a){const e=o.state;a.innerHTML=`
    <div class="section-title"><div><span class="eyebrow">Log a session</span>New workout</div></div>
    <div class="card">
      <form class="entry-form" id="workout-form">
        <label class="full">Date<input type="date" name="date" value="${new Date().toISOString().slice(0,10)}" required /></label>
        <label>Type
          <select name="type">
            <option>Run</option><option>Ride</option><option>Swim</option>
            <option>Strength</option><option>Walk</option><option>Other</option>
          </select>
        </label>
        <label>Distance (km)<input type="number" step="0.01" name="distanceKm" placeholder="optional" /></label>
        <label class="full">Duration (minutes)<input type="number" step="0.1" name="durationMin" placeholder="e.g. 42.5" required /></label>
        <label class="full">Notes<textarea name="notes" placeholder="Optional — how it felt, route, weight lifted, etc."></textarea></label>
        <div class="btn-row"><button type="submit" class="btn btn-primary">Save workout</button></div>
      </form>
    </div>

    <div class="section-title"><div><span class="eyebrow">History</span>Past sessions</div></div>
    <div class="card" id="workout-list">
      ${e.workouts.length===0?$("No workouts logged yet."):e.workouts.map(t=>{const n=t.distanceKm&&t.durationMin?t.durationMin/t.distanceKm:null;return`
        <div class="entry-row">
          <div class="main">
            <div class="label">${t.type} · ${b(t.date)}</div>
            <div class="meta">
              ${t.distanceKm?`<span class="num">${t.distanceKm} km</span> · `:""}
              <span class="num">${t.durationMin} min</span>
              ${n?` · <span class="num">${n.toFixed(2)} min/km</span>`:""}
            </div>
            ${t.notes?`<div class="meta">${r(t.notes)}</div>`:""}
          </div>
          <button class="del" data-id="${t.id}">Delete</button>
        </div>`}).join("")}
    </div>
  `,document.getElementById("workout-form").addEventListener("submit",t=>{t.preventDefault();const n=new FormData(t.target);o.addWorkout({date:n.get("date"),type:n.get("type"),distanceKm:n.get("distanceKm")?Number(n.get("distanceKm")):null,durationMin:Number(n.get("durationMin")),notes:n.get("notes")||""}),d()}),document.getElementById("workout-list").querySelectorAll(".del").forEach(t=>{t.addEventListener("click",()=>{o.deleteWorkout(t.dataset.id),d()})})}function N(a){const e=o.state,n={allergies:[["label","Allergy","e.g. Penicillin"],["severity","Severity","e.g. Severe / Mild"]],medications:[["label","Medication","e.g. Metformin"],["dose","Dose","e.g. 500mg"],["frequency","Frequency","e.g. Twice daily"]],conditions:[["label","Condition","e.g. Asthma"],["since","Since","e.g. 2014"]],surgeries:[["label","Procedure","e.g. Appendectomy"],["date","Date","YYYY or YYYY-MM"]],family:[["label","Condition","e.g. Type 2 diabetes"],["relation","Relation","e.g. Mother"]]}[p],l=e.medical[p];a.innerHTML=`
    <div class="section-title"><div><span class="eyebrow">Categories</span>Medical history</div></div>
    <div class="med-grid">
      ${E.map(i=>`
        <button class="med-cat-btn ${p===i.key?"active":""}" data-cat="${i.key}">
          ${i.label}<span class="count">${e.medical[i.key].length} entries</span>
        </button>`).join("")}
    </div>

    <div class="card">
      <form class="entry-form" id="med-form">
        ${n.map(([i,u,v])=>`
          <label>${u}<input type="text" name="${i}" placeholder="${v}" ${i==="label"?"required":""} /></label>
        `).join("")}
        <label class="full">Notes<textarea name="notes" placeholder="Optional"></textarea></label>
        <div class="btn-row"><button type="submit" class="btn btn-primary">Add</button></div>
      </form>
    </div>

    <div class="card" id="med-list">
      ${l.length===0?$("Nothing recorded here yet."):l.map(i=>`
        <div class="entry-row">
          <div class="main">
            <div class="label">${r(i.label)} ${i.severity?`<span class="pill alert">${r(i.severity)}</span>`:""}</div>
            <div class="meta">${[i.dose,i.frequency,i.since,i.date,i.relation].filter(Boolean).map(r).join(" · ")}</div>
            ${i.notes?`<div class="meta">${r(i.notes)}</div>`:""}
          </div>
          <button class="del" data-id="${i.id}">Delete</button>
        </div>
      `).join("")}
    </div>
  `,document.querySelectorAll(".med-cat-btn").forEach(i=>{i.addEventListener("click",()=>{p=i.dataset.cat,d()})}),document.getElementById("med-form").addEventListener("submit",i=>{i.preventDefault();const u=new FormData(i.target),v={};n.forEach(([w])=>v[w]=u.get(w)||""),v.notes=u.get("notes")||"",o.addMedical(p,v),d()}),document.getElementById("med-list").querySelectorAll(".del").forEach(i=>{i.addEventListener("click",()=>{o.deleteMedical(p,i.dataset.id),d()})})}function H(a){const e=o.state,t=L(e.vitals);a.innerHTML=`
    <div class="section-title"><div><span class="eyebrow">For a visit</span>Doctor summary</div></div>
    <div class="summary-sheet" id="summary-sheet">
      <h2>${e.profile.name||"Health summary"}</h2>
      <div class="meta-line">
        ${e.profile.dob?`DOB ${b(e.profile.dob)} · `:""}
        ${e.profile.bloodType?`Blood type ${r(e.profile.bloodType)} · `:""}
        Generated ${b(new Date().toISOString().slice(0,10))}
      </div>

      <h3>Latest vitals</h3>
      ${t?`<ul>
        <li>Weight: ${t.weight??"—"} kg (${b(t.date)})</li>
        <li>Resting HR: ${t.restingHR??"—"} bpm</li>
        <li>VO2 max: ${t.vo2max??"—"}</li>
        <li>Height: ${e.profile.height||"—"} cm</li>
      </ul>`:'<p class="meta-line">No vitals logged.</p>'}

      ${E.map(n=>`
        <h3>${n.label}</h3>
        ${e.medical[n.key].length?`<ul>${e.medical[n.key].map(l=>`<li>${r(l.label)}${l.severity?` — ${r(l.severity)}`:""}${l.dose?` — ${r(l.dose)} ${r(l.frequency||"")}`:""}${l.since?` — since ${r(l.since)}`:""}${l.date?` — ${r(l.date)}`:""}${l.relation?` — ${r(l.relation)}`:""}</li>`).join("")}</ul>`:'<p class="meta-line">None recorded.</p>'}
      `).join("")}

      <h3>Recent workouts</h3>
      ${e.workouts.length?`<ul>${e.workouts.slice(0,5).map(n=>`<li>${b(n.date)} — ${n.type}, ${n.durationMin} min${n.distanceKm?`, ${n.distanceKm} km`:""}</li>`).join("")}</ul>`:'<p class="meta-line">None recorded.</p>'}
    </div>

    <div class="export-actions">
      <button class="btn btn-primary" id="print-btn">Print / Save as PDF</button>
      <button class="btn btn-ghost" id="export-json">Export JSON backup</button>
      <label class="btn btn-ghost" style="display:inline-block;">Import backup
        <input type="file" id="import-json" accept="application/json" style="display:none" />
      </label>
      <button class="btn btn-alert" id="wipe-btn">Erase all data</button>
    </div>

    <div class="section-title"><div><span class="eyebrow">Profile</span>Used on the summary sheet</div></div>
    <div class="card">
      <form class="entry-form" id="profile-form">
        <label>Full name<input type="text" name="name" value="${k(e.profile.name)}" /></label>
        <label>Date of birth<input type="date" name="dob" value="${e.profile.dob||""}" /></label>
        <label>Blood type<input type="text" name="bloodType" value="${k(e.profile.bloodType)}" placeholder="e.g. O+" /></label>
        <div class="btn-row"><button type="submit" class="btn btn-primary">Save profile</button></div>
      </form>
    </div>
  `,document.getElementById("print-btn").addEventListener("click",()=>window.print()),document.getElementById("export-json").addEventListener("click",()=>{const n=new Blob([o.exportJSON()],{type:"application/json"}),l=URL.createObjectURL(n),i=document.createElement("a");i.href=l,i.download=`vitals-ledger-backup-${new Date().toISOString().slice(0,10)}.json`,i.click(),URL.revokeObjectURL(l)}),document.getElementById("import-json").addEventListener("change",n=>{const l=n.target.files[0];if(!l)return;const i=new FileReader;i.onload=()=>{try{o.importJSON(i.result),d()}catch{alert("That file could not be read as a backup.")}},i.readAsText(l)}),document.getElementById("wipe-btn").addEventListener("click",()=>{confirm("This deletes everything stored on this device. This cannot be undone. Continue?")&&(o.wipeAll(),d())}),document.getElementById("profile-form").addEventListener("submit",n=>{n.preventDefault();const l=new FormData(n.target);o.updateProfile({name:l.get("name"),dob:l.get("dob"),bloodType:l.get("bloodType")}),d()})}function $(a){return`<div class="empty-state">${a}</div>`}function r(a){return String(a).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function k(a){return r(a||"")}d();
