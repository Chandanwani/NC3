import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "@/components/MessageBubble";
import TypingIndicator from "@/components/TypingIndicator";
import QuickReplyChips from "@/components/QuickReplyChips";

export default function ChatArea({ messages, loading, language, onChipClick }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const lastAiIndex = [...messages].reverse().findIndex((m) => m.role === "assistant");
  const showChipsAtIndex = lastAiIndex >= 0 ? messages.length - 1 - lastAiIndex : -1;

  return (
    <ScrollArea className="flex-1" data-testid="chat-area">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={`${msg.role}-${msg.id}-${idx}`}>
            <MessageBubble message={msg} language={language} />
            {idx === showChipsAtIndex && !loading && (
              <QuickReplyChips language={language} onChipClick={onChipClick} />
            )}
          </div>
        ))}
        {loading && <TypingIndicator language={language} />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
