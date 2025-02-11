import React, { useState } from "react";
import { IoSend } from "react-icons/io5";
import { GoogleGenerativeAI } from "@google/generative-ai";

const TypingIndicator = () => (
  <div style={styles.typingIndicator}>
    <div style={styles.dot}></div>
    <div style={styles.dot}></div>
    <div style={styles.dot}></div>
  </div>
);

const ChatWindow = ({ isChatOpen, toggleChat }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const hitRequest = () => {
    if (message) {
      generateResponse(message);
    } else {
      alert("You must write something...!");
    }
  };

  const generateResponse = async (msg) => {
    try {
      setIsTyping(true);
      const genAI = new GoogleGenerativeAI(
        "AIzaSyB8qQNpyQuge7YedyYpwtyFcNFm6F5c-iE"
      );
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Add user message immediately
      setMessages(prev => [...prev, { type: "userMsg", text: msg }]);
      setMessage("");
      
      const result = await model.generateContent(msg);
      
      // Add bot response after receiving it
      setMessages(prev => [...prev, { type: "responseMsg", text: result.response.text() }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, { type: "responseMsg", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
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
          {isTyping && <TypingIndicator />}
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
    bottom: "20px",
    right: "20px",
    width: "380px",
    height: "600px",
    backgroundColor: "#f8f9fa",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    borderRadius: "12px",
    overflow: "hidden",
    zIndex: 1000, // Ensure it stays on top of other content
  },
  chatHeader: {
    background: "#0284C7",
    color: "white",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  headerButtons: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  newChatButton: {
    backgroundColor: "#27ae60",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#219a52",
      transform: "translateY(-1px)",
    }
  },
  deleteButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    fontSize: "24px",
    color: "white",
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.2)",
    }
  },
  chatMessages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    backgroundColor: "#f5f7fb",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  userMsg: {
    background: "linear-gradient(135deg, #007AFF 0%, #5856D6 100%)",
    color: "white",
    padding: "12px 18px",
    borderRadius: "18px 18px 4px 18px",
    maxWidth: "75%",
    alignSelf: "flex-end",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
    },
  },
  responseMsg: {
    background: "white",
    color: "#1a1a1a",
    padding: "12px 18px",
    borderRadius: "18px 18px 18px 4px",
    maxWidth: "75%",
    alignSelf: "flex-start",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
    },
  },
  chatFooter: {
    display: "flex",
    padding: "16px 24px",
    backgroundColor: "white",
    borderTop: "1px solid rgba(0,0,0,0.08)",
    position: "relative",
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f5f7fb",
    borderRadius: "24px",
    padding: "0 8px",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    borderRadius: "24px",
    border: "none",
    backgroundColor: "transparent",
    resize: "none",
    "&:focus": {
      outline: "none",
    },
  },
  sendIcon: {
    fontSize: "24px",
    color: "#007AFF",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(0,122,255,0.1)",
      transform: "scale(1.1)",
    },
  },
  typingIndicator: {
    display: "flex",
    gap: "8px",
    padding: "12px 18px",
    background: "white",
    borderRadius: "18px 18px 18px 4px",
    maxWidth: "75px",
    alignSelf: "flex-start",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  dot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#90a4ae",
    borderRadius: "50%",
    animation: "typing 1.4s infinite ease-in-out",
    animationDelay: "0s",
    "@keyframes typing": {
      "0%, 100%": {
        transform: "translateY(0)",
      },
      "50%": {
        transform: "translateY(-10px)",
      },
    },
    "&:nth-child(2)": {
      animationDelay: "0.2s",
    },
    "&:nth-child(3)": {
      animationDelay: "0.4s",
    },
  },
};

export default ChatWindow;