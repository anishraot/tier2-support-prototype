import React, { useState, useMemo } from 'react';

const TICKETS = [
  { id: "T-1041", subject: "SSO login broken — all 200 users locked out", priority: "P1", status: "open", customer: "Acme Corp", plan: "Enterprise", mrr: 4200, tenure: "2.1 yrs", prevTickets: 3, slaMin: -8, vip: true, category: "SSO / Auth", tags: ["sso", "auth", "critical"],
    messages: [
      { role: "customer", name: "James Whitfield", time: "8:02 AM", text: "Our entire team is locked out. SSO stopped working after your update last night. This is a P1 — we have a board meeting in 2 hours." },
      { role: "agent", name: "Tier 1 — Sara", time: "8:15 AM", text: "Hi James, I've checked the SSO config in your admin panel. Settings look correct on our end. I'm escalating to Tier 2 for deeper investigation." },
      { role: "system", name: "System", time: "8:16 AM", text: "Ticket escalated to Tier 2. SLA breach imminent." },
    ]
  },
  { id: "T-1038", subject: "API returning 403 on /v2/exports endpoint", priority: "P2", status: "open", customer: "Meridian Health", plan: "Pro", mrr: 890, tenure: "8 mo", prevTickets: 1, slaMin: 34, vip: false, category: "API", tags: ["api", "403", "exports"],
    messages: [
      { role: "customer", name: "Priya Nair", time: "7:30 AM", text: "We're getting a 403 Forbidden on POST /v2/exports since yesterday. Our data pipeline is broken. Error: 'Insufficient permissions for bulk export'." },
      { role: "agent", name: "Tier 1 — Marco", time: "7:55 AM", text: "Hi Priya, I tried reproducing this. The permissions for the exports endpoint seem related to a recent role-based access change. Escalating to Tier 2." },
    ]
  },
  { id: "T-1035", subject: "Webhook payload not matching docs — missing fields", priority: "P2", status: "open", customer: "Stackline", plan: "Pro", mrr: 1100, tenure: "1.3 yrs", prevTickets: 5, slaMin: 67, vip: false, category: "Webhooks", tags: ["webhooks", "api", "docs"],
    messages: [
      { role: "customer", name: "Devon Park", time: "6:15 AM", text: "The 'order.completed' webhook is missing the 'line_items' and 'metadata' fields. Our integration depends on these. This was working fine until 3 days ago." },
    ]
  },
  { id: "T-1032", subject: "Bulk CSV export timing out on files over 50MB", priority: "P3", status: "open", customer: "Brightwave Analytics", plan: "Growth", mrr: 420, tenure: "5 mo", prevTickets: 2, slaMin: 180, vip: false, category: "Export", tags: ["export", "timeout", "bug"],
    messages: [
      { role: "customer", name: "Alice Cho", time: "5:00 AM", text: "Every time I try to export a dataset larger than ~50MB, the export just spins and times out after 90 seconds. Smaller exports work fine." },
    ]
  },
  { id: "T-1029", subject: "Custom domain not resolving after CNAME update", priority: "P3", status: "open", customer: "Novo Finance", plan: "Growth", mrr: 380, tenure: "3 mo", prevTickets: 0, slaMin: 220, vip: false, category: "DNS / Domains", tags: ["dns", "domain", "setup"],
    messages: [
      { role: "customer", name: "Rafael Santos", time: "4:10 AM", text: "I followed your docs to add a CNAME record for our custom domain. DNS has propagated (checked with dig) but the portal still shows an error: 'Domain not verified'." },
    ]
  },
  { id: "T-1027", subject: "2FA code not accepted — account locked", priority: "P2", status: "pending", customer: "TrueNorth Legal", plan: "Enterprise", mrr: 3100, tenure: "1.8 yrs", prevTickets: 2, slaMin: 15, vip: true, category: "Auth / 2FA", tags: ["2fa", "auth", "account-locked"],
    messages: [
      { role: "customer", name: "Morgan Lee", time: "Yesterday 4:45 PM", text: "Our CTO can't log in — the 2FA code from the authenticator app isn't accepted. We've tried resync. Account is now locked after 5 attempts." },
      { role: "agent", name: "Tier 1 — Sara", time: "Yesterday 5:00 PM", text: "I can see the account is locked. I've unlocked it but the 2FA issue persists — escalating." },
    ]
  },
  { id: "T-1024", subject: "Report builder not saving custom filters", priority: "P3", status: "open", customer: "Harlow Media", plan: "Starter", mrr: 120, tenure: "2 mo", prevTickets: 1, slaMin: 310, vip: false, category: "Reports", tags: ["reports", "ui-bug"],
    messages: [
      { role: "customer", name: "Ben Harlow", time: "Yesterday 2:00 PM", text: "When I save a custom report with multiple filters, the filters don't persist. Next time I open the report, it's back to default." },
    ]
  },
  { id: "T-1021", subject: "Billing charged twice for March — duplicate invoice", priority: "P2", status: "open", customer: "Cascade Labs", plan: "Pro", mrr: 760, tenure: "11 mo", prevTickets: 3, slaMin: 42, vip: false, category: "Billing", tags: ["billing", "duplicate"],
    messages: [
      { role: "customer", name: "Yuki Tanaka", time: "Yesterday 1:00 PM", text: "We were charged twice for March — $760 on March 1 and again on March 5. Both appear on our statement." },
    ]
  },
  { id: "T-1018", subject: "Data import failing for rows with special characters", priority: "P3", status: "open", customer: "Pebble CRM", plan: "Growth", mrr: 290, tenure: "4 mo", prevTickets: 0, slaMin: 450, vip: false, category: "Import", tags: ["import", "encoding", "bug"],
    messages: [
      { role: "customer", name: "Chloe Martin", time: "Yesterday 10:00 AM", text: "Importing our customer list fails whenever a row contains accented characters (é, ü, ñ) or an ampersand. The error says 'Malformed CSV row 24'." },
    ]
  },
  { id: "T-1014", subject: "User roles not applying correctly after team invite", priority: "P3", status: "resolved", customer: "Fieldwork Co", plan: "Starter", mrr: 80, tenure: "1 mo", prevTickets: 0, slaMin: 600, vip: false, category: "Permissions", tags: ["permissions", "roles", "resolved"],
    messages: [
      { role: "customer", name: "Sam Osei", time: "2 days ago", text: "New team members invited as 'Viewer' but they have full edit access." },
      { role: "agent", name: "Tier 2 — You", time: "2 days ago", text: "Hi Sam, confirmed the bug — new invites via the bulk invite flow weren't inheriting the role correctly. Fixed in your account. Patch deploying globally this week." },
    ]
  },
  { id: "T-1011", subject: "Email notifications stopped firing after workflow update", priority: "P2", status: "open", customer: "Orbit Logistics", plan: "Pro", mrr: 670, tenure: "9 mo", prevTickets: 4, slaMin: 28, vip: false, category: "Notifications", tags: ["notifications", "email", "workflow"],
    messages: [
      { role: "customer", name: "Dana Kim", time: "Today 6:00 AM", text: "After updating our automation workflow yesterday, outbound email notifications have completely stopped. The workflow shows 'Active' but no emails are firing." },
    ]
  },
  { id: "T-1008", subject: "SAML metadata upload failing — XML parse error", priority: "P1", status: "open", customer: "Fortis Bank", plan: "Enterprise", mrr: 8400, tenure: "3.2 yrs", prevTickets: 7, slaMin: -22, vip: true, category: "SSO / Auth", tags: ["saml", "sso", "enterprise"],
    messages: [
      { role: "customer", name: "Claire Bergmann", time: "Yesterday 9:00 PM", text: "We're trying to reconfigure our SAML IdP after rotating certificates. Every time we upload the new XML metadata, we get 'XML Parse Error: Invalid signature element'." },
      { role: "agent", name: "Tier 1 — Marco", time: "Yesterday 9:20 PM", text: "I've tried re-uploading a few formats. Same error each time. This needs Tier 2 to look at the raw XML parsing logic." },
    ]
  },
  { id: "T-1005", subject: "Dashboard loading blank for one specific user", priority: "P3", status: "open", customer: "Maple Ventures", plan: "Growth", mrr: 310, tenure: "6 mo", prevTickets: 1, slaMin: 280, vip: false, category: "UI Bug", tags: ["dashboard", "ui", "user-specific"],
    messages: [
      { role: "customer", name: "Tom Nakata", time: "Today 7:30 AM", text: "One of our users (lisa@mapleventures.com) sees a completely blank dashboard after login. Everyone else on our team is fine. Tried on two browsers, same result." },
    ]
  },
  { id: "T-1002", subject: "Can't add custom fields to the contact object", priority: "P4", status: "open", customer: "Sprout CRM", plan: "Starter", mrr: 60, tenure: "2 wk", prevTickets: 0, slaMin: 720, vip: false, category: "Config", tags: ["config", "custom-fields"],
    messages: [
      { role: "customer", name: "Ali Hassan", time: "Today 8:00 AM", text: "How do I add a custom field to the Contact object? I can't find the option in settings." },
    ]
  },
  { id: "T-0999", subject: "Rate limiting hitting at unexpectedly low thresholds", priority: "P2", status: "open", customer: "Quantum IO", plan: "Pro", mrr: 950, tenure: "1.1 yrs", prevTickets: 2, slaMin: 55, vip: false, category: "API", tags: ["api", "rate-limit", "performance"],
    messages: [
      { role: "customer", name: "Neha Sharma", time: "Today 7:00 AM", text: "We're hitting 429 rate limit errors at about 40 requests/min, but our plan says 100 req/min. This started happening since last Wednesday." },
    ]
  },
];

