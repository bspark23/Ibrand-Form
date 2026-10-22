// Paste the URL from your deployed Google Apps Script Web App here (it ends in /exec).
const SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwwJavLhdySK83JJIOLZjt9HnYt6x8aKxV_ZTR-pzUKVJZapfFLqunZ9SevlOPZCJob/exec";

const L={
goals:[["Increase sales","Increase brand awareness","Attract new customers","Improve customer retention","Expand to new markets"],["Launch a new product/service","Improve online presence","*Other:"]],
activities:[["Social Media","Facebook/Instagram Ads","Google Ads","Influencer Marketing","Email Marketing","Events/Activations"],["Content Marketing","Traditional Advertising","None","*Other:"],[]],
handlers:[["Internal team","Freelancer","Agency","Business owner/management","Email Marketing","No one currently"]],
help:[["Brand Strategy & Identity","Social Media Management","Content Creation","Video Production & Editing","Digital Marketing","Paid Advertising","Website Development","UI/UX Design"],["Website Redesign","Marketing Strategy","Campaign Management","Graphic Design","Business Technology Solutions","BUUKUS FrontDesk / PMS","*Other:"]],
outcome:[["More customers","More enquiries","More sales","Better brand perception","Stronger online presence","Better customer experience","Better business operations","*Other:"]],
timing:[["Immediately","Within 1 month","Within 3 months","Within 6 months","Just exploring options"]],
invested:[["Yes","No"]],
budget:[["₦100k–₦250k","₦250k–₦500k"],["₦500k–₦1m","₦1m+"],["Not yet determined"]],
status:[["New Prospect","Contacted","Qualified","Meeting Scheduled","Proposal Required"],["Negotiation","Won","Lost","Follow-up"]]};
const H={BRANDING:["No clear brand identity","Outdated logo/visual identity","Inconsistent branding","Brand doesn't reflect the quality of the business","Unclear brand positioning","Need rebranding"],
CONTENT:["We struggle to create content","We don't have enough visual content","Need professional photography","Need video content","Need Reels/TikTok content","Need promotional content"],
"WEBSITE / DIGITAL":["No website","Outdated website","Poor website design","Poor user experience","Website isn't mobile-friendly","Website isn't generating enquiries","Need a landing page","Need website maintenance"],
"SOCIAL MEDIA":["Inconsistent posting","Low engagement","Poor-quality content","Low follower growth","No clear content strategy","Social media isn't generating enquiries","Pages need better management"],
MARKETING:["Low brand awareness","Not generating enough leads","Low sales","Ads aren't performing","No clear marketing strategy","Difficulty reaching target customers","Need campaign support"]};
const LIST_NAMES={goals:"businessGoals",activities:"currentActivities",handlers:"marketingHandlers",help:"supportNeeds",outcome:"desiredOutcome",timing:"timeframe",invested:"previousInvestment",budget:"budget",status:"leadStatus"};
const HEALTH_NAMES={"BRANDING":"brandingChallenges","CONTENT":"contentChallenges","WEBSITE / DIGITAL":"websiteChallenges","SOCIAL MEDIA":"socialChallenges","MARKETING":"marketingChallenges"};

const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;");
const escAttr=s=>String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
const ck=(t,name)=>{const other=t[0]=="*";return `<label class="ck"><input type="checkbox" name="${escAttr(name)}" value="${escAttr(other?"Other":t)}">${other?t.slice(1):esc(t)}${other?`<span class="o"><input type="text" name="${escAttr(name)}Other" style="width:100%" aria-label="Other"></span>`:""}</label>`;};

document.querySelectorAll("[data-list]").forEach(el=>{const cols=L[el.dataset.list];const name=LIST_NAMES[el.dataset.list]||el.dataset.list;
 if(cols.length==1)el.innerHTML=cols[0].map(t=>ck(t,name)).join("");else el.innerHTML=cols.map(c=>`<div>${c.map(t=>ck(t,name)).join("")}</div>`).join("")});

const card=(k)=>`<div class="card ${k=="WEBSITE / DIGITAL"?"h2":"h1"}"><h3>${k}</h3>${H[k].map(t=>ck(t,HEALTH_NAMES[k])).join("")}</div>`;
document.getElementById("health").innerHTML=`<div>${["BRANDING","CONTENT","WEBSITE / DIGITAL"].map(card).join("")}</div><div>${["SOCIAL MEDIA","MARKETING"].map(card).join("")}</div>`;

