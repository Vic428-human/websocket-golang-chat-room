import { useEffect, useRef, useState } from "react";
import "./App.css";

const fakeMessages = [
  {
    id: 1742100123000,
    sender: "系統",
    text: "歡迎來到競拍大廳！請遵守規則，理性出價～",
    ts: 1742100123000,
  },
];

function App() {
  const [userName, setUserName] = useState("");
  const [showNamePopUp, setShowNamePopUp] = useState(true);
  const [inputName, setInputName] = useState("");

  const [messages, setMessages] = useState(fakeMessages);
  const [text, setText] = useState("");

  const [connected, setConnected] = useState(false);

  // typing indicator: who is currently typing (others)
  const [typingUsers, setTypingUsers] = useState([]); // array of names
  const typingTimersRef = useRef(new Map()); // name -> timeoutId (auto-expire)

  // WebSocket instance
  const wsRef = useRef(null);

  // ✅ avoid closure issue in onmessage
  const userNameRef = useRef("");
  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  // local debounce timer: when I stop typing, send typing:false
  const typingStopTimerRef = useRef(null);

  // FORMAT TIMESTAMP HH:MM FOR MESSAGES
  const formatTime = (ts) => {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const sendTyping = (isTyping) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "typing", typing: isTyping }));
  };

  const connectWS = (name) => {
    // already open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const finalName = (name || "anonymous").trim() || "anonymous";

    const ws = new WebSocket(
      `ws://localhost:8080/ws?name=${encodeURIComponent(finalName)}`
    );

    ws.onopen = () => {
      setConnected(true);
      console.log("✅ Connected");
    };

    ws.onmessage = (e) => {
      let ev;
      try {
        ev = JSON.parse(String(e.data));
      } catch {
        // If your server still sends legacy "name: text" strings, you can optionally fallback here.
        return;
      }

      if (!ev || !ev.type) return;

      // don't show my own typing / echo
      if (ev.name === userNameRef.current) return;

      if (ev.type === "chat") {
        setMessages((prev) => [
          ...prev,
          {
            id: (ev.ts ?? Date.now()) + Math.random(),
            sender: ev.name ?? "unknown",
            text: ev.text ?? "",
            ts: ev.ts ?? Date.now(),
          },
        ]);
        return;
      }

      if (ev.type === "typing") {
        const name = ev.name;
        if (!name) return;

        const timers = typingTimersRef.current;

        // clear old expiry timer
        const old = timers.get(name);
        if (old) clearTimeout(old);

        if (ev.typing) {
          // add to typing list
          setTypingUsers((prev) => (prev.includes(name) ? prev : [...prev, name]));

          // auto-expire if no refresh within 2.5s
          const t = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((n) => n !== name));
            timers.delete(name);
          }, 2500);

          timers.set(name, t);
        } else {
          // stop typing
          setTypingUsers((prev) => prev.filter((n) => n !== name));
          timers.delete(name);
        }
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("🔌 Disconnected");
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    wsRef.current = ws;
  };

  // submit name to get started, open chat window with initial connection
  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) return;

    setUserName(trimmed);
    setShowNamePopUp(false);

    connectWS(trimmed);
  };

  // send message
  const sendMessage = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    // local optimistic render
    const localMsg = {
      id: Date.now(),
      sender: userName,
      text: trimmed,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, localMsg]);

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      // stop typing to avoid others seeing you typing forever
      sendTyping(false);

      // send JSON chat event
      ws.send(JSON.stringify({ type: "chat", text: trimmed }));
    } else {
      console.warn("WS not connected");
    }

    setText("");
  };

  // handle enter key to send message
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage(e);
    }
  };

  // cleanup: close ws & clear timers on unmount
  useEffect(() => {
    return () => {
      try {
        wsRef.current?.close();
      } catch {}

      if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);

      for (const t of typingTimersRef.current.values()) {
        clearTimeout(t);
      }
      typingTimersRef.current.clear();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-inter">
      {/* enter your name to start chat */}
      {showNamePopUp && (
        <div className="fixed inset-0 flex items-center justify-center z-40 bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h1 className="text-xl font-semibold">Enter your name</h1>
            <p className="text-sm text-gray-500 mt-1">
              enter your name to start chatting
            </p>

            <form onSubmit={handleNameSubmit} className="mt-4">
              <input
                autoFocus
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 outline-green-500 placeholder-gray-400"
                placeholder="Enter your name"
              />
              <button
                type="submit"
                className="block ml-auto mt-3 px-4 py-1.5 rounded-full bg-green-500 text-white font-medium cursor-pointer"
              >
                繼續
              </button>
            </form>
          </div>
        </div>
      )}

      {/* chat window */}
      {!showNamePopUp && (
        <div className="w-full max-w-2xl h-[90vh] bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
          {/* chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            {/* avatar */}
            <div className="h-10 w-10 rounded-full bg-[#075e54] flex items-center justify-center text-2xl text-white">
              R
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium text-[#303030]">競拍大廳</div>

              {/* status + typing indicator */}
              <div className="text-xs text-gray-500">
                {connected ? "已連線" : "未連線"}
                {connected && typingUsers.length > 0 && (
                  <span className="ml-2">
                    ·{" "}
                    {typingUsers.length === 1
                      ? `${typingUsers[0]} 正在輸入…`
                      : `${typingUsers.slice(0, 2).join("、")} 等 ${
                          typingUsers.length
                        } 人正在輸入…`}
                  </span>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <span className="font-medium text-[#303030] capitalize">
                {userName || "anonymous"}
              </span>
            </div>
          </div>

          {/* chat messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-100 flex flex-col">
            {messages.map((m) => {
              const mine = m.sender === userName;
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] p-3 my-2 rounded-[18px] text-sm leading-5 shadow-sm ${
                      mine
                        ? "bg-green-500 text-white rounded-br-2xl"
                        : "bg-white text-[#303030] rounded-bl-2xl"
                    }`}
                  >
                    <div className="break-words whitespace-pre-wrap mb-1">
                      <span className="font-medium">{m.text}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 gap-16">
                      <div className="text-[11px] font-bold">{m.sender}</div>
                      <span className="text-[11px] text-gray-500 text-right">
                        {formatTime(m.ts)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* input area */}
          <form
            onSubmit={sendMessage}
            className="border-t border-gray-200 bg-white p-3 flex gap-2"
          >
            <input
              value={text}
              onChange={(e) => {
                const v = e.target.value;
                setText(v);

                if (!connected) return;

                // If you want "empty string => not typing", enable this:
                // if (!v.trim()) { sendTyping(false); return; }

                // notify others I'm typing
                sendTyping(true);

                // debounce stop-typing
                if (typingStopTimerRef.current)
                  clearTimeout(typingStopTimerRef.current);

                typingStopTimerRef.current = setTimeout(() => {
                  sendTyping(false);
                }, 1200);
              }}
              onKeyDown={handleKeyDown}
              disabled={!connected}
              placeholder={connected ? "輸入訊息..." : "尚未連線"}
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 outline-green-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!connected}
              className="px-4 py-2 rounded-full bg-green-500 text-white font-medium disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
