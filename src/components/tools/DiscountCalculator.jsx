import { useState } from "react";
import "./shared-new-tools.css";
import "./DiscountCalculator.css";
export default function DiscountCalculator(){
 const [price,setPrice]=useState("1000"),[discount,setDiscount]=useState("20");
 const p=Number(price),d=Number(discount),valid=price!==""&&discount!==""&&Number.isFinite(p)&&Number.isFinite(d)&&p>=0&&d>=0&&d<=100;
 const savings=valid?p*d/100:0,finalPrice=valid?p-savings:0;
 return <section className="new-tool-section discount-calculator-tool"><div className="new-tool-container"><div className="new-tool-card"><h2 className="new-tool-title">Discount Calculator</h2><p className="new-tool-description">Find the discount amount and final sale price.</p><div className="new-tool-form"><div className="new-tool-field"><label htmlFor="discount-price">Original price (₹)</label><input id="discount-price" type="number" min="0" value={price} onChange={e=>setPrice(e.target.value)} /></div><div className="new-tool-field"><label htmlFor="discount-percent">Discount (%)</label><input id="discount-percent" type="number" min="0" max="100" value={discount} onChange={e=>setDiscount(e.target.value)} /></div></div>{valid?<div className="new-tool-result"><p>Final price</p><strong>₹{finalPrice.toLocaleString("en-IN",{maximumFractionDigits:2})}</strong><p>You save ₹{savings.toLocaleString("en-IN",{maximumFractionDigits:2})}</p></div>:<div className="new-tool-message error">Enter a price of 0 or more and a discount between 0% and 100%.</div>}</div></div></section>;
}
