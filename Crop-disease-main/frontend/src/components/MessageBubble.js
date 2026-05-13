import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Leaf, ExternalLink } from "lucide-react";

export default function MessageBubble({ message, language }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`message-enter flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
      data-testid={`message-bubble-${message.role}-${message.id}`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
          style={{ background: "#2D6A4F" }}
        >
          <Leaf className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Message Content */}
      <div
        className={`max-w-[80%] ${
          isUser
            ? "rounded-2xl rounded-tr-none px-5 py-3 text-white"
            : "rounded-2xl rounded-tl-none px-5 py-3 bg-white border shadow-sm"
        }`}
        style={
          isUser
            ? { background: "#2D6A4F" }
            : { borderColor: "#E5E3DB" }
        }
        data-testid={`message-content-${message.id}`}
      >
        {/* User uploaded image thumbnail */}
        {isUser && message._full_image && (
          <div className="mb-2">
            <img
              src={`data:image/jpeg;base64,${message._full_image}`}
              alt="Uploaded crop"
              className="max-w-[200px] max-h-[150px] rounded-lg object-cover"
              data-testid={`message-image-${message.id}`}
            />
          </div>
        )}
        {isUser && message.image_base64 && !message._full_image && (
          <div className="mb-2 flex items-center gap-1.5 text-white/80 text-xs">
            <span>[ Image attached ]</span>
          </div>
        )}

        {/* Text */}
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        ) : (
          <div className="markdown-content text-sm" style={{ color: "#1A1A1A" }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
                    style={{ color: "#2D6A4F" }}
                    data-testid="ai-response-link"
                  >
                    {children}
                    <ExternalLink className="h-3 w-3 inline-block" />
                  </a>
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
          style={{ background: "#E07A5F" }}
        >
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}