const KB_ARTICLES = [
  { id: 1, title: "Troubleshooting SSO / SAML configuration errors", tag: "Auth", body: "Check IdP metadata XML for correct certificate format. Common issues: expired certs, incorrect ACS URL, clock skew >5min. Verify attribute mapping includes email claim." },
  { id: 2, title: "Resolving 403 errors on the exports API endpoint", tag: "API", body: "403 on /v2/exports typically means the API token lacks the 'export:read' scope. Re-generate a token with correct scopes in Settings > API Keys. Enterprise plans also require the 'bulk_export' feature flag." },
  { id: 3, title: "How to unlock a locked user account and reset 2FA", tag: "Auth", body: "In Admin > Users, search for the user and click 'Unlock Account'. To reset 2FA: click 'Reset MFA' — user will be prompted to re-enroll on next login. For authenticator sync issues, advise user to check device time sync." },
  { id: 4, title: "Webhook payload field reference and changelog", tag: "Webhooks", body: "As of v2.3, the order.completed event includes: id, status, amount, customer, line_items, metadata, timestamps. The 'line_items' field was removed in v2.1 and re-added in v2.4. Check your webhook subscription version in Settings > Webhooks." },
  { id: 5, title: "CSV import encoding requirements", tag: "Import", body: "The importer expects UTF-8 encoding. Files saved from Excel default to Windows-1252, which breaks on accented characters. Advise customer to re-save as UTF-8 CSV. Ampersands must not be HTML-escaped in raw CSV." },
  { id: 6, title: "Custom domain CNAME verification troubleshooting", tag: "DNS", body: "After CNAME propagation, verification can take up to 10 min on our side. If still failing: (1) confirm CNAME points to app.yourplatform.com, (2) check for conflicting A records, (3) use 'Reverify' button in Settings > Domains." },
  { id: 7, title: "Bulk export timeout — known issue and workaround", tag: "Export", body: "Exports >50MB time out at the 90s gateway limit. Workaround: use date-range filters to split into <30MB chunks. Engineering is tracking this as BUG-2847. ETA for fix: Q2." },
  { id: 8, title: "Billing duplicate charge — refund process", tag: "Billing", body: "Duplicate charges occur when a payment retry fires within the same billing cycle. To refund: Admin > Billing > Invoices > find duplicate > 'Issue Refund'. Log in Stripe with reference number. Send customer confirmation email." },
  { id: 9, title: "Email notification workflow — debugging guide", tag: "Notifications", body: "Check: (1) workflow trigger conditions, (2) email action 'To' field is not blank, (3) sending domain is verified in Settings > Email. Common cause: workflow update clears the From address. Re-enter and save." },
  { id: 10, title: "Rate limit tiers by plan and how to debug 429s", tag: "API", body: "Starter: 20 req/min. Growth: 60 req/min. Pro: 100 req/min. Enterprise: custom. If customer reports hitting limits below their plan cap, check for concurrent connections counting against the same token." },
];

