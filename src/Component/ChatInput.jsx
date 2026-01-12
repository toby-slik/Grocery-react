const ChatInput = ({ input, setInput, loading, handleSend }) => {
  return (
    <form className="chat-input-form" onSubmit={handleSend}>
      <input
        type="text"
        className="chat-input-field"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="chat-send-button"
        style={{
          backgroundColor: loading || !input.trim() ? "#f0f0f0" : "#008446",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </form>
  );
};

export default ChatInput;
