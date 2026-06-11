import { useState, useEffect, useRef } from "react";

const TOPICS = [
    { title: "Getting Started", desc: "CallRail makes call tracking simple and easy. Learn how to set up your account and configure your first tracking number." },
    { title: "Call Tracking", desc: "Learn how you can get a CallRail number and start tracking calls and marketing campaigns instantly." },
    { title: "Form Tracking", desc: "Track the forms your customers submit on your website and get alerted when you have a new form submission." },
    { title: "Conversation Intelligence", desc: "Conversation Intelligence transcribes your calls, then uses AI to analyze them for actionable insights." },
    { title: "Lead Center", desc: "Lead Center is a lead management system that provides a single, unified inbox for all your interactions." },
    { title: "Google Integrations", desc: "Our full set of Google integrations help you get more from your calls and find the data that matters most." },
    { title: "Integrations", desc: "Learn how to integrate your data with a range of marketing and communication tools for even deeper insights." },
    { title: "Reports", desc: "Reports allow you to analyze call data by source, keyword, day, and more. You can also export and share your reports." },
    { title: "API & Webhooks", desc: "Our API and Webhook documentation provides everything you need to modify data in your account programmatically." },
    { title: "Account Management", desc: "Configure a range of account, company, and user settings to fine-tune your experience." },
    { title: "Security & Data Privacy", desc: "Learn about common aspects of our security and data privacy policies as they pertain to your account." },
    { title: "Agency Tools", desc: "Add your company's branding with our White Label feature, create custom pricing plans, and more." },
];

const CATEGORIES = [
    { icon: "📞", label: "Call Tracking", sub: "Getting started with Call Tracking", color: "#ddeeff" },
    { icon: "📥", label: "Lead Center", sub: "Getting started with Lead Center", color: "#ddf5ea" },
    { icon: "📋", label: "Form Tracking", sub: "Getting started with Form Tracking", color: "#fff3d4" },
    { icon: "🧠", label: "Conversation Intelligence", sub: "Getting started with CI", color: "#eeecff" },
];

const CHIPS = [
    "How do I set up call tracking?",
    "What is Lead Center?",
    "How do I integrate with Google?",
];

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ChatMessage {
    role: "user" | "bot";
    text: string;
}