const MACROS = [
  { id: "m1", label: "Acknowledgment + investigation in progress", text: "Hi {name},\n\nThank you for reaching out. I'm a Tier 2 agent and I've just picked up your ticket.\n\nI can see the issue you're describing and I'm investigating now. I'll have an update for you within {timeframe}.\n\nBest,\n[Your name]" },
  { id: "m2", label: "Resolution — issue fixed", text: "Hi {name},\n\nI've resolved the issue on your account. Here's what I found and what I did:\n\n[Root cause]\n[Fix applied]\n\nPlease test and let me know if everything is working as expected. I'll leave this ticket open for 24 hours.\n\nBest,\n[Your name]" },
  { id: "m3", label: "Escalation to engineering — customer update", text: "Hi {name},\n\nI've confirmed this is a bug on our end and I've escalated it to our engineering team with full reproduction steps. Reference: [ENG-XXXX].\n\nExpected update: [timeframe]. I'll personally follow up as soon as we have a resolution.\n\nSorry for the disruption.\n\nBest,\n[Your name]" },
  { id: "m4", label: "Needs more info from customer", text: "Hi {name},\n\nThank you for the report. To investigate further, could you provide:\n\n1. The exact error message you're seeing\n2. Steps to reproduce the issue\n3. Which browser/OS you're using\n4. Approximate time the issue started\n\nLooking forward to getting this resolved for you.\n\nBest,\n[Your name]" },
  { id: "m5", label: "Workaround available — bug confirmed", text: "Hi {name},\n\nI've confirmed this is a known issue (BUG-XXXX) our team is actively working on.\n\nIn the meantime, here's a workaround:\n[Workaround steps]\n\nI'll notify you as soon as the fix is deployed. Thank you for your patience.\n\nBest,\n[Your name]" },
];

