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
      <div>123</div>
    </>
  );
}

export default App;
