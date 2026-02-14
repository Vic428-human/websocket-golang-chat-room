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

  // WebSocket instance
  const wsRef = useRef(null);

  // ✅ Step 6 核心：避免 onmessage 拿到舊的 userName（closure 問題）
  const userNameRef = useRef("");
  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  // FORMAT TIMESTAMP HH:MM FOR MESSAGES
  const formatTime = (ts) => {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
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
      const raw = String(e.data);

      // index.html 版本送的是 "name: text"
      let sender = "unknown";
      let body = raw;

      const idx = raw.indexOf(": ");
      if (idx !== -1) {
        sender = raw.slice(0, idx);
        body = raw.slice(idx + 2);
      }

      // ✅ Step 6：如果是自己的回播訊息，就不要再加一次（避免重複）
      if (sender === userNameRef.current) return;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          sender,
          text: body,
          ts: Date.now(),
        },
      ]);
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

    // connect with name in query string (same as index.html approach)
    connectWS(trimmed);
  };

  // send message
  const sendMessage = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    // 本地先顯示（即時）
    const localMsg = {
      id: Date.now(),
      sender: userName,
      text: trimmed,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, localMsg]);

    // 送到 WebSocket（讓別人收到）
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      // 先沿用你目前 server 的純字串格式
      ws.send(`${userName}: ${trimmed}`);
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

  // cleanup: close ws on unmount
  useEffect(() => {
    return () => {
      try {
        wsRef.current?.close();
      } catch {}
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
          {/*chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            {/* avatar */}
            <div className="h-10 w-10 rounded-full bg-[#075e54] flex items-center justify-center text-2xl text-white">
              R
            </div>

            <div className="flex-1">
              <div className="text-sm font-medium text-[#303030]">競拍大廳</div>
              <div className="text-xs text-gray-500">
                {connected ? "已連線" : "未連線"}
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
              onChange={(e) => setText(e.target.value)}
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
