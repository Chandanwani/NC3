import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Send, ImagePlus, X, Mic, MicOff } from "lucide-react";

export default function ChatInput({ onSend, loading, t, language }) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Voice input setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      if (finalTranscript) {
        setText((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      }
    };
  }, [language]);

  // Update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-IN";
    }
  }, [language]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-IN";
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition error:", e);
      }
    }
  };

  const hasSpeechSupport = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return;
    }

    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result.split(",")[1];
      setImageBase64(base64Data);
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setImageMime("image/jpeg");
  };

  const handleSend = () => {
    if (loading) return;
    if (!text.trim() && !imageBase64) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    onSend(text, imageBase64, imageMime);
    setText("");
    clearImage();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-white px-4 py-3" style={{ borderColor: "#E5E3DB" }} data-testid="chat-input-area">
      {/* Image Preview */}
      {imagePreview && (
        <div className="max-w-4xl mx-auto mb-2 flex items-start gap-2" data-testid="image-preview-container">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Upload preview"
              className="h-20 w-20 object-cover rounded-lg border"
              style={{ borderColor: "#E5E3DB" }}
              data-testid="image-preview"
            />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              data-testid="remove-image-button"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="max-w-4xl mx-auto mb-2 flex items-center gap-2" data-testid="voice-listening-indicator">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "#F4433615" }}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#F44336" }}></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "#F44336" }}></span>
            </span>
            <span className="text-xs font-medium" style={{ color: "#F44336" }}>
              {language === "hi" ? "सुन रहा है..." : "Listening..."}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto flex items-end gap-2">
        {/* Image Upload */}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageUpload}
          data-testid="file-input"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex-shrink-0 rounded-lg border-border hover:border-[#2D6A4F] hover:text-[#2D6A4F] transition-colors h-10 w-10"
              data-testid="upload-image-button"
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.uploadImage}</TooltipContent>
        </Tooltip>

        {/* Voice Input */}
        {hasSpeechSupport && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isListening ? "default" : "outline"}
                size="icon"
                onClick={toggleVoice}
                disabled={loading}
                className={`flex-shrink-0 rounded-lg h-10 w-10 transition-all ${
                  isListening
                    ? "text-white animate-pulse"
                    : "border-border hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
                }`}
                style={isListening ? { background: "#F44336" } : {}}
                data-testid="voice-input-button"
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isListening
                ? (language === "hi" ? "रोकें" : "Stop")
                : (language === "hi" ? "आवाज से बोलें" : "Voice Input")}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Text Input */}
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.typeMessage}
          disabled={loading}
          rows={1}
          className="flex-1 resize-none rounded-lg border-border focus:border-[#2D6A4F] min-h-[40px] max-h-[120px] py-2.5 text-sm"
          style={{ fontFamily: "'Manrope', sans-serif" }}
          data-testid="chat-text-input"
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={loading || (!text.trim() && !imageBase64)}
          className="flex-shrink-0 rounded-lg text-white h-10 w-10 p-0 hover:opacity-90 transition-opacity"
          style={{ background: (text.trim() || imageBase64) && !loading ? "#2D6A4F" : "#B0BEB5" }}
          data-testid="send-message-button"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <p className="max-w-4xl mx-auto text-xs mt-2 text-center" style={{ color: "#5C5C5C" }}>
        {language === "hi"
          ? "CropDoc AI गलतियां कर सकता है। महत्वपूर्ण जानकारी की जांच करें।"
          : "CropDoc AI can make mistakes. Verify important information."}
      </p>
    </div>
  );
}
