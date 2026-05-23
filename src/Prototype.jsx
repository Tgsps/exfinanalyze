import React, { useState, useEffect } from 'react';
import {
  FileText, Upload, CheckCircle2, AlertTriangle, Sparkles, ArrowRight,
  ChevronRight, Search, Bell, Settings, FolderOpen, BarChart3, BookOpen,
  Clock, TrendingUp, TrendingDown, Eye, MessageSquare, GraduationCap,
  Shield, Zap, FileSpreadsheet, FileCheck, Activity, Calendar,
  ArrowUpRight, ArrowDownRight, Info, Lock, Layers, X, Plus, Filter
} from 'lucide-react';

export default function ExFinAnalyze() {
  const [activeView, setActiveView] = useState('dashboard');
  const [extractStep, setExtractStep] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showCoaching, setShowCoaching] = useState(false);
  const [narrativeGenerating, setNarrativeGenerating] = useState(false);
  const [narrativeDone, setNarrativeDone] = useState(false);

  // Simulate extraction progress
  useEffect(() => {
    if (extractStep > 0 && extractStep < 4) {
      const timer = setTimeout(() => setExtractStep(extractStep + 1), 900);
      return () => clearTimeout(timer);
    }
  }, [extractStep]);

  const fontStyles = ``;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="h-screen w-full flex bg-[#FAFAF7] text-[#1A1A1A] overflow-hidden">
      <style>{fontStyles}</style>

      {/* Sidebar */}
      <aside className="w-60 bg-[#0F0F0E] text-[#E8E6DF] flex flex-col border-r border-black">
        <div className="px-5 py-5 border-b border-[#262624]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#D4A574] flex items-center justify-center" style={{ borderRadius: '2px' }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: '#0F0F0E', fontSize: '18px' }}>E</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '17px', letterSpacing: '-0.02em' }}>ExFinAnalyze</div>
              <div className="text-[10px] text-[#8B8983] uppercase tracking-widest">Financial Intelligence</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          <div className="text-[10px] uppercase tracking-widest text-[#6B6963] px-3 mb-2 font-semibold">Workspace</div>
          {[
            { id:'dashboard',  icon:BarChart3,     label:'Dashboard',          badge:null  },
            { id:'extract',    icon:FileText,      label:'Documents',          badge:'12'  },
            { id:'review',     icon:GraduationCap, label:'AI Shadow Reviewer', badge:'NEW' },
            { id:'close',      icon:Activity,      label:'Month-End Close',    badge:'3'   },
            { id:'concierge',  icon:MessageSquare, label:'AI Concierge',       badge:'NEW' },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 text-left transition-all ${
                  isActive ? 'bg-[#1F1F1D] text-white' : 'text-[#A8A6A0] hover:bg-[#1A1A18] hover:text-[#E8E6DF]'
                }`}
                style={{ borderRadius: '4px' }}
              >
                <Icon size={15} strokeWidth={1.75} />
                <span className="text-[13px] font-medium flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 font-semibold tracking-wider ${
                    item.badge === 'NEW' ? 'bg-[#D4A574] text-[#0F0F0E]' : 'bg-[#262624] text-[#A8A6A0]'
                  }`} style={{ borderRadius: '2px' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="text-[10px] uppercase tracking-widest text-[#6B6963] px-3 mb-2 mt-6 font-semibold">Tools</div>
          {[
            { id:'calculator', icon:TrendingUp, label:'Incentive Calculator', clickable:true },
            { id:null,         icon:BookOpen,   label:'Knowledge Base',       clickable:false },
            { id:null,         icon:Clock,      label:'Audit Trail',          clickable:false },
          ].map((item,i) => {
            const Icon = item.icon;
            const isActive = item.id && activeView === item.id;
            return (
              <button key={i}
                onClick={() => item.clickable && item.id && setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 mb-0.5 text-left transition-all ${
                  isActive ? 'bg-[#1F1F1D] text-white' : item.clickable ? 'text-[#A8A6A0] hover:bg-[#1A1A18] hover:text-[#E8E6DF]' : 'text-[#6B6963] cursor-default'
                }`} style={{ borderRadius: '4px' }}>
                <Icon size={14} strokeWidth={1.5} />
                <span className="text-[13px]">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-[#262624]">
          <div className="px-3 py-2.5 bg-[#1A1A18] flex items-center gap-2.5" style={{ borderRadius: '4px' }}>
            <div className="w-7 h-7 bg-gradient-to-br from-[#D4A574] to-[#A67C4E] flex items-center justify-center text-[11px] font-semibold text-[#0F0F0E]" style={{ borderRadius: '50%' }}>SC</div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-[#E8E6DF] truncate">Sarah Chen</div>
              <div className="text-[10px] text-[#6B6963]">Junior Analyst</div>
            </div>
            <Settings size={13} className="text-[#6B6963]" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 border-b border-[#E8E4DA] bg-white flex items-center justify-between px-7">
          <div className="flex items-center gap-3">
            <div className="text-[11px] text-[#8B8983] uppercase tracking-widest">
              {activeView === 'dashboard'  && 'Analytics'}
              {activeView === 'extract'    && 'Extraction'}
              {activeView === 'review'     && 'Coaching'}
              {activeView === 'close'      && 'Close Workflow'}
              {activeView === 'concierge'  && 'AI'}
              {activeView === 'calculator' && 'Tools'}
            </div>
            <ChevronRight size={12} className="text-[#C4C0B6]" />
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '15px' }} className="text-[#1A1A1A]">
              {activeView === 'dashboard'  && 'Intelligent Analytics View'}
              {activeView === 'extract'    && 'Q3 Vendor Documents'}
              {activeView === 'review'     && 'Lease Agreement — TechSpace Realty'}
              {activeView === 'close'      && 'November 2026 Close'}
              {activeView === 'concierge'  && '24/7 AI Concierge'}
              {activeView === 'calculator' && 'Smart Incentive Calculator'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F2EA] border border-[#E8E4DA]" style={{ borderRadius: '3px' }}>
              <Search size={13} className="text-[#8B8983]" />
              <input placeholder="Search documents…" className="bg-transparent outline-none text-[12px] w-48 placeholder:text-[#A8A6A0]" />
              <kbd className="text-[9px] text-[#8B8983] bg-white px-1 py-0.5 border border-[#E8E4DA]" style={{ borderRadius: '2px' }}>⌘K</kbd>
            </div>
            <button className="p-1.5 hover:bg-[#F5F2EA]" style={{ borderRadius: '3px' }}>
              <Bell size={15} className="text-[#5A5854]" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          {activeView === 'dashboard'  && <DashboardView />}
          {activeView === 'extract'    && <ExtractionView extractStep={extractStep} setExtractStep={setExtractStep} setActiveView={setActiveView} />}
          {activeView === 'review'     && <ShadowReviewerView showCoaching={showCoaching} setShowCoaching={setShowCoaching} setActiveView={setActiveView} />}
          {activeView === 'close'      && <CloseView narrativeGenerating={narrativeGenerating} setNarrativeGenerating={setNarrativeGenerating} narrativeDone={narrativeDone} setNarrativeDone={setNarrativeDone} />}
          {activeView === 'concierge'  && <ConciergeView />}
          {activeView === 'calculator' && <IncentiveCalculatorView />}
        </div>
      </main>
    </div>
  );
}

// ============= EXTRACTION VIEW =============
function ExtractionView({ extractStep, setExtractStep, setActiveView }) {
  const documents = [
    { name: 'Vendor_Invoice_Acme_Q3.pdf', type: 'Invoice', size: '1.2 MB', confidence: 99 },
    { name: 'Lease_TechSpace_2026.pdf', type: 'Contract', size: '3.4 MB', confidence: 96 },
    { name: 'Bank_Statement_Oct.xlsx', type: 'Spreadsheet', size: '847 KB', confidence: 100 },
  ];

  const steps = [
    { label: 'Parsing document structure', detail: 'Identifying sections, tables, headers' },
    { label: 'Extracting line items', detail: '47 fields detected across 3 tables' },
    { label: 'Cross-referencing to GL', detail: 'Matching against November ledger' },
    { label: 'Generating audit trail', detail: 'Citations linked to source pages' },
  ];

  const extractedFields = [
    { label: 'Vendor', value: 'TechSpace Realty LLC', source: 'p.1, ¶2', confidence: 99 },
    { label: 'Contract Value', value: '$48,000', source: 'p.2, §3.1', confidence: 100 },
    { label: 'Term Length', value: '36 months', source: 'p.1, §1.4', confidence: 99 },
    { label: 'Commencement', value: '2026-01-15', source: 'p.1, §1.2', confidence: 100 },
    { label: 'Pricing Uplift', value: '7.5% annually', source: 'p.4, §5.2', confidence: 95, flag: true },
    { label: 'Termination Notice', value: '90 days', source: 'p.6, §8.1', confidence: 98 },
    { label: 'Liability Cap', value: '$50,000', source: 'p.7, §9.3', confidence: 97, flag: true },
  ];

  return (
    <div className="p-8 max-w-[1400px]">
      {/* Hero */}
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-[#8B8983] mb-2">Extract → Validate → Reconcile</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '38px', lineHeight: '1.1', letterSpacing: '-0.025em' }} className="text-[#1A1A1A] mb-2">
          From document to ledger,<br /><em style={{ fontStyle: 'italic', color: '#A67C4E' }}>without the manual work.</em>
        </h1>
        <p className="text-[14px] text-[#5A5854] max-w-2xl leading-relaxed">
          Drop a PDF, contract, or spreadsheet. ExFinAnalyze reads it, extracts every field with source citations,
          and flags risks before they reach your manager.
        </p>
      </div>

      {/* Upload zone */}
      {extractStep === 0 && (
        <div className="border-2 border-dashed border-[#D4C9B0] bg-[#F9F6EC] p-12 text-center mb-6" style={{ borderRadius: '6px' }}>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1A1A1A] mb-4" style={{ borderRadius: '50%' }}>
            <Upload size={22} className="text-[#D4A574]" strokeWidth={1.75} />
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '20px' }} className="mb-1">
            Drop files to begin
          </div>
          <div className="text-[13px] text-[#8B8983] mb-5">PDFs, Excel, contracts — up to 50MB each</div>
          <button
            onClick={() => setExtractStep(1)}
            className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 text-[13px] font-medium hover:bg-[#262624] transition-colors"
            style={{ borderRadius: '3px' }}
          >
            <Sparkles size={14} />
            Try with sample documents
          </button>
        </div>
      )}

      {/* Processing */}
      {extractStep > 0 && extractStep < 4 && (
        <div className="bg-white border border-[#E8E4DA] p-7 mb-6" style={{ borderRadius: '4px' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1A1A1A] flex items-center justify-center" style={{ borderRadius: '4px' }}>
                <FileText size={16} className="text-[#D4A574]" />
              </div>
              <div>
                <div className="text-[14px] font-semibold">Lease_TechSpace_2026.pdf</div>
                <div className="text-[11px] text-[#8B8983]">Processing • 3.4 MB • 12 pages</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#8B8983]">
              <div className="w-1.5 h-1.5 bg-[#D4A574] animate-pulse" style={{ borderRadius: '50%' }} />
              <span>Analyzing</span>
            </div>
          </div>
          <div className="space-y-2">
            {steps.map((step, i) => {
              const isDone = i < extractStep;
              const isActive = i === extractStep;
              return (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className={`w-5 h-5 flex items-center justify-center transition-all ${
                    isDone ? 'bg-[#1A1A1A]' : isActive ? 'bg-[#D4A574]' : 'bg-[#F0EDE3]'
                  }`} style={{ borderRadius: '50%' }}>
                    {isDone ? <CheckCircle2 size={11} className="text-[#D4A574]" /> :
                     isActive ? <div className="w-1.5 h-1.5 bg-white animate-pulse" style={{ borderRadius: '50%' }} /> :
                     <div className="w-1 h-1 bg-[#C4C0B6]" style={{ borderRadius: '50%' }} />}
                  </div>
                  <div className="flex-1">
                    <div className={`text-[13px] ${isDone || isActive ? 'text-[#1A1A1A] font-medium' : 'text-[#8B8983]'}`}>{step.label}</div>
                    <div className="text-[11px] text-[#8B8983]">{step.detail}</div>
                  </div>
                  {isDone && <span className="text-[11px] text-[#A67C4E] font-mono">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {extractStep >= 4 && (
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Document preview */}
          <div className="col-span-1 bg-white border border-[#E8E4DA] p-5" style={{ borderRadius: '4px' }}>
            <div className="text-[10px] uppercase tracking-widest text-[#8B8983] mb-3 font-semibold">Source Document</div>
            <div className="aspect-[3/4] bg-gradient-to-b from-[#F9F6EC] to-[#F0EDE3] border border-[#E8E4DA] p-4 mb-3 relative overflow-hidden" style={{ borderRadius: '3px' }}>
              <div className="space-y-1.5">
                <div className="h-2 bg-[#1A1A1A] w-1/2" />
                <div className="h-1 bg-[#C4C0B6] w-3/4" />
                <div className="h-1 bg-[#C4C0B6] w-2/3" />
                <div className="mt-3 space-y-1">
                  <div className="h-1 bg-[#E8E4DA] w-full" />
                  <div className="h-1 bg-[#D4A574] w-4/5 ring-1 ring-[#A67C4E]" />
                  <div className="h-1 bg-[#E8E4DA] w-full" />
                  <div className="h-1 bg-[#E8E4DA] w-5/6" />
                </div>
                <div className="mt-3 space-y-1">
                  <div className="h-1 bg-[#E8E4DA] w-full" />
                  <div className="h-1 bg-[#E8E4DA] w-3/4" />
                  <div className="h-1 bg-[#D4A574] w-2/3 ring-1 ring-[#A67C4E]" />
                </div>
                <div className="mt-3 space-y-1">
                  {["w-4/5","w-full","w-3/4","w-5/6","w-2/3","w-full","w-4/5","w-3/5"].map((w, i) => (
                    <div key={i} className={`h-1 bg-[#E8E4DA] ${w}`} />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-2 right-2 text-[9px] text-[#8B8983] font-mono">Page 1 / 12</div>
            </div>
            <div className="text-[11px] text-[#5A5854] leading-relaxed">
              Every extracted field links back to its exact location in the source document.
            </div>
          </div>

          {/* Extracted fields */}
          <div className="col-span-2 bg-white border border-[#E8E4DA]" style={{ borderRadius: '4px' }}>
            <div className="px-5 py-4 border-b border-[#E8E4DA] flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#8B8983] mb-0.5 font-semibold">Extraction Complete</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '17px' }}>47 fields extracted</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-[#8B8983] uppercase tracking-wider">Avg. Confidence</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[18px] font-semibold text-[#1A1A1A]">98.4%</div>
                </div>
                <div className="w-px h-10 bg-[#E8E4DA]" />
                <button onClick={() => setActiveView('review')} className="bg-[#1A1A1A] text-white px-4 py-2 text-[12px] font-medium flex items-center gap-2 hover:bg-[#262624]" style={{ borderRadius: '3px' }}>
                  Review with AI <ArrowRight size={12} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-[#F0EDE3]">
              {extractedFields.map((field, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-[#FAFAF7] group">
                  <div className="w-32 text-[11px] uppercase tracking-wider text-[#8B8983]">{field.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="flex-1 text-[13px] font-medium text-[#1A1A1A]">{field.value}</div>
                  <div className="text-[10px] text-[#8B8983] font-mono">{field.source}</div>
                  <div className={`text-[10px] font-mono px-2 py-0.5 ${
                    field.confidence >= 99 ? 'text-[#2F6B4D] bg-[#E8F0EB]' :
                    field.confidence >= 95 ? 'text-[#A67C4E] bg-[#F9F6EC]' : 'text-[#A8482E] bg-[#F5E8E2]'
                  }`} style={{ borderRadius: '2px' }}>
                    {field.confidence}%
                  </div>
                  {field.flag && <AlertTriangle size={13} className="text-[#A67C4E]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Risk callouts after extraction */}
      {extractStep >= 4 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#FDF6E9] border border-[#E8D9B5] p-5" style={{ borderRadius: '4px' }}>
            <div className="flex items-start gap-3 mb-2">
              <AlertTriangle size={16} className="text-[#A67C4E] mt-0.5" />
              <div className="flex-1">
                <div className="text-[13px] font-semibold mb-1">Pricing uplift exceeds benchmark</div>
                <div className="text-[12px] text-[#5A5854] leading-relaxed">
                  Annual uplift of <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="font-medium">7.5%</span> exceeds typical SaaS contract range of 0–5%. Suggest negotiating a cap or CPI-linked adjustment.
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#FDF6E9] border border-[#E8D9B5] p-5" style={{ borderRadius: '4px' }}>
            <div className="flex items-start gap-3 mb-2">
              <Shield size={16} className="text-[#A67C4E] mt-0.5" />
              <div className="flex-1">
                <div className="text-[13px] font-semibold mb-1">Liability cap appears low</div>
                <div className="text-[12px] text-[#5A5854] leading-relaxed">
                  Cap of <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="font-medium">$50,000</span> may be insufficient relative to contract value. Consider raising to 12× annual fees.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============= SHADOW REVIEWER VIEW =============
function ShadowReviewerView({ showCoaching, setShowCoaching, setActiveView }) {
  const [userClassification, setUserClassification] = useState(null);

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-widest text-[#8B8983] mb-2 flex items-center gap-2">
          <span>AI Shadow Reviewer</span>
          <span className="bg-[#D4A574] text-[#0F0F0E] px-2 py-0.5 text-[9px] font-bold tracking-widest" style={{ borderRadius: '2px' }}>BETA</span>
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '38px', lineHeight: '1.1', letterSpacing: '-0.025em' }} className="text-[#1A1A1A] mb-2">
          Learn while you work.<br /><em style={{ fontStyle: 'italic', color: '#A67C4E' }}>Not after.</em>
        </h1>
        <p className="text-[14px] text-[#5A5854] max-w-2xl leading-relaxed">
          The AI works alongside you, explains the standards, and shows you what a senior reviewer would catch. Build expertise on real work — without waiting for someone to train you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: User workspace */}
        <div className="bg-white border border-[#E8E4DA]" style={{ borderRadius: '4px' }}>
          <div className="px-5 py-4 border-b border-[#E8E4DA] flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#8B8983] font-semibold">Your Workspace</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '15px' }} className="mt-0.5">Lease Classification — Step 3 of 5</div>
            </div>
            <div className="text-[11px] text-[#8B8983]">⌘ + Enter to confirm</div>
          </div>

          <div className="p-5">
            <div className="mb-5">
              <div className="text-[11px] uppercase tracking-wider text-[#8B8983] mb-2">Question</div>
              <div className="text-[14px] leading-relaxed text-[#1A1A1A]">
                Based on the extracted lease terms, classify this as either an <strong>Operating Lease</strong> or a <strong>Finance Lease</strong> under ASC 842.
              </div>
            </div>

            <div className="bg-[#F9F6EC] border border-[#E8D9B5] p-4 mb-5" style={{ borderRadius: '3px' }}>
              <div className="text-[10px] uppercase tracking-wider text-[#A67C4E] font-semibold mb-2">Key facts from contract</div>
              <div className="space-y-1.5 text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <div className="flex justify-between"><span className="text-[#5A5854]">Lease term</span><span className="font-medium">36 months</span></div>
                <div className="flex justify-between"><span className="text-[#5A5854]">Asset useful life</span><span className="font-medium">60 months</span></div>
                <div className="flex justify-between"><span className="text-[#5A5854]">PV of payments</span><span className="font-medium">$162,500</span></div>
                <div className="flex justify-between"><span className="text-[#5A5854]">Asset fair value</span><span className="font-medium">$185,000</span></div>
                <div className="flex justify-between"><span className="text-[#5A5854]">Transfer of ownership</span><span className="font-medium">No</span></div>
                <div className="flex justify-between"><span className="text-[#5A5854]">Bargain purchase option</span><span className="font-medium">No</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => { setUserClassification('operating'); setShowCoaching(true); }}
                className={`w-full text-left p-4 border transition-all ${
                  userClassification === 'operating' ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#E8E4DA] hover:border-[#A67C4E] bg-white'
                }`}
                style={{ borderRadius: '3px' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-semibold mb-0.5">Operating Lease</div>
                    <div className={`text-[11px] ${userClassification === 'operating' ? 'text-[#A8A6A0]' : 'text-[#8B8983]'}`}>None of the finance lease criteria are met</div>
                  </div>
                  <div className={`text-[11px] font-mono px-2 py-1 ${userClassification === 'operating' ? 'bg-[#262624]' : 'bg-[#F5F2EA]'}`} style={{ borderRadius: '2px' }}>A</div>
                </div>
              </button>
              <button
                onClick={() => { setUserClassification('finance'); setShowCoaching(true); }}
                className={`w-full text-left p-4 border transition-all ${
                  userClassification === 'finance' ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#E8E4DA] hover:border-[#A67C4E] bg-white'
                }`}
                style={{ borderRadius: '3px' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-semibold mb-0.5">Finance Lease</div>
                    <div className={`text-[11px] ${userClassification === 'finance' ? 'text-[#A8A6A0]' : 'text-[#8B8983]'}`}>One or more finance lease criteria met</div>
                  </div>
                  <div className={`text-[11px] font-mono px-2 py-1 ${userClassification === 'finance' ? 'bg-[#262624]' : 'bg-[#F5F2EA]'}`} style={{ borderRadius: '2px' }}>B</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right: AI Shadow */}
        <div className="bg-[#0F0F0E] text-[#E8E6DF] relative overflow-hidden" style={{ borderRadius: '4px' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A574] opacity-5 blur-3xl" style={{ borderRadius: '50%' }} />

          <div className="relative px-5 py-4 border-b border-[#262624] flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#8B8983] font-semibold flex items-center gap-2">
                <Eye size={11} /> AI Shadow Review
              </div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '15px' }} className="mt-0.5 text-white">Working in parallel…</div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#D4A574] animate-pulse" style={{ borderRadius: '50%' }} />
              <span className="text-[11px] text-[#A8A6A0]">Live</span>
            </div>
          </div>

          {!showCoaching && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1F1F1D] mb-3" style={{ borderRadius: '50%' }}>
                <GraduationCap size={20} className="text-[#D4A574]" strokeWidth={1.5} />
              </div>
              <div className="text-[14px] text-[#A8A6A0] mb-2 leading-relaxed">
                Make your selection on the left.<br />I'll show what I would have done and why.
              </div>
              <div className="text-[11px] text-[#6B6963] italic mt-4">No judgment. Just transparency.</div>
            </div>
          )}

          {showCoaching && (
            <div className="p-5 space-y-4">
              {/* AI's classification */}
              <div className="bg-[#1A1A18] border border-[#262624] p-4" style={{ borderRadius: '3px' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-[#D4A574]" />
                  <div className="text-[10px] uppercase tracking-wider text-[#8B8983] font-semibold">My classification</div>
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '20px' }} className="text-white mb-1">Operating Lease</div>
                <div className="text-[11px] text-[#A8A6A0] font-mono">Confidence 96%</div>
              </div>

              {userClassification === 'finance' && (
                <div className="bg-[#3D2A1F] border border-[#5C3D2A] p-4" style={{ borderRadius: '3px' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={12} className="text-[#E8B574]" />
                    <div className="text-[11px] font-semibold text-[#E8B574]">We disagreed.</div>
                  </div>
                  <div className="text-[12px] text-[#E8E6DF] leading-relaxed">
                    You picked <strong>Finance Lease</strong>, I picked <strong>Operating Lease</strong>. Let's walk through the 5-criteria test to see which is right.
                  </div>
                </div>
              )}

              {/* Reasoning */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#8B8983] font-semibold mb-2">ASC 842 — 5-Criteria Test</div>
                <div className="space-y-2">
                  {[
                    { test: 'Transfer of ownership', result: 'No', pass: false },
                    { test: 'Bargain purchase option', result: 'No', pass: false },
                    { test: 'Term ≥ 75% of useful life', result: '60% (36÷60 mo.)', pass: false },
                    { test: 'PV ≥ 90% of fair value', result: '87.8% ($162.5k÷$185k)', pass: false },
                    { test: 'Specialized asset', result: 'No', pass: false },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 bg-[#1A1A18]" style={{ borderRadius: '3px' }}>
                      <div className={`w-4 h-4 flex items-center justify-center ${t.pass ? 'bg-[#3D5C42]' : 'bg-[#262624]'}`} style={{ borderRadius: '50%' }}>
                        {t.pass ? <CheckCircle2 size={10} className="text-[#7FB897]" /> : <X size={10} className="text-[#6B6963]" />}
                      </div>
                      <div className="flex-1 text-[12px] text-[#A8A6A0]">{t.test}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-[#E8E6DF]">{t.result}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Educational tooltip */}
              <div className="bg-[#1F1F1D] border-l-2 border-[#D4A574] px-4 py-3" style={{ borderRadius: '0 3px 3px 0' }}>
                <div className="flex items-start gap-2">
                  <BookOpen size={13} className="text-[#D4A574] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[11px] font-semibold text-[#D4A574] mb-1 uppercase tracking-wider">Why this matters</div>
                    <div className="text-[12px] text-[#A8A6A0] leading-relaxed">
                      All five tests fail, so this is an <strong className="text-white">Operating Lease</strong> — recognized as a single straight-line expense rather than a depreciating ROU asset plus interest. The 90% PV threshold is the closest call here (87.8%), so document your conclusion in the workpaper.
                    </div>
                    <button className="mt-2 text-[11px] text-[#D4A574] hover:underline">Read ASC 842-10-25-2 →</button>
                  </div>
                </div>
              </div>

              {userClassification === 'operating' && (
                <div className="bg-[#1F2D24] border border-[#2F4A38] p-3 flex items-center gap-2" style={{ borderRadius: '3px' }}>
                  <CheckCircle2 size={14} className="text-[#7FB897]" />
                  <div className="text-[12px] text-[#B8D4C0]">You and I agreed. Nice work, Sarah.</div>
                </div>
              )}

              <button onClick={() => setActiveView('close')} className="w-full bg-[#D4A574] text-[#0F0F0E] py-2.5 text-[12px] font-semibold hover:bg-[#E8B785] flex items-center justify-center gap-2" style={{ borderRadius: '3px' }}>
                Continue to close workflow <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= CLOSE VIEW =============
function CloseView({ narrativeGenerating, setNarrativeGenerating, narrativeDone, setNarrativeDone }) {
  const generateNarrative = () => {
    setNarrativeGenerating(true);
    setTimeout(() => { setNarrativeGenerating(false); setNarrativeDone(true); }, 2400);
  };

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-[#8B8983] mb-2">Close Workflow • Day 3 of 5</div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '38px', lineHeight: '1.1', letterSpacing: '-0.025em' }} className="text-[#1A1A1A]">
            November close,<br /><em style={{ fontStyle: 'italic', color: '#A67C4E' }}>two days ahead of schedule.</em>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white border border-[#E8E4DA] px-4 py-2 text-[12px] font-medium hover:border-[#A67C4E] flex items-center gap-2" style={{ borderRadius: '3px' }}>
            <Filter size={12} /> Filter
          </button>
          <button className="bg-[#1A1A1A] text-white px-4 py-2 text-[12px] font-medium hover:bg-[#262624] flex items-center gap-2" style={{ borderRadius: '3px' }}>
            <FileCheck size={12} /> Submit for review
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tasks Complete', value: '47/52', delta: '+8 today', trend: 'up', mono: true },
          { label: 'Anomalies Flagged', value: '3', delta: '2 reviewed', trend: 'flat', mono: true },
          { label: 'Touchless Rate', value: '84%', delta: '+12% vs Oct', trend: 'up', mono: true },
          { label: 'Days to Close', value: '2.1', delta: '−1.4 vs Oct', trend: 'down', mono: true },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-[#E8E4DA] p-5" style={{ borderRadius: '4px' }}>
            <div className="text-[10px] uppercase tracking-widest text-[#8B8983] mb-2 font-semibold">{kpi.label}</div>
            <div style={{ fontFamily: kpi.mono ? "'JetBrains Mono', monospace" : "'Fraunces', serif", fontWeight: 600, fontSize: '28px', letterSpacing: '-0.02em' }} className="text-[#1A1A1A] mb-1">
              {kpi.value}
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              {kpi.trend === 'up' && <ArrowUpRight size={11} className="text-[#2F6B4D]" />}
              {kpi.trend === 'down' && <ArrowDownRight size={11} className="text-[#2F6B4D]" />}
              <span className={kpi.trend !== 'flat' ? 'text-[#2F6B4D]' : 'text-[#8B8983]'}>{kpi.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left col: Variance + Anomalies */}
        <div className="col-span-2 space-y-6">
          {/* Variance Analysis */}
          <div className="bg-white border border-[#E8E4DA]" style={{ borderRadius: '4px' }}>
            <div className="px-5 py-4 border-b border-[#E8E4DA] flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#8B8983] font-semibold">Variance Analysis</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '17px' }} className="mt-0.5">November vs October</div>
              </div>
              <div className="text-[11px] text-[#8B8983]">All amounts in USD</div>
            </div>
            <div className="divide-y divide-[#F0EDE3]">
              {[
                { acct: '4000 — Revenue', oct: 1240500, nov: 1396200, var: 12.5, flag: false },
                { acct: '5100 — COGS', oct: 487300, nov: 521800, var: 7.1, flag: false },
                { acct: '6200 — Travel & Entertainment', oct: 18400, nov: 31200, var: 69.6, flag: true },
                { acct: '6300 — SaaS Subscriptions', oct: 42100, nov: 47800, var: 13.5, flag: false },
                { acct: '7100 — Professional Fees', oct: 24500, nov: 18200, var: -25.7, flag: false },
              ].map((row, i) => (
                <div key={i} className={`px-5 py-3 flex items-center gap-4 ${row.flag ? 'bg-[#FDF6E9]' : ''}`}>
                  <div className="flex-1 text-[12.5px] font-medium">{row.acct}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="w-28 text-right text-[12px] text-[#5A5854]">${row.oct.toLocaleString()}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="w-28 text-right text-[12px] font-medium">${row.nov.toLocaleString()}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className={`w-20 text-right text-[12px] font-medium ${row.var > 0 ? (row.flag ? 'text-[#A8482E]' : 'text-[#2F6B4D]') : 'text-[#5A5854]'}`}>
                    {row.var > 0 ? '+' : ''}{row.var}%
                  </div>
                  {row.flag && <AlertTriangle size={13} className="text-[#A67C4E]" />}
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies */}
          <div className="bg-white border border-[#E8E4DA]" style={{ borderRadius: '4px' }}>
            <div className="px-5 py-4 border-b border-[#E8E4DA] flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#8B8983] font-semibold flex items-center gap-2">
                  <Activity size={11} /> Live Anomaly Detection
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '17px' }} className="mt-0.5">3 items need review</div>
              </div>
              <div className="text-[11px] text-[#5A5854]">Scanning 100% of transactions</div>
            </div>
            <div className="divide-y divide-[#F0EDE3]">
              {[
                { sev: 'high', title: 'New vendor without PO', body: '$8,400 invoice from Stratus Cloud — no matching purchase order in system.', icon: AlertTriangle },
                { sev: 'med', title: 'T&E spike vs. headcount', body: 'T&E up 70% MoM but headcount unchanged. Likely driver: Q4 sales kickoff (3 events).', icon: TrendingUp },
                { sev: 'low', title: 'Missing receipt', body: 'Recurring AWS charge ($4,200) lacks an attached invoice document for November.', icon: FileText },
              ].map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-[#FAFAF7]">
                    <div className={`w-7 h-7 flex items-center justify-center mt-0.5 ${
                      a.sev === 'high' ? 'bg-[#F5E8E2]' : a.sev === 'med' ? 'bg-[#FDF6E9]' : 'bg-[#F5F2EA]'
                    }`} style={{ borderRadius: '50%' }}>
                      <Icon size={13} className={
                        a.sev === 'high' ? 'text-[#A8482E]' : a.sev === 'med' ? 'text-[#A67C4E]' : 'text-[#8B8983]'
                      } />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold mb-0.5">{a.title}</div>
                      <div className="text-[12px] text-[#5A5854] leading-relaxed">{a.body}</div>
                    </div>
                    <button className="text-[11px] text-[#5A5854] hover:text-[#1A1A1A] px-3 py-1 border border-[#E8E4DA] hover:border-[#A67C4E]" style={{ borderRadius: '3px' }}>Review</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right col: Narrative Generator */}
        <div className="col-span-1">
          <div className="bg-white border border-[#E8E4DA] sticky top-0" style={{ borderRadius: '4px' }}>
            <div className="px-5 py-4 border-b border-[#E8E4DA]">
              <div className="text-[10px] uppercase tracking-widest text-[#8B8983] font-semibold flex items-center gap-2">
                <Sparkles size={11} className="text-[#A67C4E]" /> Narrative Generator
              </div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: '17px' }} className="mt-0.5">MD&A Draft</div>
              <div className="text-[11px] text-[#8B8983] mt-1">Auto-generated from variance + anomaly data</div>
            </div>

            <div className="p-5">
              {!narrativeDone && !narrativeGenerating && (
                <button onClick={generateNarrative} className="w-full bg-[#1A1A1A] text-white py-3 text-[12px] font-semibold hover:bg-[#262624] flex items-center justify-center gap-2" style={{ borderRadius: '3px' }}>
                  <Sparkles size={13} /> Generate first draft
                </button>
              )}

              {narrativeGenerating && (
                <div className="py-6 text-center">
                  <div className="inline-flex items-center gap-2 text-[12px] text-[#5A5854] mb-3">
                    <div className="w-2 h-2 bg-[#D4A574] animate-pulse" style={{ borderRadius: '50%' }} />
                    Drafting commentary…
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-[#F0EDE3] animate-pulse" />
                    <div className="h-2 bg-[#F0EDE3] animate-pulse w-5/6" />
                    <div className="h-2 bg-[#F0EDE3] animate-pulse w-3/4" />
                    <div className="h-2 bg-[#F0EDE3] animate-pulse w-4/5" />
                  </div>
                </div>
              )}

              {narrativeDone && (
                <div>
                  <div className="text-[12.5px] leading-[1.7] text-[#1A1A1A] space-y-3" style={{ fontFamily: "'Fraunces', serif" }}>
                    <p>
                      <strong>Revenue grew 12.5%</strong> month-over-month, driven primarily by a <span className="bg-[#F9F6EC] px-0.5 cursor-pointer hover:bg-[#F0E8D0]" title="Click to see source transactions">strong close in the enterprise segment</span> — three deals closed in the final week of November, contributing approximately $94k in incremental revenue.
                    </p>
                    <p>
                      <strong>Operating expenses rose moderately</strong>, with one notable variance: <span className="bg-[#FDF6E9] px-0.5 cursor-pointer hover:bg-[#F8E8C8]" title="T&E breakdown">Travel & Entertainment</span> increased 69.6% to $31,200 due to the annual sales kickoff event (3 multi-day offsites). This is a non-recurring driver and is consistent with the FY budget.
                    </p>
                    <p>
                      <strong>Three items remain under review</strong> as part of the anomaly detection pipeline. Most material is an $8,400 invoice from a new vendor without a corresponding purchase order, currently pending category assignment.
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#F0EDE3] flex items-center gap-2">
                    <button className="flex-1 bg-[#1A1A1A] text-white py-2 text-[11px] font-medium hover:bg-[#262624] flex items-center justify-center gap-1.5" style={{ borderRadius: '3px' }}>
                      <FileCheck size={11} /> Send to manager
                    </button>
                    <button className="px-3 py-2 border border-[#E8E4DA] text-[11px] hover:border-[#A67C4E]" style={{ borderRadius: '3px' }}>Edit</button>
                  </div>

                  <div className="mt-3 text-[10px] text-[#8B8983] flex items-center gap-1.5">
                    <Lock size={10} />
                    Every claim links to its source transaction. Audit trail preserved.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= DASHBOARD VIEW =============
function DashboardView() {
  const W = 560, H = 140;
  const rev  = [42,58,51,67,62,78,72,91,84,102,94,112];
  const sust = [18,21,24,27,23,31,34,37,32,44,40,47];
  const mx   = 120;
  const toPath = pts => pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i/(pts.length-1))*W} ${H-(v/mx)*H}`).join(' ');

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-widest text-[#8B8983] mb-1">Analytics</div>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontWeight:500, fontSize:34, lineHeight:1.1, letterSpacing:'-0.025em' }} className="text-[#1A1A1A]">
          Intelligent Analytics View
        </h1>
      </div>

      <div className="flex gap-2 mb-6">
        {['Last 30 Days','Last Quarter','YTD','All Time'].map((t,i) => (
          <button key={t} className={`px-3 py-1 text-[12px] transition-colors ${i===0 ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E8E4DA] text-[#5A5854] hover:border-[#A67C4E]'}`} style={{borderRadius:3}}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Charts column */}
        <div className="col-span-2 space-y-5">
          {/* Revenue chart */}
          <div className="bg-white border border-[#E8E4DA]" style={{borderRadius:4}}>
            <div className="px-5 py-4 border-b border-[#E8E4DA] flex items-center justify-between">
              <div style={{fontFamily:"'Fraunces',serif",fontWeight:500,fontSize:16}}>Revenue & Sustainable Growth Trajectory</div>
              <div className="flex gap-4 text-[11px] text-[#5A5854]">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#A67C4E]"/>Revenue (USD)</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#2F6B4D]"/>Sustainable Growth Index (%)</div>
              </div>
            </div>
            <div className="px-5 pt-4 pb-3">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:140}}>
                {[0.25,0.5,0.75,1].map(f=>(
                  <line key={f} x1="0" y1={H*(1-f)} x2={W} y2={H*(1-f)} stroke="#F0EDE3" strokeWidth="1"/>
                ))}
                <path d={toPath(rev)}  fill="none" stroke="#A67C4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d={toPath(sust)} fill="none" stroke="#2F6B4D" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3"/>
              </svg>
              <div className="flex justify-between mt-1 text-[10px] text-[#8B8983]">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m=><span key={m}>{m}</span>)}
              </div>
              <div className="flex gap-8 mt-3 pt-3 border-t border-[#F0EDE3]">
                <div>
                  <div className="text-[10px] text-[#8B8983] uppercase tracking-wider mb-0.5">Current Month</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:600}} className="text-[#A67C4E]">$38,588</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8B8983] uppercase tracking-wider mb-0.5">YoY Change</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:600}} className="text-[#2F6B4D]">+12.25%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio distribution */}
          <div className="bg-white border border-[#E8E4DA]" style={{borderRadius:4}}>
            <div className="px-5 py-4 border-b border-[#E8E4DA]">
              <div style={{fontFamily:"'Fraunces',serif",fontWeight:500,fontSize:16}}>Real-Time Portfolio Distribution</div>
            </div>
            <div className="p-5 flex items-center gap-8">
              <div className="relative flex-shrink-0" style={{width:110,height:110}}>
                <svg viewBox="0 0 42 42" style={{width:110,height:110,transform:'rotate(-90deg)'}}>
                  {(() => {
                    const segs=[{pct:40,c:'#2F6B4D'},{pct:25,c:'#A67C4E'},{pct:20,c:'#3B4F8C'},{pct:10,c:'#8B8983'},{pct:5,c:'#C4C0B6'}];
                    const circ=2*Math.PI*15.9155; let off=0;
                    return segs.map((s,i)=>{
                      const el=<circle key={i} cx="21" cy="21" r="15.9155" fill="transparent" stroke={s.c}
                        strokeWidth="8" strokeDasharray={`${(s.pct/100)*circ} ${circ}`}
                        strokeDashoffset={-(off/100)*circ}/>;
                      off+=s.pct; return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700}}>$1.5M</div>
                  <div className="text-[9px] text-[#8B8983]">Total</div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {[
                  {label:'Green Bonds',pct:40,c:'#2F6B4D'},
                  {label:'Renewable Energy',pct:25,c:'#A67C4E'},
                  {label:'AI Funds',pct:20,c:'#3B4F8C'},
                  {label:'Water Tech',pct:10,c:'#8B8983'},
                  {label:'Other',pct:5,c:'#C4C0B6'},
                ].map(item=>(
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:item.c}}/>
                    <div className="text-[12px] text-[#5A5854] w-36">{item.label} ({item.pct}%)</div>
                    <div className="flex-1 h-1.5 bg-[#F0EDE3] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${item.pct*2.4}%`,background:item.c}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-1 space-y-4">
          {/* AI Insights */}
          <div className="bg-[#0F0F0E] text-[#E8E6DF]" style={{borderRadius:4}}>
            <div className="px-4 py-3 border-b border-[#262624] flex items-center justify-between">
              <div style={{fontFamily:"'Fraunces',serif",fontWeight:500,fontSize:15}}>AI Insights</div>
              <Sparkles size={13} className="text-[#D4A574]"/>
            </div>
            <div className="p-4 space-y-3">
              {[
                {type:'AI Suggestion',body:'Allocate 2% to Green Bonds for balanced growth.',color:'#D4A574'},
                {type:'AI Alert',body:'Consider trimming exposure to high-volatility assets.',color:'#E8B574'},
                {type:'AI Opportunity',body:'Emerging green-tech ETF detected.',color:'#7FB897',action:'Explore Now'},
              ].map((ins,i)=>(
                <div key={i} className="bg-[#1A1A18] p-3" style={{borderRadius:3}}>
                  <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{color:ins.color}}>{ins.type}</div>
                  <div className="text-[11px] text-[#C8C5BE] leading-relaxed">{ins.body}</div>
                  {ins.action && <button className="mt-1.5 text-[10px] hover:underline" style={{color:ins.color}}>{ins.action} →</button>}
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white border border-[#E8E4DA]" style={{borderRadius:4}}>
            <div className="px-4 py-3 border-b border-[#E8E4DA]">
              <div style={{fontFamily:"'Fraunces',serif",fontWeight:500,fontSize:15}}>Activity Feed</div>
            </div>
            <div className="divide-y divide-[#F0EDE3]">
              {[
                {emoji:'📈',label:'Bought 500 units of GNRG ETF',time:'5 min ago',c:'#2F6B4D'},
                {emoji:'💰',label:'Received dividend from MTR Tech',time:'32 min ago',c:'#A67C4E'},
                {emoji:'⚡',label:'AI rebalancing executed for Portfolio A',time:'1 hr ago',c:'#3B4F8C'},
                {emoji:'📉',label:'Sold 100 units of TSLA',time:'3 hr ago',c:'#A8482E'},
              ].map((item,i)=>(
                <div key={i} className="px-4 py-2.5 flex items-start gap-3 hover:bg-[#FAFAF7]">
                  <div className="text-[16px] mt-0.5">{item.emoji}</div>
                  <div className="flex-1">
                    <div className="text-[12px] text-[#1A1A1A] leading-snug">{item.label}</div>
                    <div className="text-[10px] text-[#8B8983] mt-0.5">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= AI CONCIERGE VIEW =============
function ConciergeView() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from:'ai',   text:"Hello! I'm your personal financial analyst. How can I assist you today?" },
    { from:'user', text:'Can you give me an update on my sustainable tech portfolio?' },
    { from:'ai',   text:"Certainly! Based on real-time data, your green-tech investments are performing strongly. Would you like a detailed breakdown or a market forecast?" },
  ]);

  const send = () => {
    if (!input.trim()) return;
    const q = input;
    setInput('');
    setMessages(m => [...m, { from:'user', text:q }]);
    setTimeout(() => setMessages(m => [...m, { from:'ai', text:"I'm analyzing your portfolio in real-time. Your green-tech holdings show a +8.4% gain this month, driven by renewable energy funds. Shall I generate a detailed report?" }]), 700);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-[#1A1A1A] items-center justify-center mb-4" style={{borderRadius:'50%'}}>
              <MessageSquare size={26} className="text-[#D4A574]" strokeWidth={1.5}/>
            </div>
            <h1 style={{fontFamily:"'Fraunces',serif",fontWeight:500,fontSize:36,letterSpacing:'-0.025em'}} className="text-[#1A1A1A]">
              24/7 AI Concierge
            </h1>
            <p className="text-[13px] text-[#8B8983] mt-1">Your personal financial analyst, always on.</p>
          </div>

          <div className="space-y-4 mb-6">
            {messages.map((msg,i)=>(
              <div key={i} className={`flex ${msg.from==='user' ? 'justify-end' : 'justify-start'}`}>
                {msg.from==='ai' && (
                  <div className="w-7 h-7 bg-[#1A1A1A] flex items-center justify-center mr-2 mt-1 flex-shrink-0" style={{borderRadius:'50%'}}>
                    <Sparkles size={12} className="text-[#D4A574]"/>
                  </div>
                )}
                <div className={`max-w-[82%] px-4 py-2.5 text-[13px] leading-relaxed ${msg.from==='user' ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E8E4DA] text-[#1A1A1A]'}`} style={{borderRadius:8}}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {['Analyze my portfolio','Explain market trends','Review tax optimization','Suggest green investments'].map(action=>(
              <button key={action}
                onClick={() => { setMessages(m=>[...m,{from:'user',text:action}]); setTimeout(()=>setMessages(m=>[...m,{from:'ai',text:`I'll work on "${action}" for you right away. Give me a moment to gather the latest data…`}]),600); }}
                className="px-3 py-1.5 bg-white border border-[#E8E4DA] text-[12px] text-[#5A5854] hover:border-[#A67C4E] hover:text-[#A67C4E] transition-colors"
                style={{borderRadius:20}}>{action}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#E8E4DA] bg-white p-4 flex-shrink-0">
        <div className="max-w-xl mx-auto flex gap-3">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder="Ask me anything…"
            className="flex-1 px-4 py-2.5 border border-[#E8E4DA] text-[13px] outline-none focus:border-[#A67C4E] placeholder:text-[#8B8983]"
            style={{borderRadius:4,fontFamily:"'DM Sans',sans-serif"}}/>
          <button onClick={send} className="px-5 py-2.5 bg-[#1A1A1A] text-white text-[13px] font-semibold hover:bg-[#A67C4E] transition-colors flex items-center gap-2" style={{borderRadius:4}}>
            <ArrowRight size={14}/> Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ============= INCENTIVE CALCULATOR VIEW =============
function IncentiveCalculatorView() {
  const [dept, setDept]     = useState('Sales');
  const [salary, setSalary] = useState('6500');
  const [months, setMonths] = useState('8');
  const [target, setTarget] = useState('1200000');
  const [actual, setActual] = useState('1380000');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const base = parseFloat(salary) || 0;
    const mo   = parseFloat(months) || 12;
    const tgt  = parseFloat(target) || 1;
    const act  = parseFloat(actual) || 0;
    const ach  = act / tgt;
    const mult = ach >= 1.1 ? 1.5 : ach >= 1.05 ? 1.25 : ach >= 1.0 ? 1.0 : ach >= 0.95 ? 0.75 : ach >= 0.9 ? 0.5 : 0;
    setResult({ incentive: base*(mo/12)*mult, achievement: (ach*100).toFixed(1) });
  };

  const tiers = [
    {label:'Below 90%',pct:0},{label:'90%–95%',pct:30},{label:'95%–100%',pct:55},
    {label:'100%',pct:70},{label:'105% — 110% Incentive',pct:85},{label:'110%',pct:92},{label:'115%+',pct:100},
  ];

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="mb-7">
        <div className="text-[11px] uppercase tracking-widest text-[#8B8983] mb-1">Tools</div>
        <h1 style={{fontFamily:"'Fraunces',serif",fontWeight:500,fontSize:34,lineHeight:1.1,letterSpacing:'-0.025em'}} className="text-[#1A1A1A]">
          Smart Incentive Calculator
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-white border border-[#E8E4DA] p-6" style={{borderRadius:4}}>
          <div className="text-[12px] font-semibold uppercase tracking-widest text-[#8B8983] mb-3">Department Selection</div>
          <div className="flex gap-2 flex-wrap mb-6">
            {['Sales','Health Club','SPA','C&E'].map(d=>(
              <button key={d} onClick={()=>setDept(d)}
                className={`px-4 py-2 text-[13px] border transition-all ${dept===d ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-[#5A5854] border-[#E8E4DA] hover:border-[#A67C4E]'}`}
                style={{borderRadius:3}}>{d}</button>
            ))}
          </div>

          <div className="text-[12px] font-semibold uppercase tracking-widest text-[#8B8983] mb-3">Input Fields</div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            {[
              {label:'Basic Salary',value:salary,set:setSalary,pre:'$'},
              {label:'Months Served',value:months,set:setMonths,pre:''},
              {label:'Revenue — BOY Target',value:target,set:setTarget,pre:'$'},
              {label:'Revenue — Actual Achieved',value:actual,set:setActual,pre:'$'},
            ].map(f=>(
              <div key={f.label}>
                <div className="text-[11px] text-[#8B8983] mb-1.5">{f.label}</div>
                <div className="relative">
                  {f.pre && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8983] text-[13px]">{f.pre}</span>}
                  <input value={f.value} onChange={e=>f.set(e.target.value)}
                    className={`w-full border border-[#E8E4DA] py-2 text-[13px] outline-none focus:border-[#A67C4E] bg-[#FAFAF7] ${f.pre ? 'pl-6 pr-3' : 'px-3'}`}
                    style={{borderRadius:3,fontFamily:"'JetBrains Mono',monospace"}}/>
                </div>
              </div>
            ))}
          </div>

          <button onClick={calculate}
            className="w-full bg-[#1A1A1A] text-white py-3 text-[13px] font-semibold hover:bg-[#A67C4E] transition-colors flex items-center justify-center gap-2"
            style={{borderRadius:3}}>
            <TrendingUp size={14}/> Calculate Incentive
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E4DA] p-6 text-center" style={{borderRadius:4}}>
            <div className="text-[11px] uppercase tracking-widest text-[#8B8983] mb-4">Results</div>
            {result ? (
              <>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:40,fontWeight:600,color:'#A67C4E',letterSpacing:'-0.03em',lineHeight:1.1}}>
                  Incentive: ${Math.round(result.incentive).toLocaleString()}
                </div>
                <div className="text-[12px] text-[#8B8983] mt-2">Calculated AI Payout · Achievement {result.achievement}%</div>
              </>
            ) : (
              <div className="py-8 text-[#C4C0B6] text-[13px]">Enter values above and calculate to see results</div>
            )}
          </div>

          <div className="bg-white border border-[#E8E4DA] p-6" style={{borderRadius:4}}>
            <div className="text-[12px] font-semibold uppercase tracking-widest text-[#8B8983] mb-4">Achievement Tiers</div>
            <div className="space-y-3">
              {tiers.map((tier,i)=>{
                const active = result && tier.pct > 0 && parseFloat(result.achievement) >= (i*15+75);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-[11px] text-[#5A5854] w-44 flex-shrink-0">{tier.label}</div>
                    <div className="flex-1 h-2 bg-[#F0EDE3] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{width:`${tier.pct}%`, background: active ? '#A67C4E' : '#1A1A1A', opacity: tier.pct===0 ? 0.15 : active ? 1 : 0.55}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
