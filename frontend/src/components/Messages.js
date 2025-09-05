
import React from "react";
import "../css/Messages.css"

const Messages = ({ messages }) => {
  return (
    <div className="messages">
      <h3>Project Messages</h3>
      {messages && messages.length > 0 ? (
        <ul>
          {messages.map((msg) => (
            <li key={msg.id}>
              💬 {msg.text}
            </li>
          ))}
        </ul>
      ) : (
        <p>No messages yet.</p>
      )}
    </div>
  );
};

export default Messages;