function getSLAClass(min) {
  if (min < 0) return "sla-breach";
  if (min < 60) return "sla-warn";
  return "sla-ok";
}
function getSLAText(min) {
  if (min < 0) return `${Math.abs(min)}m overdue`;
  if (min < 60) return `${min}m left`;
  const h = Math.floor(min / 60); const m = min % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ""}`;
}
function getSLATextClass(min) {
  if (min < 0) return "sla-time sla-breach-text";
  if (min < 60) return "sla-time sla-warn-text";
  return "sla-time sla-ok-text";
}

export default function App() {
  const [activeTicket, setActiveTicket] = useState(TICKETS[0]);
  const [tab, setTab] = useState("ticket");
  const [kbQuery, setKbQuery] = useState("");
  const [selectedMacro, setSelectedMacro] = useState("");
  const [replyText, setReplyText] = useState("");
  const [escalateNote, setEscalateNote] = useState("");
  const [escalateChannel, setEscalateChannel] = useState("#eng-escalations");
  const [toast, setToast] = useState(null);
  const [ticketStates, setTicketStates] = useState({});
  const [selectedKBArticle, setSelectedKBArticle] = useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  const kbResults = useMemo(() => {
    if (!kbQuery.trim()) return KB_ARTICLES;
    const q = kbQuery.toLowerCase();
    return KB_ARTICLES.filter(a => a.title.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
  }, [kbQuery]);

  function handleMacro(e) {
    const m = MACROS.find(x => x.id === e.target.value);
    setSelectedMacro(e.target.value);
    if (m) setReplyText(m.text.replace("{name}", activeTicket.customer).replace("{timeframe}", "1 hour"));
  }

  function handleSend() {
    if (!replyText.trim()) return;
    showToast("Reply sent — ticket updated");
    setReplyText(""); setSelectedMacro("");
  }

  function handleResolve() {
    setTicketStates(s => ({ ...s, [activeTicket.id]: "resolved" }));
    showToast("Ticket resolved — CSAT survey sent to customer");
  }

  function handleEscalate() {
    if (!escalateNote.trim()) return;
    showToast("Escalated — internal note created + Slack message sent");
    setEscalateNote("");
  }

  const openCount = TICKETS.filter(t => (ticketStates[t.id] || t.status) === "open").length;
  const breachCount = TICKETS.filter(t => t.slaMin < 0).length;
  const pendingCount = TICKETS.filter(t => (ticketStates[t.id] || t.status) === "pending").length;

  return (
    <div className="app">
      <div className="topbar">
        <span className="topbar-brand">SupportDesk Pro</span>
        <span className="topbar-sub">Tier 2 Workspace — Krama Capstone</span>
        <div className="topbar-stats">
          <span className="stat-pill" style={{ background: "#E6F1FB", color: "#185FA5" }}>{openCount} open</span>
          <span className="stat-pill" style={{ background: "#FAEEDA", color: "#854F0B" }}>{pendingCount} pending</span>
          <span className="stat-pill" style={{ background: "#FCEBEB", color: "#A32D2D" }}>{breachCount} SLA breach</span>
        </div>
      </div>

      <div className="main">
        <div className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">Ticket Queue ({TICKETS.length})</span>
          </div>
          <div className="ticket-list">
            {TICKETS.map(t => {
              const st = ticketStates[t.id] || t.status;
              return (
                <div key={t.id} className={`ticket-row ${getSLAClass(t.slaMin)}${activeTicket.id === t.id ? " active" : ""}`}
                  onClick={() => { setActiveTicket(t); setTab("ticket"); setReplyText(""); setSelectedMacro(""); }}>
                  <div className="t-top">
                    <span className="t-id">{t.id}</span>
                    <span className={`priority-badge ${t.priority.toLowerCase()}`}>{t.priority}</span>
                    {t.vip && <span className="vip-badge">VIP</span>}
                  </div>
                  <div className="t-subject">{t.subject}</div>
                  <div className="t-meta">
                    <span className={`status-dot dot-${st}`}></span>
                    <span>{t.customer}</span>
                    <span style={{ marginLeft: "auto" }} className={getSLATextClass(t.slaMin)}>{getSLAText(t.slaMin)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="content">
          <div className="tab-bar">
            <div className={`tab${tab === "ticket" ? " active" : ""}`} onClick={() => setTab("ticket")}>Ticket Detail</div>
            <div className={`tab${tab === "kb" ? " active" : ""}`} onClick={() => setTab("kb")}>Knowledge Base</div>
            <div className={`tab${tab === "escalate" ? " active" : ""}`} onClick={() => setTab("escalate")}>Escalate</div>
            <div className={`tab${tab === "eod" ? " active" : ""}`} onClick={() => setTab("eod")}>End-of-Day</div>
          </div>

          <div className="tab-content">
            {tab === "ticket" && (
              <div className="ticket-detail">
                <div className="conv-panel">
                  <div className="conv-header">
                    <div className="conv-title">{activeTicket.subject}</div>
                    <div className="conv-badges">
                      <span className={`badge badge-${activeTicket.priority === "P1" ? "red" : activeTicket.priority === "P2" ? "orange" : "gray"}`}>{activeTicket.priority}</span>
                      <span className="badge badge-blue">{activeTicket.category}</span>
                      {activeTicket.vip && <span className="badge badge-purple">VIP Account</span>}
                      <span className="badge badge-gray">{ticketStates[activeTicket.id] || activeTicket.status}</span>
                      <span className={`badge ${activeTicket.slaMin < 0 ? "badge-red" : activeTicket.slaMin < 60 ? "badge-orange" : "badge-green"}`}>
                        SLA: {getSLAText(activeTicket.slaMin)}
                      </span>
                    </div>
                  </div>
                  <div className="messages">
                    {activeTicket.messages.map((m, i) => (
                      <div key={i} className={`msg${m.role === "system" ? " system" : ""}`}>
                        <div className="msg-header">
                          <div className={`avatar av-${m.role === "customer" ? "customer" : m.role === "system" ? "system" : "agent"}`}>
                            {m.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </div>
                          <span className="msg-name">{m.name}</span>
                          <span className="msg-time">{m.time}</span>
                        </div>
                        <div className="msg-body">{m.text}</div>
                      </div>
                    ))}
                  </div>
                  <div className="compose-panel">
                    <div className="compose-title">Compose Reply</div>
                    <select value={selectedMacro} onChange={handleMacro}>
                      <option value="">— Select a macro / template —</option>
                      {MACROS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                    <textarea rows={5} placeholder="Type your reply or select a macro above..." value={replyText} onChange={e => setReplyText(e.target.value)} />
                    <div className="btn-row">
                      <button className="btn-primary" onClick={handleSend}>Send Reply</button>
                      <button className="btn-success" onClick={handleResolve}>Mark Resolved</button>
                      <button className="btn-warn" onClick={() => setTab("escalate")}>Escalate to Eng</button>
                    </div>
                  </div>
                </div>
                <div className="side-panel">
                  <div className="info-card">
                    <div className="info-card-title">Customer Account</div>
                    <div className="info-row"><span className="info-label">Company</span><span className="info-val">{activeTicket.customer}</span></div>
                    <div className="info-row"><span className="info-label">Plan</span><span className="info-val">{activeTicket.plan}</span></div>
                    <div className="info-row"><span className="info-label">MRR</span><span className="info-val">${activeTicket.mrr.toLocaleString()}</span></div>
                    <div className="info-row"><span className="info-label">Tenure</span><span className="info-val">{activeTicket.tenure}</span></div>
                    <div className="info-row"><span className="info-label">Prev tickets</span><span className="info-val">{activeTicket.prevTickets}</span></div>
                    <div className="info-row"><span className="info-label">VIP</span><span className="info-val">{activeTicket.vip ? "Yes" : "No"}</span></div>
                  </div>
                  <div className="info-card">
                    <div className="info-card-title">Tags</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {activeTicket.tags.map(t => <span key={t} className="badge badge-gray">{t}</span>)}
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-card-title">Quick KB Search</div>
                    <input className="kb-input" style={{ marginBottom: 8 }} placeholder="Search articles..." value={kbQuery} onChange={e => setKbQuery(e.target.value)} onClick={() => setTab("kb")} />
                    {kbResults.slice(0, 3).map(a => (
                      <div key={a.id} className="kb-article" onClick={() => { setTab("kb"); setSelectedKBArticle(a); }}>
                        <div className="kb-art-title">{a.title}</div>
                        <div className="kb-art-tag">{a.tag}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "kb" && (
              <div style={{ maxWidth: 680 }}>
                <input className="kb-input" placeholder="Search knowledge base..." value={kbQuery}
                  onChange={e => { setKbQuery(e.target.value); setSelectedKBArticle(null); }} style={{ marginBottom: 12 }} />
                {selectedKBArticle ? (
                  <div>
                    <button className="back-btn" onClick={() => setSelectedKBArticle(null)}>← Back to results</button>
                    <div className="info-card">
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                        <span className="badge badge-blue">{selectedKBArticle.tag}</span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{selectedKBArticle.title}</div>
                      <div style={{ fontSize: 13, lineHeight: 1.7 }}>{selectedKBArticle.body}</div>
                      <div className="btn-row" style={{ marginTop: 12 }}>
                        <button onClick={() => { setReplyText(prev => prev + "\n\n" + selectedKBArticle.body); setTab("ticket"); showToast("Article added to reply"); }}>
                          Insert into Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="kb-results">
                    {kbResults.length === 0 && <div className="empty-state">No articles match "{kbQuery}"</div>}
                    {kbResults.map(a => (
                      <div key={a.id} className="kb-article" onClick={() => setSelectedKBArticle(a)}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div className="kb-art-title">{a.title}</div>
                          <span className="badge badge-blue" style={{ marginLeft: "auto" }}>{a.tag}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#888", lineHeight: 1.5 }}>{a.body.slice(0, 100)}...</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "escalate" && (
              <div style={{ maxWidth: 600 }}>
                <div className="info-card" style={{ marginBottom: 12 }}>
                  <div className="info-card-title">Escalating: {activeTicket.id}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{activeTicket.subject}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{activeTicket.customer} · {activeTicket.plan} · ${activeTicket.mrr.toLocaleString()} MRR</div>
                </div>
                <div className="escalate-form" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 4 }}>Engineering channel</div>
                    <select value={escalateChannel} onChange={e => setEscalateChannel(e.target.value)}>
                      <option>#eng-escalations</option>
                      <option>#eng-auth</option>
                      <option>#eng-api</option>
                      <option>#eng-billing</option>
                      <option>#eng-infra</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 4 }}>Reproduction steps & context (required)</div>
                    <textarea rows={7}
                      placeholder={`Steps to reproduce:\n1. \n2. \n\nExpected behavior:\n\nActual behavior:\n\nAccount: ${activeTicket.customer} (${activeTicket.plan})\nError message: \n\nWhat Tier 1 tried: \n\nImpact: `}
                      value={escalateNote} onChange={e => setEscalateNote(e.target.value)} />
                  </div>
                  {escalateNote.trim() && (
                    <div className="slack-preview">
                      <div className="slack-channel">{escalateChannel}</div>
                      <div className="slack-msg">🔴 Tier 2 Escalation — {activeTicket.id}{"\n"}{activeTicket.subject}{"\n"}Customer: {activeTicket.customer} | {activeTicket.plan} | ${activeTicket.mrr.toLocaleString()} MRR{"\n\n"}{escalateNote}</div>
                    </div>
                  )}
                  <div className="btn-row">
                    <button className="btn-danger" onClick={handleEscalate} disabled={!escalateNote.trim()}>Post to Slack + Create Internal Note</button>
                    <button onClick={() => setTab("ticket")}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {tab === "eod" && (
              <div style={{ maxWidth: 640 }}>
                <div className="eod-grid">
                  <div className="metric-card"><div className="metric-val">18</div><div className="metric-label">Tickets handled today</div></div>
                  <div className="metric-card"><div className="metric-val">12</div><div className="metric-label">Resolved</div></div>
                  <div className="metric-card"><div className="metric-val">4.4</div><div className="metric-label">Avg CSAT (of 5)</div></div>
                  <div className="metric-card"><div className="metric-val">1h 42m</div><div className="metric-label">Avg first response</div></div>
                  <div className="metric-card"><div className="metric-val" style={{ color: "#E24B4A" }}>2</div><div className="metric-label">SLA breaches</div></div>
                  <div className="metric-card"><div className="metric-val">3</div><div className="metric-label">Escalated to Eng</div></div>
                </div>
                <div className="csat-bar-wrap">
                  <div className="csat-bar-title">CSAT by category</div>
                  {[["SSO / Auth", 92, "#185FA5"], ["API", 88, "#3B6D11"], ["Billing", 96, "#639922"], ["Export", 74, "#EF9F27"], ["UI Bug", 81, "#378ADD"]].map(([cat, pct, col]) => (
                    <div key={cat} className="csat-row">
                      <span className="csat-label">{cat}</span>
                      <div className="csat-bar-bg"><div className="csat-bar-fill" style={{ width: `${pct}%`, background: col }} /></div>
                      <span className="csat-pct">{pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="info-card">
                  <div className="info-card-title">Systemic issues to flag at standup</div>
                  <table className="systemic-table">
                    <thead><tr><th>Pattern</th><th>Count</th><th>Action</th></tr></thead>
                    <tbody>
                      <tr><td>SSO cert rotation failures</td><td>3 tickets</td><td><span className="badge badge-red">Flag for eng review</span></td></tr>
                      <tr><td>Bulk export timeouts &gt;50MB</td><td>2 tickets</td><td><span className="badge badge-orange">Known bug BUG-2847</span></td></tr>
                      <tr><td>Webhook missing line_items</td><td>2 tickets</td><td><span className="badge badge-orange">Docs need update</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
