import React from 'react';
// import '../shared-tools.css';

export default function PrivacyPolicy() {
  return (
    <div className="tool-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', textAlign: 'left' }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: October 2026</p>
      
      <h3>1. Information We Collect</h3>
      <p>QuickTools operates entirely client-side for most file operations. When you use our PDF and image tools, your files are processed directly in your browser. We do not store, view, or keep copies of your uploaded documents, PDFs, or images on our servers.</p>

      <h3>2. Google AdSense & Cookies</h3>
      <p>We use third-party vendors, including Google, to serve ads when you visit our website. Google may use cookies (such as the DART cookie) to serve ads based on your prior visits to our website or other websites.</p>
      <p>Users may opt out of personalized advertising by visiting Google Ads Settings.</p>

      <h3>3. Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, you can reach us via our Contact page.</p>
    </div>
  );
}