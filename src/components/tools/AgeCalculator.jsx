import { useState } from "react";
import "./shared-new-tools.css";
import "./AgeCalculator.css";
export default function AgeCalculator(){
 const [birth,setBirth]=useState("1995-01-01"),[asOf,setAsOf]=useState(new Date().toISOString().slice(0,10));
 let result=null;
 if(birth&&asOf){const b=new Date(`${birth}T00:00:00`),d=new Date(`${asOf}T00:00:00`);if(!Number.isNaN(b.getTime())&&!Number.isNaN(d.getTime())&&b<=d){let y=d.getFullYear()-b.getFullYear(),m=d.getMonth()-b.getMonth(),days=d.getDate()-b.getDate();if(days<0){m--;days+=new Date(d.getFullYear(),d.getMonth(),0).getDate();}if(m<0){y--;m+=12;}result={y,m,days,total:Math.floor((d-b)/86400000)};}}
 return <section className="new-tool-section age-calculator-tool"><div className="new-tool-container"><div className="new-tool-card"><h2 className="new-tool-title">Age Calculator</h2><p className="new-tool-description">Find your age in years, months and days on any date.</p><div className="new-tool-form"><div className="new-tool-field"><label htmlFor="age-birth">Date of birth</label><input id="age-birth" type="date" value={birth} max={asOf} onChange={e=>setBirth(e.target.value)} /></div><div className="new-tool-field"><label htmlFor="age-asof">Calculate age on</label><input id="age-asof" type="date" value={asOf} min={birth} onChange={e=>setAsOf(e.target.value)} /></div></div>{result?<div className="new-tool-result"><p>Your age is</p><strong>{result.y} years, {result.m} months, {result.days} days</strong><p>{result.total.toLocaleString("en-IN")} total days</p></div>:<div className="new-tool-message error">Choose a valid birth date and calculation date.</div>}</div></div></section>;
}
