"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action: string) => {
    const actionMessages: Record<string, string> = {
      products: "I want to learn about your products",
      pricing: "I want to learn about your pricing",
      it2: "I want to learn about Stable IT2",
    };

    const defaultResponses: Record<string, string> = {
      products:
        "Our products are designed to help you succeed. We offer comprehensive solutions tailored to your needs. Would you like to know more about specific features?",
      pricing:
        "We offer flexible pricing plans to suit businesses of all sizes. Our plans include all essential features with scalable options. Contact our sales team for a custom quote.",
      it2: "Stable IT2 is our enterprise-grade solution with advanced security, 99.9% uptime guarantee, and 24/7 support. Perfect for mission-critical operations.",
    };

    const userMessage: Message = {
      id: Date.now().toString(),
      text: actionMessages[action] || action,
      sender: "user",
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: defaultResponses[action] || "How can I help you further?",
      sender: "assistant",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage, assistantMessage]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
  };

  const containerVariants: Variants = {
    closed: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: { duration: 0.2 },
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
    },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-sans"
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="button"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => setIsOpen(true)}
            aria-label="Open chat support assistant"
            className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent hover:bg-dark-accent text-white shadow-lg transition-colors"
          >
            <MessageCircle className="w-8 h-8" />
          </motion.button>
        ) : (
          <motion.div
            key="chat"
            variants={containerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="flex flex-col w-full max-w-sm sm:max-w-md h-screen sm:h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden mx-4 sm:mx-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 bg-brand-accent p-3 sm:p-4 text-white">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex-shrink-0">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h2 className="font-semibold text-sm sm:text-lg truncate">KVV Support Assistant</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="p-1 hover:bg-dark-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 flex flex-col">
              {messages.length === 0 ? (
                <div className="flex flex-col justify-center items-start gap-4 mb-auto">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-white">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-gray-800 font-medium">
                        Hi, do you have any questions? I&apos;m happy to help.
                      </p>
                      <p className="text-brand-accent text-sm font-medium cursor-pointer hover:text-dark-accent">
                        Not satisfied? Contact our support team to help you.
                      </p>
                    </div>
                  </div>

                  <div className="w-full mt-3 sm:mt-4 space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">
                      What would you like to do?
                    </p>
                    <button
                      onClick={() => handleActionClick("products")}
                      className="w-full py-2 px-3 sm:px-4 text-xs sm:text-sm border-2 border-brand-accent text-brand-accent font-medium rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      Learn about Products
                    </button>
                    <button
                      onClick={() => handleActionClick("pricing")}
                      className="w-full py-2 px-3 sm:px-4 text-xs sm:text-sm border-2 border-brand-accent text-brand-accent font-medium rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      Learn about Pricing
                    </button>
                    <button
                      onClick={() => handleActionClick("it2")}
                      className="w-full py-2 px-3 sm:px-4 text-xs sm:text-sm border-2 border-brand-accent text-brand-accent font-medium rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      Learn about Stable IT2
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-sm px-3 sm:px-4 py-2 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-brand-accent text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <p className="text-xs sm:text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Input */}
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="Choose an option or type your message..."
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-100 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent placeholder-gray-500"
              />
              <button
                onClick={handleSendMessage}
                aria-label="Send message"
                className="p-2 bg-brand-accent hover:bg-dark-accent text-white rounded-lg transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
