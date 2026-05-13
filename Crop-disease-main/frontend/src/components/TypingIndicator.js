import { Leaf } from "lucide-react";

export default function TypingIndicator({ language }) {
  return (
    <div className="message-enter flex gap-3 justify-start" data-testid="typing-indicator">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
        style={{ background: "#2D6A4F" }}
      >
        <Leaf className="h-4 w-4 text-white" />
      </div>
      <div
        className="rounded-2xl rounded-tl-none px-5 py-4 bg-white border shadow-sm flex items-center gap-2"
        style={{ borderColor: "#E5E3DB" }}
      >
        <div className="flex items-center gap-1.5">
          <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "#2D6A4F" }} />
          <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "#2D6A4F" }} />
          <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "#2D6A4F" }} />
        </div>
        <span className="text-xs ml-2" style={{ color: "#5C5C5C" }}>
          {language === "hi" ? "विश्लेषण हो रहा है..." : "Analyzing..."}
        </span>
      </div>
    </div>
  );
}
