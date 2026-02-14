import { useState } from "react";
import "./App.css";

function App() {
  const [userName, setUserName] = useState("");
  const [showNamePopUp, setShowNamePopUp] = useState(false);
  const [inputName, setInputName] = useState("");
  const [message, setMessage] = useState("");
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

    setMessage((message) => [...message, msg]);
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
              <div className="h-10 w-10 rounded-full bg-[#075e54] flex items-center justify-center text-2xl">R</div>
            
              <div className="flex-1">
                  <div className="text-sm font-medium text-[#303030]">競拍大廳</div>
                  <div className="text-xs text-gray-500">XXX正在輸入中...</div>
              </div>

              <div className="text-sm text-gray-500">
                  <span className="font-medium text-[#303030] capitalize">{userName}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
