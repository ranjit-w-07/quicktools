import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import "./App.css";

const toolComponents = {
  "jpg-to-pdf": lazy(() => import("./components/JpgToPdf.jsx")),
  "image-compressor": lazy(() => import("./components/ImageCompressor.jsx")),
  "pdf-to-jpg": lazy(() => import("./components/PdfToJpg.jsx")),
  "merge-pdf": lazy(() => import("./components/MergePdf.jsx")),
  "unit-converter": lazy(() => import("./components/UnitConverter.jsx")),
  "emi-calculator": lazy(() => import("./components/EmiCalculator.jsx")),
  "pdf-compressor": lazy(() => import("./components/tools/PdfCompressor.jsx")),
  "pdf-splitter": lazy(() => import("./components/tools/PdfSplitter.jsx")),
  "pdf-page-extractor": lazy(() => import("./components/tools/PdfPageExtractor.jsx")),
  "pdf-to-png": lazy(() => import("./components/tools/PdfToPng.jsx")),
  "rotate-pdf": lazy(() => import("./components/tools/RotatePdf.jsx")),
  "image-resizer": lazy(() => import("./components/tools/ImageResizer.jsx")),
  "jpg-to-png": lazy(() => import("./components/tools/JpgToPng.jsx")),
  "png-to-jpg": lazy(() => import("./components/tools/PngToJpg.jsx")),
  "webp-to-jpg": lazy(() => import("./components/tools/WebpToJpg.jsx")),
  "image-cropper": lazy(() => import("./components/tools/ImageCropper.jsx")),
  "percentage-calculator": lazy(() => import("./components/tools/PercentageCalculator.jsx")),
  "age-calculator": lazy(() => import("./components/tools/AgeCalculator.jsx")),
  "discount-calculator": lazy(() => import("./components/tools/DiscountCalculator.jsx")),
  "date-calculator": lazy(() => import("./components/tools/DateCalculator.jsx")),
  "gst-calculator": lazy(() => import("./components/tools/GstCalculator.jsx")),
};

const toolGroups = [
  {
    id: "pdf-tools",
    title: "PDF Tools",
    subtitle: "Convert, organize and optimize PDF documents.",
    icon: "📄",
    tools: [
      { title: "JPG to PDF", description: "Turn multiple images into a single PDF.", icon: "🖼️", tool: "jpg-to-pdf" },
      { title: "PDF to JPG", description: "Convert PDF pages into JPG images.", icon: "📷", tool: "pdf-to-jpg" },
      { title: "Merge PDF", description: "Combine multiple PDF files into one.", icon: "🔗", tool: "merge-pdf" },
      { title: "PDF Compressor", description: "Rewrite and optimize a PDF file in your browser.", icon: "📦", tool: "pdf-compressor" },
      { title: "PDF Splitter", description: "Split a PDF into individual page files.", icon: "✂️", tool: "pdf-splitter" },
      { title: "PDF Page Extractor", description: "Save selected pages into a new PDF.", icon: "📑", tool: "pdf-page-extractor" },
      { title: "PDF to PNG", description: "Render PDF pages as PNG images.", icon: "🖼️", tool: "pdf-to-png" },
      { title: "Rotate PDF", description: "Rotate every page in a PDF document.", icon: "🔄", tool: "rotate-pdf" },
    ],
  },
  {
    id: "image-tools",
    title: "Image Tools",
    subtitle: "Resize, crop, compress and convert image files.",
    icon: "🎨",
    tools: [
      { title: "Image Compressor", description: "Reduce image file size with adjustable quality.", icon: "📦", tool: "image-compressor" },
      { title: "Image Resizer", description: "Resize an image to exact pixel dimensions.", icon: "↔️", tool: "image-resizer" },
      { title: "JPG to PNG", description: "Convert JPG photos to PNG format.", icon: "🧩", tool: "jpg-to-png" },
      { title: "PNG to JPG", description: "Convert PNG images to JPG format.", icon: "🖼️", tool: "png-to-jpg" },
      { title: "WebP to JPG", description: "Convert WebP images into JPG files.", icon: "🔁", tool: "webp-to-jpg" },
      { title: "Image Cropper", description: "Crop an image by choosing a custom area.", icon: "✂️", tool: "image-cropper" },
    ],
  },
  {
    id: "calculators",
    title: "Calculators",
    subtitle: "Quick answers for everyday numbers and dates.",
    icon: "🧮",
    tools: [
      { title: "Unit Converter", description: "Convert length, weight, temperature and more.", icon: "📏", tool: "unit-converter" },
      { title: "EMI Calculator", description: "Calculate monthly loan EMI and interest.", icon: "💰", tool: "emi-calculator" },
      { title: "Percentage Calculator", description: "Find a percentage, increase or decrease.", icon: "%", tool: "percentage-calculator" },
      { title: "Age Calculator", description: "Calculate age in years, months and days.", icon: "🎂", tool: "age-calculator" },
      { title: "Discount Calculator", description: "Calculate sale price and savings.", icon: "🏷️", tool: "discount-calculator" },
      { title: "Date Calculator", description: "Add or subtract days from a date.", icon: "📅", tool: "date-calculator" },
      { title: "GST Calculator", description: "Calculate GST amount and inclusive totals.", icon: "₹", tool: "gst-calculator" },
    ],
  },
];

