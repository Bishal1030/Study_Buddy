import React from "react";
import { IoChatbubble } from "react-icons/io5";
import "./FloatingChatButton.css";

const FloatingChatButton = ({ toggleChat }) => {
  const clickSound = new Audio('/src/assets/click.mp3');

  const handleClick = () => {
    clickSound.play();
    toggleChat();
  };

  return (
    <div
      className="floating-chat-button"
      onClick={handleClick}
    >
      <IoChatbubble size={24} color="white" />
    </div>
  );
};

export default FloatingChatButton;