export default function HelpCenter() {
    const [searchVal, setSearchVal] = useState("");
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: "bot", text: "Hi there! 👋 I'm your AI assistant. Ask me anything about call tracking, integrations, account setup, or any other feature!" },
    ]);
    const [inputVal, setInputVal] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showChips, setShowChips] = useState(true);
    const [apiMessages, setApiMessages] = useState<Message[]>([]);

    const panelRef = useRef<HTMLDivElement>(null);
    const fabRef = useRef<HTMLButtonElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages, isTyping]);

    useEffect(() => {
        if (chatOpen) inputRef.current?.focus();
    }, [chatOpen]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!chatOpen) return;
            if (
                panelRef.current && !panelRef.current.contains(e.target as Node) &&
                fabRef.current && !fabRef.current.contains(e.target as Node)
            ) {
                setChatOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [chatOpen]);

    const callAI = async (msgs: Message[]) => {
        setIsTyping(true);
        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    system: "You are a friendly and knowledgeable AI assistant for a call tracking and analytics help center. Help users with Call Tracking, Lead Center, Form Tracking, Conversation Intelligence, Integrations, Reports, API & Webhooks, Account Management, Security, and Agency Tools. Be concise, helpful, and friendly.",
                    messages: msgs,
                }),
            });
            const data = await res.json();
            const reply: string = data.content?.[0]?.text ?? "Sorry, I had trouble responding. Please try again.";
            setChatMessages((prev) => [...prev, { role: "bot", text: reply }]);
            setApiMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        } catch {
            setChatMessages((prev) => [...prev, { role: "bot", text: "Oops, something went wrong. Please try again in a moment." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const sendText = (text: string) => {
        if (!text.trim()) return;
        setShowChips(false);
        const userMsg: Message = { role: "user", content: text };
        const newApiMsgs = [...apiMessages, userMsg];
        setChatMessages((prev) => [...prev, { role: "user", text }]);
        setApiMessages(newApiMsgs);
        callAI(newApiMsgs);
    };

    const handleSearch = () => {
        if (!searchVal.trim()) return;
        if (!chatOpen) setChatOpen(true);
        setTimeout(() => sendText("Can you help me with: " + searchVal), 200);
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f5f4f0; color: #1a1a1a; }
        .typing-dot { width: 7px; height: 7px; background: #aaa; border-radius: 50%; display: inline-block; animation: bounce 1s infinite; }
        .typing-dot:nth-child(2) { animation-delay: .15s; }
        .typing-dot:nth-child(3) { animation-delay: .3s; }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        .topic-card { background:#fff; border-radius:12px; border:1px solid #e8e6e0; padding:1.25rem; cursor:pointer; transition:box-shadow .15s, transform .15s, border-color .15s; }
        .topic-card:hover { border-color:#1e6eff; box-shadow:0 4px 16px rgba(30,110,255,0.08); transform:translateY(-2px); }
        .cat-item { display:flex; flex-direction:column; align-items:center; gap:10px; padding:1.25rem 1rem; border-radius:12px; cursor:pointer; transition:background .15s, transform .15s; text-decoration:none; }
        .cat-item:hover { background:#f0f4ff; transform:translateY(-2px); }
        .chip { background:#f0f4ff; border:1px solid #cdd9ff; color:#1e6eff; font-size:11.5px; padding:4px 10px; border-radius:999px; cursor:pointer; transition:background .15s; font-family:'DM Sans',sans-serif; }
        .chip:hover { background:#dde8ff; }
        .search-btn { background:#1e6eff; color:#fff; border:none; padding:0 1.5rem; font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; transition:background .15s; }
        .search-btn:hover { background:#1459dd; }
        .send-btn { width:34px; height:34px; background:#1e6eff; border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; flex-shrink:0; }
        .send-btn:hover { background:#1459dd; }
        .fab { position:fixed; bottom:28px; right:28px; width:54px; height:54px; border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:transform .2s, box-shadow .2s; z-index:1000; font-size:22px; font-weight:700; font-family:'DM Serif Display',serif; }
        .fab:hover { transform:scale(1.08); }
        .chat-input { flex:1; border:1px solid #e0e0e0; border-radius:999px; padding:8px 14px; font-size:13px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color .15s; }
        .chat-input:focus { border-color:#1e6eff; }
        .popular-link { color:rgba(255,255,255,0.9); cursor:pointer; margin-left:6px; text-decoration:underline; text-underline-offset:2px; }
        .popular-link:hover { color:#fff; }
      `}</style>

            {/* NAV */}
            <nav style={{ background: "#fff", borderBottom: "1px solid #e8e6e0", padding: "0 2rem", height: 56, display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
                <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 16, color: "#1a1a1a", textDecoration: "none" }}>
                    <div style={{ width: 28, height: 28, background: "#1e6eff", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff"><path d="M3 8a5 5 0 0110 0A5 5 0 013 8zm5-3a1 1 0 000 2h.01a1 1 0 100-2H8zm0 4a1 1 0 100 2 1 1 0 000-2z" /></svg>
                    </div>
                    TrackAI
                </a>
            </nav>

            {/* HERO */}
            <div style={{ background: "linear-gradient(135deg,#1a2744 0%,#1e4db7 60%,#1e6eff 100%)", padding: "4rem 2rem 3rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -40, right: -60, width: 300, height: 300, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: -80, left: -40, width: 220, height: 220, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
                <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,4vw,2.8rem)", color: "#fff", marginBottom: "1.75rem", position: "relative" }}>
                    How can we help?
                </h1>
                <div style={{ display: "flex", maxWidth: 560, margin: "0 auto 1.25rem", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", position: "relative" }}>
          <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#aaa" }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          </span>
                    <input
                        type="text"
                        placeholder="Search for articles..."
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        style={{ flex: 1, border: "none", outline: "none", padding: "0 1rem 0 3rem", fontSize: 15, fontFamily: "'DM Sans',sans-serif", height: 52, color: "#1a1a1a" }}
                    />
                    <button className="search-btn" onClick={handleSearch}>Search</button>
                </div>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, position: "relative" }}>
                    Popular:
                    {["lead center", "call tracking", "integrations"].map((t) => (
                        <span key={t} className="popular-link" onClick={() => setSearchVal(t)}>{t}</span>
                    ))}
                </p>
            </div>

            {/* CATEGORIES */}
            <div style={{ background: "#fff", borderBottom: "1px solid #e8e6e0", padding: "2rem", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", maxWidth: 900, margin: "0 auto" }}>
                {CATEGORIES.map((c) => (
                    <a key={c.label} href="#" className="cat-item">
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{c.icon}</div>
                        <span style={{ fontWeight: 600, fontSize: 13, textAlign: "center", color: "#1a1a1a" }}>{c.label}</span>
                        <span style={{ fontSize: 11.5, color: "#888", textAlign: "center" }}>{c.sub}</span>
                    </a>
                ))}
            </div>

            {/* TOPICS */}
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 2rem 6rem" }}>
                <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.5rem", color: "#1a1a1a", marginBottom: "1.75rem" }}>Help by Topic</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem" }}>
                    {TOPICS.map((t) => (
                        <div key={t.title} className="topic-card">
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#1e6eff", marginBottom: "0.5rem" }}>{t.title}</div>
                            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{t.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAB */}
            <button
                ref={fabRef}
                className="fab"
                onClick={() => setChatOpen((o) => !o)}
                style={{ background: chatOpen ? "#1a2744" : "#1e6eff", color: "#fff", boxShadow: chatOpen ? "0 6px 20px rgba(26,39,68,0.35)" : "0 6px 20px rgba(30,110,255,0.35)" }}
                title="Ask AI Assistant"
            >
                {chatOpen ? "✕" : "?"}
            </button>

            {/* CHAT PANEL */}
            <div
                ref={panelRef}
                style={{
                    position: "fixed", bottom: 94, right: 28, width: 360, maxHeight: 520,
                    background: "#fff", borderRadius: 16,
                    boxShadow: "0 16px 48px rgba(0,0,0,0.14),0 2px 8px rgba(0,0,0,0.06)",
                    display: "flex", flexDirection: "column", zIndex: 999, overflow: "hidden",
                    opacity: chatOpen ? 1 : 0,
                    transform: chatOpen ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
                    pointerEvents: chatOpen ? "all" : "none",
                    transition: "opacity .2s, transform .2s",
                }}
            >
                {/* Header */}
                <div style={{ background: "linear-gradient(135deg,#1a2744,#1e6eff)", color: "#fff", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, background: "rgba(255,255,255,0.18)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>AI Assistant</div>
                        <div style={{ fontSize: 11, opacity: 0.7 }}>
                            <span style={{ width: 7, height: 7, background: "#4ade80", borderRadius: "50%", display: "inline-block", marginRight: 4 }} />
                            Online — ask me anything
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: 10, minHeight: 200, maxHeight: 320 }}>
                    {chatMessages.map((m, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                            {m.role === "bot" && (
                                <div style={{ width: 26, height: 26, background: "#1e6eff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", flexShrink: 0 }}>AI</div>
                            )}
                            <div style={{
                                maxWidth: "75%", padding: "8px 12px", borderRadius: 14, fontSize: 13, lineHeight: 1.55,
                                background: m.role === "bot" ? "#f0f4ff" : "#1e6eff",
                                color: m.role === "bot" ? "#1a1a1a" : "#fff",
                                borderBottomLeftRadius: m.role === "bot" ? 4 : 14,
                                borderBottomRightRadius: m.role === "user" ? 4 : 14,
                                whiteSpace: "pre-wrap",
                            }}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                            <div style={{ width: 26, height: 26, background: "#1e6eff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", flexShrink: 0 }}>AI</div>
                            <div style={{ background: "#f0f4ff", padding: "10px 14px", borderRadius: 14, borderBottomLeftRadius: 4, display: "flex", gap: 4 }}>
                                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick chips */}
                {showChips && (
                    <div style={{ padding: "0 1rem .75rem", display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {CHIPS.map((c) => (
                            <button key={c} className="chip" onClick={() => sendText(c)}>{c}</button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div style={{ borderTop: "1px solid #e8e6e0", padding: ".75rem 1rem", display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        ref={inputRef}
                        className="chat-input"
                        type="text"
                        placeholder="Ask a question..."
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { sendText(inputVal); setInputVal(""); } }}
                    />
                    <button className="send-btn" onClick={() => { sendText(inputVal); setInputVal(""); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
                    </button>
                </div>
            </div>
        </>
    );
}