const allTools = toolGroups.flatMap((group) =>
  group.tools.map((tool, index) => ({ ...tool, group: group.title, number: index + 1 }))
);

function getToolFromPath() {
  const match = window.location.pathname.match(/^\/tools\/([^/]+)\/?$/);
  return match ? match[1] : null;
}

function App() {
  const [activeTool, setActiveTool] = useState(getToolFromPath);
  const [expandedGroups, setExpandedGroups] = useState({ "pdf-tools": true, "image-tools": false, calculators: false });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handlePopState = () => setActiveTool(getToolFromPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const selectedTool = useMemo(() => allTools.find((tool) => tool.tool === activeTool), [activeTool]);
  const ActiveComponent = activeTool ? toolComponents[activeTool] : null;
  const filteredGroups = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return toolGroups;
    return toolGroups.map((group) => ({
      ...group,
      tools: group.tools.filter((tool) => `${tool.title} ${tool.description} ${group.title}`.toLowerCase().includes(query)),
    })).filter((group) => group.tools.length);
  }, [searchTerm]);

  const openTool = (slug) => {
    window.history.pushState({}, "", `/tools/${slug}/`);
    setActiveTool(slug);
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const goHome = () => {
    window.history.pushState({}, "", "/");
    setActiveTool(null);
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const toggleGroup = (id) => setExpandedGroups((current) => ({ ...current, [id]: !current[id] }));

  useEffect(() => {
    document.title = selectedTool ? `${selectedTool.title} | QuickTools` : "QuickTools — Free Online PDF, Image & Calculator Tools";
  }, [selectedTool]);

  const Header = ({ onHome = false }) => (
    <header className="header qt-header">
      <div className="container header-inner">
        <button className="logo logo-button" onClick={goHome} aria-label="QuickTools home">
          <img className="logo-icon-image" src="/quicktools-logo.svg" alt="" aria-hidden="true" /><span className="brand-word">Quick<span>Tools</span></span>
        </button>
        <nav className="qt-nav" aria-label="Main navigation">
          <a href={onHome ? "#home" : "/"} onClick={onHome ? undefined : (e) => { e.preventDefault(); goHome(); }}>Home</a>
          <a href={onHome ? "#tools" : "/#tools"} onClick={onHome ? undefined : (e) => { e.preventDefault(); goHome(); window.setTimeout(() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }), 0); }}>All tools</a>
          <a href={onHome ? "#about" : "/#about"} onClick={onHome ? undefined : (e) => { e.preventDefault(); goHome(); window.setTimeout(() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }), 0); }}>About</a>
        </nav>
        <a href={onHome ? "#tools" : "/#tools"} className="header-tools-button" onClick={onHome ? undefined : (e) => { e.preventDefault(); goHome(); window.setTimeout(() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" }), 0); }}>Explore tools <span>↗</span></a>
      </div>
    </header>
  );

  if (activeTool && ActiveComponent) {
    return (
      <div className="app tool-app">
        <Header />
        <main className="tool-page-main">
          <div className="tool-route-heading container">
            <button className="back-link" onClick={goHome}>← All tools</button>
            <div className="tool-route-eyebrow"><span className="route-eyebrow-dot" />{selectedTool?.group || "QUICKTOOLS"}</div>
            <h1>{selectedTool?.title || "Quick Tool"}</h1>
            <p>{selectedTool?.description || "A simple free online tool."}</p>
          </div>
          <div className="tool-workspace">
            <Suspense fallback={<div className="tool-loading" role="status"><span className="loading-spinner" />Loading tool…</div>}>
              <ActiveComponent />
            </Suspense>
          </div>
        </main>
        <footer className="footer qt-footer"><div className="container footer-inner"><div className="footer-brand"><button className="logo logo-button" onClick={goHome}><img className="logo-icon-image" src="/quicktools-logo.svg" alt="" aria-hidden="true" /><span className="brand-word">Quick<span>Tools</span></span></button><p>Simple online tools for everyday tasks.</p></div><div className="footer-copy"><p>© 2026 QuickTools · Files are processed in your browser where supported.</p></div></div></footer>
      </div>
    );
  }

  return (
    <div className="app">
      <Header onHome />
      <main>
        <section className="hero qt-hero" id="home">
          <div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" />
          <div className="container hero-content">
            <div className="hero-badge"><span>✦</span> YOUR EVERYDAY TOOLKIT</div>
            <h1>Get things done.<br /><span>Without the busywork.</span></h1>
            <p className="hero-description">Free online tools for PDFs, images and everyday calculations — simple to use, right in your browser.</p>
            <div className="hero-actions"><a href="#tools" className="hero-button">Explore all tools <span>→</span></a><div className="hero-note"><span className="hero-note-icon">✓</span> No account needed</div></div>
            <div className="hero-trust"><div><strong>{allTools.length}</strong><span>Useful tools</span></div><div className="hero-trust-divider" /><div><strong>Private</strong><span>Browser processing*</span></div><div className="hero-trust-divider" /><div><strong>Free</strong><span>To use</span></div></div>
            <p className="hero-disclaimer">*For tools that support local processing.</p>
          </div>
          <div className="hero-decoration" aria-hidden="true"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-float float-pdf">PDF <span>↗</span></div><div className="hero-float float-image">▧ <span>Image</span></div><div className="hero-float float-calc">＋ <span>Calculate</span></div><div className="hero-center-mark">ϟ</div></div>
        </section>

        <section className="tools-section qt-tools-section" id="tools">
          <div className="container">
            <div className="section-heading qt-section-heading">
              <div className="section-label"><span /> TOOL LIBRARY <span /></div>
              <h2>One place for your<br /><span>everyday essentials.</span></h2>
              <p>Choose a category to see its tools, or search for what you need.</p>
            </div>
            <div className="tool-search-wrap"><span className="tool-search-icon">⌕</span><input aria-label="Search tools" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search PDF, image, calculator tools…" /><kbd>21 tools</kbd></div>
            <div className="tool-accordion-list">
              {filteredGroups.map((group) => {
                const expanded = searchTerm.trim() ? true : !!expandedGroups[group.id];
                return <section className={`tool-accordion ${expanded ? "is-expanded" : ""}`} key={group.id}>
                  <button className="tool-accordion-trigger" aria-expanded={expanded} onClick={() => toggleGroup(group.id)}>
                    <span className={`category-icon category-${group.id}`}>{group.icon}</span>
                    <span className="accordion-title-wrap"><strong>{group.title}</strong><small>{group.subtitle}</small></span>
                    <span className="accordion-count">{group.tools.length} tools</span>
                    <span className="accordion-chevron" aria-hidden="true">⌄</span>
                  </button>
                  {expanded && <div className="tool-accordion-content"><div className="tool-list">
                    {group.tools.map((tool) => <button className="tool-list-row" key={tool.tool} onClick={() => openTool(tool.tool)}>
                      <span className="tool-list-icon">{tool.icon}</span><span className="tool-list-copy"><strong>{tool.title}</strong><small>{tool.description}</small></span><span className="tool-list-open">Open <b>↗</b></span>
                    </button>)}
                  </div></div>}
                </section>;
              })}
              {!filteredGroups.length && <div className="no-tools-found"><strong>No tools found</strong><p>Try a different keyword, such as PDF, image or GST.</p><button onClick={() => setSearchTerm("")}>Clear search</button></div>}
            </div>
            <div className="tools-bottom-note"><span>✦</span> More helpful tools will be added over time.</div>
          </div>
        </section>

        <section className="features-section qt-features-section"><div className="container"><div className="features-intro"><span>MADE TO BE USEFUL</span><h2>Less friction. More done.</h2></div><div className="features-grid">
          <div className="feature-card"><div className="feature-icon">⚡</div><div><h3>Quick by design</h3><p>Clear controls and focused tools help you finish everyday tasks.</p></div></div>
          <div className="feature-card"><div className="feature-icon">🔒</div><div><h3>Privacy minded</h3><p>Files stay in your browser for tools that process locally.</p></div></div>
          <div className="feature-card"><div className="feature-icon">▣</div><div><h3>Works across devices</h3><p>A responsive experience for desktop, tablet and mobile.</p></div></div>
        </div></div></section>

        <section className="about-section" id="about"><div className="container"><div className="about-card qt-about-card">
          <div className="about-content"><div className="section-label about-label"><span /> ABOUT QUICKTOOLS <span /></div><h2>Helpful utilities.<span> Nothing complicated.</span></h2><p>QuickTools brings PDF utilities, image tools and everyday calculators together in one simple workspace.</p><p>Open a tool when you need it. Each tool is loaded on demand to help keep the first page lightweight.</p><div className="about-points"><div><span>✓</span> Easy to use</div><div><span>✓</span> No signup required</div><div><span>✓</span> Mobile friendly</div></div></div>
          <div className="about-visual"><div className="about-visual-card"><div className="about-visual-icon">ϟ</div><strong>QuickTools</strong><span>Everyday tasks,<br />made simpler.</span><div className="visual-dots"><i /><i /><i /></div></div></div>
        </div></div></section>
      </main>
      <footer className="footer qt-footer"><div className="container footer-inner"><div className="footer-brand"><button className="logo logo-button" onClick={goHome}><img className="logo-icon-image" src="/quicktools-logo.svg" alt="" aria-hidden="true" /><span className="brand-word">Quick<span>Tools</span></span></button><p>Simple online tools for everyday tasks.</p></div><div className="footer-links"><a href="#home">Home</a><a href="#tools">Tools</a><a href="#about">About</a></div><div className="footer-copy"><p>© 2026 QuickTools. All rights reserved.</p></div></div></footer>
    </div>
  );
}

export default App;
