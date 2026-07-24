import { Bot, Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
function ChatView({
  messages,
  thinking,
  question,
  setQuestion,
  askQuestion,
}) {
  return (
    <div className="chat-card">

      <div className="card-header">

        <div className="card-icon">

          <Bot size={24} />

        </div>

        <div>

          <h2>IntelliDoc AI</h2>

          <p>Chat with your uploaded documents</p>

        </div>

      </div>

      <div className="chat-window">

        {messages.length === 0 && (

          <div className="empty-chat">

            Start asking questions about your document.

          </div>

        )}

        {messages.map((msg, index) => (

          <div
            key={index}
            className={
              msg.role === "user"
                ? "user-message"
                : "ai-message"
            }
          >

            <strong>

              {msg.role === "user"

                ? "You"

                : "IntelliDoc AI"}

            </strong>

           <div className="markdown-output">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");

        return !inline && match ? (
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },

      table({ children }) {
        return (
          <div className="table-wrapper">
            <table>{children}</table>
          </div>
        );
      },
    }}
  >
    {msg.content}
  </ReactMarkdown>
</div>

          </div>

        ))}

        {thinking && (

          <div className="ai-message">

            <Loader2
              className="spin"
              size={18}
            />

            Thinking...

          </div>

        )}

      </div>

      <div className="chat-input">

        <input
          type="text"
          placeholder="Ask anything..."
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
        />

        <button
          className="chat-btn"
          onClick={askQuestion}
        >

          <Send size={18} />

        </button>

      </div>

    </div>
  );
}

export default ChatView;