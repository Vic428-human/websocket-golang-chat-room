import { useState } from "react";
import "./App.css";

const fakeMessages = [
  {
    id: 1742100123000,
    sender: "系統",
    text: "歡迎來到競拍大廳！請遵守規則，理性出價～",
    ts: 1742100123000,
  },
  {
    id: 1742100138000,
    sender: "小明",
    text: "這次有什麼好東西啊？？",
    ts: 1742100138000,
  },
  {
    id: 1742100152000,
    sender: "阿強",
    text: "聽說有 PS5 Pro 限量版耶",
    ts: 1742100152000,
  },
];
function App() {
  const [userName, setUserName] = useState("系統");
  const [showNamePopUp, setShowNamePopUp] = useState(false);
  const [inputName, setInputName] = useState("");
  const [messages, setMessages] = useState(fakeMessages);
  const [text, setText] = useState("");

  // FORMAT TIMESTAMP HH:MM FOR MESSAGES
  const formatTime = (ts) => {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${hh}:${mm}`;
  };

  // submit name to get started, open chat window with initail message
  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) return;

    setUserName(inputName);
    setShowNamePopUp(false);
  };

  // send message
  const sendMessage = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    // user message
    const msg = {
      id: Date.now(),
      sender: userName,
      text,
      ts: Date.now(),
    };

    setMessages((message) => [...message, msg]);
    setText("");
  };

  // handle enter key to send message
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-inter">
        {/* enter your name to start chat */}
        {showNamePopUp && (
          <div className="flex inset-0 items-center justify-center z-40">
            <div className="bg-white">
              <h1 className="text-xl font-semibold shadow-lg max-w-md p-6">
                Enter your name
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                enter your name to start chatting
              </p>

              <form onSubmit={handleNameSubmit} className="mt-4">
                <input
                  autoFocus
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full border border-gray-200 rouned-md px-3 py-2 outline-green-500 placeholder-gray-400"
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
              {/* 預計放頭像 */}
              <div className="h-10 w-10 rounded-full bg-[#075e54] flex items-center justify-center text-2xl">
                R
              </div>

              <div className="flex-1">
                <div className="text-sm font-medium text-[#303030]">
                  競拍大廳
                </div>
                <div className="text-xs text-gray-500">XXX正在輸入中...</div>
              </div>

              <div className="text-sm text-gray-500">
                <span className="font-medium text-[#303030] capitalize">
                  {userName}
                </span>
              </div>
            </div>

            {/* chat messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-100 flex flex-col">
              {messages.map((m) => {
                const mine = m.sender === userName;
                return (
                  <div
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] p-3 my-2 rounded-[18px] text-sm leading-5 shadow-sm ${
                        mine
                          ? "bg-green-500 text-white rounded-br-2xl"
                          : "bg-white text-[#303030] rounded-bl-2xl"
                      }`}
                    >
                      <div className="wrap-break-words whitespace-pre-wrap mb-1">
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
          </div>
        )}
      </div>
    </>
  );
}

export default App;
