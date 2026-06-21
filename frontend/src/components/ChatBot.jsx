import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader } from "lucide-react";
import { C, FONT, DISPLAY, MONO } from "../constants/tokens";

const stripHtml = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

function Bubble({ msg, courseEmoji }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-end", gap: 8, marginBottom: 12,
    }}>
      {/* Avatar */}
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", background: C.brandSoft,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0,
        }}>
          {courseEmoji}
        </div>
      )}

      {/* Message */}
      <div style={{
        maxWidth: "78%",
        padding: "10px 13px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? C.brand : C.paper,
        border: isUser ? "none" : `1px solid ${C.line}`,
        fontFamily: FONT, fontSize: 13.5, lineHeight: 1.55,
        color: isUser ? "#fff" : C.ink,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {msg.content || (
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: C.faint }}>
            <Loader size={12} className="spin" /> Thinking…
          </span>
        )}
      </div>
    </div>
  );
}

export function ChatBot({ course }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm your ${course.title} tutor. Ask me anything about the topics in this course — definitions, examples, or anything confusing.`,
    },
  ]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const next = [...messages, { role: "user", content: text }, { role: "assistant", content: "" }];
    setMessages(next);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          courseId: course.id,
          courseTitle: course.title,
          topics: course.topics.map((t) => ({
            title: t.title,
            description: t.description,
            content: stripHtml(t.content?.text ?? ""),
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(res.status === 503 ? "AI tutor isn't configured yet — OPENAI_API_KEY needed." : "Something went wrong.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: err.message || "Something went wrong. Try again." };
        return updated;
      });
    }

    setStreaming(false);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open AI tutor"}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 200,
          width: 54, height: 54, borderRadius: "50%", border: "none",
          background: C.brand, color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(85,70,214,.40)",
          transition: "transform .15s, box-shadow .15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.07)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 94, right: 28, zIndex: 200,
          width: 360, height: 490,
          background: C.surface, borderRadius: 20,
          boxShadow: "0 12px 48px rgba(26,27,46,.18)",
          border: `1px solid ${C.line}`,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px", borderBottom: `1px solid ${C.line}`,
            display: "flex", alignItems: "center", gap: 10,
            background: C.paper, flexShrink: 0,
          }}>
            <span style={{ fontSize: 20 }}>{course.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, color: C.ink }}>
                {course.title} Tutor
              </div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: C.faint }}>Powered by GPT-4o mini</div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ border: "none", background: "transparent", cursor: "pointer", color: C.faint, display: "flex" }}>
              <X size={17} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }}>
            {messages.map((msg, i) => (
              <Bubble key={i} msg={msg} courseEmoji={course.emoji} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 12px", borderTop: `1px solid ${C.line}`,
            display: "flex", alignItems: "flex-end", gap: 8, flexShrink: 0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask a question…"
              rows={1}
              style={{
                flex: 1, resize: "none", border: `1.5px solid ${C.line}`,
                borderRadius: 12, padding: "9px 12px",
                fontFamily: FONT, fontSize: 14, color: C.ink,
                outline: "none", background: C.paper,
                maxHeight: 80, overflowY: "auto", lineHeight: 1.4,
              }}
              onFocus={(e) => (e.target.style.borderColor = C.brand)}
              onBlur={(e) => (e.target.style.borderColor = C.line)}
            />
            <button
              onClick={send}
              disabled={!input.trim() || streaming}
              style={{
                width: 38, height: 38, borderRadius: "50%", border: "none",
                background: input.trim() && !streaming ? C.brand : C.line,
                color: "#fff", cursor: input.trim() && !streaming ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "background .15s",
              }}
            >
              {streaming ? <Loader size={15} className="spin" /> : <Send size={15} />}
            </button>
          </div>

          {/* Suggestion pills */}
          {messages.length === 1 && (
            <div style={{ padding: "0 12px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                `What is ${course.topics[0]?.title}?`,
                "Give me an example",
                "What should I study first?",
              ].map((s) => (
                <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  style={{
                    fontFamily: FONT, fontSize: 12, color: C.brand,
                    background: C.brandSoft, border: "none", cursor: "pointer",
                    padding: "5px 10px", borderRadius: 999,
                  }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