const FIELDS=[
{label:"Business Name",name:"businessName"},
{label:"Industry",name:"industry"},
{label:"Contact Person",name:"contactPerson"},
{label:"Position/Role",name:"position"},
{label:"Phone",name:"phone"},
{label:"Email",name:"email"},
{label:"Location",name:"location"},
{label:"Website",name:"website"},
{label:"Social Media Handles",name:"socialHandles"},
{label:"Years in Business",name:"yearsInBusiness"},
{label:"Main Products/Services",name:"productsServices"},
{label:"Primary Target Customer",name:"targetCustomer"},
{label:"Competitive Differentiators",name:"differentiators"},
{label:"Business Goals",name:"businessGoals",group:true},
{label:"Business Goals Other",name:"businessGoalsOther"},
{label:"Branding Challenges",name:"brandingChallenges",group:true},
{label:"Content Challenges",name:"contentChallenges",group:true},
{label:"Website/Digital Challenges",name:"websiteChallenges",group:true},
{label:"Social Media Challenges",name:"socialChallenges",group:true},
{label:"Marketing Challenges",name:"marketingChallenges",group:true},
{label:"Other Challenges",lines:["otherChallengesLine1","otherChallengesLine2","otherChallengesLine3"]},
{label:"Current Marketing Activities",name:"currentActivities",group:true},
{label:"Current Activities Other",name:"currentActivitiesOther"},
{label:"Marketing Handled By",name:"marketingHandlers",group:true},
{label:"Support Needed",name:"supportNeeds",group:true},
{label:"Support Needed Other",name:"supportNeedsOther"},
{label:"Biggest Challenge",lines:["biggestChallengeLine1","biggestChallengeLine2","biggestChallengeLine3"]},
{label:"Desired Outcome",name:"desiredOutcome",group:true},
{label:"Desired Outcome Other",name:"desiredOutcomeOther"},
{label:"Timeframe",name:"timeframe",group:true},
{label:"Previously Invested",name:"previousInvestment",group:true},
{label:"Estimated Budget",name:"budget",group:true},
{label:"Decision Makers",name:"decisionMakers"},
{label:"Availability",lines:["availabilityLine1","availabilityLine2"]},
{label:"Primary Need",name:"primaryNeed"},
{label:"Secondary Need",name:"secondaryNeed"},
{label:"Recommended Service",name:"recommendedService"},
{label:"Potential Upsell",name:"potentialUpsell"},
{label:"Estimated Deal Value (NGN)",name:"estimatedDealValue"},
{label:"Lead Status",name:"leadStatus",group:true},
{label:"Next Action",name:"nextAction"},
{label:"Follow-up Date",name:"followUpDate"},
{label:"Assigned BD",name:"assignedBD"}];

const form=document.getElementById("prospect-form");
const statusEl=document.getElementById("form-status");
const submitBtn=form.querySelector('button[type="submit"]');
const resetBtn=form.querySelector('button[type="reset"]');
let submitting=false;

const prettyName=name=>name.replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/^./,c=>c.toUpperCase());

function collectPayload(){
 const fd=new FormData(form);
 const payload={};
 const used=new Set();
 FIELDS.forEach(f=>{
  let value="";
  if(f.lines){
   value=f.lines.map(n=>String(fd.get(n)||"").trim()).filter(Boolean).join("\n");
   f.lines.forEach(n=>used.add(n));
  }else if(f.group){
   value=fd.getAll(f.name).map(v=>String(v).trim()).filter(Boolean).join(", ");
   used.add(f.name);
  }else{
   value=String(fd.get(f.name)||"").trim();
   used.add(f.name);
  }
  payload[f.label]=value;
 });
 // Send any future named field too, so additions to the form are not silently dropped.
 const seen=new Set();
 for(const name of fd.keys()){
  if(used.has(name)||name==="hp_note"||seen.has(name))continue;
  seen.add(name);
  const values=[...new Set(fd.getAll(name).map(v=>String(v).trim()).filter(Boolean))];
  if(values.length)payload[prettyName(name)]=values.join(", ");
 }
 payload.hp_note=String(fd.get("hp_note")||"").trim();
 payload._meta={submittedAt:new Date().toISOString(),page:location.href};
 return payload;
}

function setStatus(message,state){
 statusEl.textContent=message;
 statusEl.classList.toggle("ok",state==="ok");
 statusEl.classList.toggle("err",state==="err");
}

form.addEventListener("submit",async e=>{
 e.preventDefault();
 if(submitting)return;
 const url=SHEETS_WEB_APP_URL.trim();
 if(!url){
  setStatus("Submission is not connected yet. Add your Google Apps Script Web App URL in script.js.","err");
  return;
 }
 submitting=true;
 submitBtn.disabled=true;
 resetBtn.disabled=true;
 submitBtn.textContent="Submitting…";
 setStatus("Sending your response…","");
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),30000);
 try{
  const response=await fetch(url,{
   method:"POST",
   headers:{"Content-Type":"text/plain;charset=utf-8"},
   body:JSON.stringify(collectPayload()),
   signal:controller.signal
  });
  if(!response.ok)throw new Error("HTTP "+response.status);
  let result;
  try{result=await response.json();}catch(_){throw new Error("Unexpected response from Google Apps Script");}
  if(!result||result.ok!==true){
   const err=new Error(result&&result.error?String(result.error):"Google Sheets did not confirm the save.");
   err.fromServer=true;
   throw err;
  }
  setStatus(result.message||"Response saved to Google Sheets. Thank you!","ok");
 }catch(err){
  console.error("Submission failed:",err);
  let message="Could not save your response. Please check your connection and try again.";
  if(err&&err.name==="AbortError")message="The request timed out. Please check your connection and try again.";
  else if(err&&err.fromServer)message=err.message;
  setStatus(message,"err");
 }finally{
  clearTimeout(timer);
  submitting=false;
  submitBtn.disabled=false;
  resetBtn.disabled=false;
  submitBtn.textContent="Submit Form";
 }
});

form.addEventListener("reset",()=>setStatus("",""));
form.addEventListener("keydown",e=>{
 if(e.key==="Enter"&&e.target instanceof HTMLInputElement&&!["checkbox","button","submit","reset"].includes(e.target.type))e.preventDefault();
});
