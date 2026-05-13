import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Plus, MessageSquare, Trash2, Leaf, BookOpen, CloudSun } from "lucide-react";

export default function Sidebar({ sessions, activeSessionId, onSelectSession, onNewChat, onDeleteSession, onOpenDiseaseLib, onOpenWeather, t }) {
  return (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#2D6A4F" }}>
            <Leaf className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-base font-semibold" style={{ fontFamily: "'Outfit', sans-serif", color: "#2D6A4F" }}>
            {t.appName}
          </span>
        </div>
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 rounded-lg text-white hover:opacity-90 transition-opacity"
          style={{ background: "#2D6A4F" }}
          data-testid="new-chat-button"
        >
          <Plus className="h-4 w-4" />
          {t.newChat}
        </Button>
        <Button
          variant="outline"
          onClick={onOpenDiseaseLib}
          className="w-full justify-start gap-2 rounded-lg border-border hover:border-[#2D6A4F] hover:text-[#2D6A4F] transition-colors mt-2"
          data-testid="disease-library-button"
        >
          <BookOpen className="h-4 w-4" />
          {t.diseaseLib}
        </Button>
        <Button
          variant="outline"
          onClick={onOpenWeather}
          className="w-full justify-start gap-2 rounded-lg border-border hover:border-[#E07A5F] hover:text-[#E07A5F] transition-colors mt-2"
          data-testid="weather-alerts-button"
        >
          <CloudSun className="h-4 w-4" />
          {t.weatherAlerts}
        </Button>
      </div>

      {/* Chat History */}
      <div className="px-3 pt-3 pb-1">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#5C5C5C" }}>
          {t.chatHistory}
        </p>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-1">
          {sessions.length === 0 && (
            <p className="text-sm px-3 py-6 text-center" style={{ color: "#5C5C5C" }} data-testid="no-chats-message">
              {t.noChats}
            </p>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                activeSessionId === session.id
                  ? "bg-[#EDF2F0]"
                  : "hover:bg-[#F5F4F2]"
              }`}
              onClick={() => onSelectSession(session.id)}
              data-testid={`session-item-${session.id}`}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" style={{ color: activeSessionId === session.id ? "#2D6A4F" : "#5C5C5C" }} />
              <span
                className="text-sm truncate flex-1"
                style={{
                  color: activeSessionId === session.id ? "#1A1A1A" : "#5C5C5C",
                  fontWeight: activeSessionId === session.id ? 500 : 400,
                }}
              >
                {session.title}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    data-testid={`delete-session-${session.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t.deleteChat}</TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
