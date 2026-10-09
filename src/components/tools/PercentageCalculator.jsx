import { useState } from "react";
import "./shared-new-tools.css";
import "./PercentageCalculator.css";
export default function PercentageCalculator() {
 const [mode,setMode]=useState("of"),[a,setA]=useState("15"),[b,setB]=useState("200");
 const x=Number(a),y=Number(b); let result=null, label="";
 if(a!==""&&b!==""&&Number.isFinite(x)&&Number.isFinite(y)){
   if(mode==="of"){result=y*x/100;label=`${x}% of ${y} is`;}
   else if(mode==="what"){result=y===0?null:x/y*100;label=`${x} is this percentage of ${y}`;}
   else {result=y===0?null:(x-y)/Math.abs(y)*100;label="Percentage change from second value to first";}
 }
 return <section className="new-tool-section percentage-calculator-tool"><div className="new-tool-container"><div className="new-tool-card"><h2 className="new-tool-title">Percentage Calculator</h2><p className="new-tool-description">Calculate percentages and percentage changes instantly.</p><div className="new-tool-form"><div className="new-tool-field new-tool-span"><label htmlFor="pct-mode">Calculation</label><select id="pct-mode" value={mode} onChange={e=>setMode(e.target.value)}><option value="of">What is X% of Y?</option><option value="what">X is what % of Y?</option><option value="change">Percentage change from Y to X</option></select></div><div className="new-tool-field"><label htmlFor="pct-a">{mode==="of"?"Percentage (X)":"First value (X)"}</label><input id="pct-a" type="number" value={a} onChange={e=>setA(e.target.value)} /></div><div className="new-tool-field"><label htmlFor="pct-b">{mode==="of"?"Number (Y)":"Second value (Y)"}</label><input id="pct-b" type="number" value={b} onChange={e=>setB(e.target.value)} /></div></div><div className="new-tool-result"><p>{label}</p><strong>{result===null||!Number.isFinite(result)?"Enter valid values":`${result.toLocaleString("en-IN",{maximumFractionDigits:6})}${mode==="what"||mode==="change"?"%":""}`}</strong></div></div></div></section>;
}
