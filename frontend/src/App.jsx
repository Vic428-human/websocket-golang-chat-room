import { useState } from "react";
import "./App.css";

function App() {
  const [userName, setUserName] = useState("");
  const [showNamePopUp, setShowNamePopUp] = useState(true);
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
      </div>
    </>
  );
}

export default App;
