import React, { useState } from "react";
import { IoSend } from "react-icons/io5";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ChatWindow = ({ isChatOpen, toggleChat }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const hitRequest = () => {
    if (message) {
      generateResponse(message);
    } else {
      alert("You must write something...!");
    }
  };

  const generateResponse = async (msg) => {
    const genAI = new GoogleGenerativeAI(
      "AIzaSyB8qQNpyQuge7YedyYpwtyFcNFm6F5c-iE"
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(msg);

    const newMessages = [
      ...messages,
      { type: "userMsg", text: msg },
      { type: "responseMsg", text: result.response.text() },
    ];

    setMessages(newMessages);
    setMessage("");
  };

  const newChat = () => {
    setMessages([]);
  };

  const handleDelete = () => {
    toggleChat(); // Close the chat window
  };

  return (
    isChatOpen && (
      <div className="chat-window" style={styles.chatWindow}>
        {/* Header Section */}
        <div className="chat-header" style={styles.chatHeader}>
          <span>Study Buddy Assistant</span>
          <div style={styles.headerButtons}>
            <button onClick={newChat} style={styles.newChatButton}>
              New Chat
            </button>
            <button onClick={handleDelete} style={styles.deleteButton}>
              ×
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages" style={styles.chatMessages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.type}
              style={msg.type === "userMsg" ? styles.userMsg : styles.responseMsg}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="chat-footer" style={styles.chatFooter}>
          <div className="inputBox" style={styles.inputBox}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  hitRequest();
                }
              }}
              placeholder="Ask me anything!"
              style={styles.textarea}
            ></textarea>
            {message && (
              <i
                className="text-[24px] cursor-pointer"
                onClick={hitRequest}
                style={styles.sendIcon}
              >
                <IoSend />
              </i>
            )}
          </div>
        </div>
      </div>
    )
  );
};

const styles = {
  chatWindow: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  chatHeader: {
    backgroundColor: "#232f3e",
    color: "white",
    padding: "10px 15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerButtons: {
    display: "flex",
    gap: "10px",
  },
  newChatButton: {
    backgroundColor: "#ff9900",
    color: "white",
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "transparent",
    color: "white",
    fontSize: "20px",
    border: "none",
    cursor: "pointer",
  },
  chatMessages: {
    flex: 1,
    overflowY: "auto",
    padding: "10px 15px",
  },
  userMsg: {
    backgroundColor: "#ff9900",
    color: "white",
    padding: "10px",
    borderRadius: "15px",
    marginBottom: "10px",
    alignSelf: "flex-end",
  },
  responseMsg: {
    backgroundColor: "#232f3e",
    color: "white",
    padding: "10px",
    borderRadius: "15px",
    marginBottom: "10px",
    alignSelf: "flex-start",
  },
  chatFooter: {
    display: "flex",
    padding: "10px 15px",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    fontSize: "14px",
    borderRadius: "20px",
    border: "1px solid #ddd",
    resize: "none",
  },
  sendIcon: {
    fontSize: "24px",
    color: "#ff9900",
    cursor: "pointer",
    marginLeft: "10px",
  },
};

export default ChatWindow;