import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import DiseaseLibrary from "@/components/DiseaseLibrary";
import WeatherAlerts from "@/components/WeatherAlerts";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Leaf, Languages, Download, Copy, Share2, BookOpen, CloudSun } from "lucide-react";
import { Toaster, toast } from "@/components/ui/sonner";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TRANSLATIONS = {
  en: {
    appName: "CropDoc AI",
    newChat: "New Chat",
    typeMessage: "Describe your crop issue or upload an image...",
    send: "Send",
    uploadImage: "Upload Image",
    noChats: "No conversations yet",
    welcome: "Welcome to CropDoc AI",
    welcomeSub: "Upload a crop image or describe symptoms to get instant disease detection, precautions, and treatment advice.",
    suggestion1: "What are common rice diseases?",
    suggestion2: "How to prevent wheat rust?",
    suggestion3: "Best organic fertilizers for tomatoes",
    suggestion4: "Identify disease from leaf image",
    chatHistory: "Chat History",
    deleteChat: "Delete",
    analyzing: "Analyzing...",
    langLabel: "EN",
    langSwitch: "Switch to Hindi",
    exportChat: "Export Chat",
    downloadMd: "Download as Markdown",
    copyText: "Copy to Clipboard",
    copied: "Copied to clipboard!",
    diseaseLib: "Disease Library",
    weatherAlerts: "Weather Alerts",
  },
  hi: {
    appName: "CropDoc AI",
    newChat: "नई चैट",
    typeMessage: "अपनी फसल की समस्या बताएं या तस्वीर अपलोड करें...",
    send: "भेजें",
    uploadImage: "तस्वीर अपलोड करें",
    noChats: "अभी तक कोई बातचीत नहीं",
    welcome: "CropDoc AI में आपका स्वागत है",
    welcomeSub: "तुरंत रोग पहचान, सावधानियां और उपचार सलाह के लिए फसल की तस्वीर अपलोड करें या लक्षण बताएं।",
    suggestion1: "धान के सामान्य रोग क्या हैं?",
    suggestion2: "गेहूं के रस्ट को कैसे रोकें?",
    suggestion3: "टमाटर के लिए सर्वोत्तम जैविक उर्वरक",
    suggestion4: "पत्ती की तस्वीर से रोग पहचानें",
    chatHistory: "चैट इतिहास",
    deleteChat: "हटाएं",
    analyzing: "विश्लेषण हो रहा है...",
    langLabel: "HI",
    langSwitch: "Switch to English",
    exportChat: "चैट निर्यात करें",
    downloadMd: "मार्कडाउन डाउनलोड करें",
    copyText: "क्लिपबोर्ड पर कॉपी करें",
    copied: "क्लिपबोर्ड पर कॉपी हो गया!",
    diseaseLib: "रोग पुस्तकालय",
    weatherAlerts: "मौसम चेतावनी",
  },
};

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarPanel, setSidebarPanel] = useState("chat"); // "chat" | "disease" | "weather"

  const t = TRANSLATIONS[language];

  const fetchSessions = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/chat/sessions`);
      setSessions(res.data);
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    }
  }, []);

  const fetchMessages = useCallback(async (sessionId) => {
    if (!sessionId) return;
    try {
      const res = await axios.get(`${API}/chat/sessions/${sessionId}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error("Failed to fetch messages", e);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId, fetchMessages]);

  const createSession = async () => {
    try {
      const res = await axios.post(`${API}/chat/sessions`, {
        title: "New Chat",
        language,
      });
      setSessions((prev) => [res.data, ...prev]);
      setActiveSessionId(res.data.id);
      setMessages([]);
      setMobileMenuOpen(false);
    } catch (e) {
      toast.error("Failed to create session");
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(`${API}/chat/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (e) {
      toast.error("Failed to delete session");
    }
  };

  const sendMessage = async (text, imageBase64, imageMime) => {
    if (!text.trim() && !imageBase64) return;

    let sessionId = activeSessionId;

    if (!sessionId) {
      try {
        const res = await axios.post(`${API}/chat/sessions`, {
          title: "New Chat",
          language,
        });
        sessionId = res.data.id;
        setSessions((prev) => [res.data, ...prev]);
        setActiveSessionId(sessionId);
      } catch (e) {
        toast.error("Failed to create session");
        return;
      }
    }

    const tempUserMsg = {
      id: "temp-user-" + Date.now(),
      session_id: sessionId,
      role: "user",
      text,
      image_base64: imageBase64 ? imageBase64.substring(0, 200) + "..." : null,
      _full_image: imageBase64,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await axios.post(`${API}/chat/send`, {
        session_id: sessionId,
        text,
        image_base64: imageBase64 || null,
        image_mime: imageMime || "image/jpeg",
        language,
      });
      setMessages((prev) => [...prev, res.data]);
      fetchSessions();
    } catch (e) {
      const errorMsg = language === "en"
        ? "Failed to get response. Please try again."
        : "उत्तर प्राप्त करने में विफल। कृपया पुनः प्रयास करें।";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    if (activeSessionId) {
      axios.patch(`${API}/chat/sessions/${activeSessionId}/language?language=${newLang}`).catch(() => {});
    }
  };

  const handleSuggestion = (text) => {
    sendMessage(text, null, null);
  };

  // Export: Download as Markdown
  const handleExportDownload = async () => {
    if (!activeSessionId) return;
    try {
      const res = await axios.get(`${API}/chat/sessions/${activeSessionId}/export`, { responseType: "text" });
      const blob = new Blob([res.data], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cropdoc-chat-${activeSessionId.slice(0, 8)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(language === "en" ? "Chat downloaded!" : "चैट डाउनलोड हो गई!");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  // Export: Copy to Clipboard
  const handleExportCopy = async () => {
    if (!activeSessionId) return;
    try {
      const res = await axios.get(`${API}/chat/sessions/${activeSessionId}/export`, { responseType: "text" });
      await navigator.clipboard.writeText(res.data);
      toast.success(t.copied);
    } catch (e) {
      toast.error("Copy failed");
    }
  };

  // Disease library → ask AI
  const handleDiseaseQuery = (text) => {
    setSidebarPanel("chat");
    sendMessage(text, null, null);
  };

  // Weather alert → ask AI
  const handleWeatherQuery = (text) => {
    setSidebarPanel("chat");
    sendMessage(text, null, null);
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: "#F9F8F6" }}>
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-72 flex-shrink-0 border-r border-border bg-white">
          {sidebarPanel === "disease" ? (
            <DiseaseLibrary
              language={language}
              onClose={() => setSidebarPanel("chat")}
              onSelectDisease={handleDiseaseQuery}
            />
          ) : sidebarPanel === "weather" ? (
            <WeatherAlerts
              language={language}
              onClose={() => setSidebarPanel("chat")}
              onAskAboutDisease={handleWeatherQuery}
            />
          ) : (
            <Sidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={(id) => setActiveSessionId(id)}
              onNewChat={createSession}
              onDeleteSession={deleteSession}
              onOpenDiseaseLib={() => setSidebarPanel("disease")}
              onOpenWeather={() => setSidebarPanel("weather")}
              t={t}
              data-testid="desktop-sidebar"
            />
          )}
        </div>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 p-0 bg-white z-[60]" data-testid="mobile-sidebar-sheet">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="h-full relative z-10">
              <Sidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={(id) => {
                  setActiveSessionId(id);
                  setMobileMenuOpen(false);
                }}
                onNewChat={createSession}
                onDeleteSession={deleteSession}
                onOpenDiseaseLib={() => {
                  setSidebarPanel("disease");
                  setMobileMenuOpen(false);
                }}
                onOpenWeather={() => {
                  setSidebarPanel("weather");
                  setMobileMenuOpen(false);
                }}
                t={t}
                data-testid="mobile-sidebar"
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top Nav */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-white/90 backdrop-blur-sm" data-testid="top-nav">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
                data-testid="mobile-menu-button"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#2D6A4F" }}>
                  <Leaf className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-lg font-semibold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: "#2D6A4F" }}>
                  {t.appName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Export/Share - only when session active */}
              {activeSessionId && messages.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 rounded-lg border-border hover:border-[#2D6A4F] transition-colors"
                      data-testid="export-chat-button"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline text-sm">{t.exportChat}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportDownload} data-testid="export-download-option">
                      <Download className="h-4 w-4 mr-2" />
                      {t.downloadMd}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportCopy} data-testid="export-copy-option">
                      <Copy className="h-4 w-4 mr-2" />
                      {t.copyText}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Disease Library Toggle (mobile) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden rounded-lg border-border hover:border-[#2D6A4F] transition-colors"
                    onClick={() => setSidebarPanel(sidebarPanel === "disease" ? "chat" : "disease")}
                    data-testid="mobile-disease-lib-button"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t.diseaseLib}</TooltipContent>
              </Tooltip>

              {/* Weather Alerts Toggle (mobile) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden rounded-lg border-border hover:border-[#E07A5F] transition-colors"
                    onClick={() => setSidebarPanel(sidebarPanel === "weather" ? "chat" : "weather")}
                    data-testid="mobile-weather-button"
                  >
                    <CloudSun className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t.weatherAlerts}</TooltipContent>
              </Tooltip>

              {/* Language Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center gap-2 rounded-lg border-border hover:border-[#2D6A4F] transition-colors"
                data-testid="language-toggle"
              >
                <Languages className="h-4 w-4" />
                <span className="font-medium text-sm">{language === "en" ? "हिंदी" : "English"}</span>
              </Button>
            </div>
          </header>

          {/* Chat / Welcome / Disease Library (mobile overlay) */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
            {/* Mobile panel overlays */}
            {sidebarPanel === "disease" && (
              <div className="md:hidden absolute inset-0 z-20 bg-white" data-testid="mobile-disease-overlay">
                <DiseaseLibrary
                  language={language}
                  onClose={() => setSidebarPanel("chat")}
                  onSelectDisease={handleDiseaseQuery}
                />
              </div>
            )}
            {sidebarPanel === "weather" && (
              <div className="md:hidden absolute inset-0 z-20 bg-white" data-testid="mobile-weather-overlay">
                <WeatherAlerts
                  language={language}
                  onClose={() => setSidebarPanel("chat")}
                  onAskAboutDisease={handleWeatherQuery}
                />
              </div>
            )}

            {!activeSessionId && messages.length === 0 ? (
              <WelcomeScreen t={t} onSuggestion={handleSuggestion} />
            ) : (
              <ChatArea
                messages={messages}
                loading={loading}
                language={language}
                onChipClick={(text) => sendMessage(text, null, null)}
              />
            )}
            <ChatInput
              onSend={sendMessage}
              loading={loading}
              t={t}
              language={language}
            />
          </div>
        </div>

        <Toaster position="top-right" />
      </div>
    </TooltipProvider>
  );
}
