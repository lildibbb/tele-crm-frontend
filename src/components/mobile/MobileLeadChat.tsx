"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CaretLeft,
  PaperPlaneTilt,
  Robot,
  UserCircle,
  Lightning,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api";
import { useLeadDetail } from "@/queries/useLeadsQuery";
import { queryKeys } from "@/queries/queryKeys";
import { parseApiData } from "@/lib/api/parseResponse";
import type { Interaction } from "@/lib/schemas/lead.schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Component ────────────────────────────────────────────────────────────────

export default function MobileLeadChat() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const { data: lead } = useLeadDetail(leadId);

  // Poll interactions every 5s
  const { data: interactionsData } = useQuery({
    queryKey: [...queryKeys.leads.detail(leadId), "interactions"],
    queryFn: async () => {
      const res = await leadsApi.getInteractions(leadId, {
        skip: 0,
        take: 100,
      });
      return parseApiData<Interaction[]>(res.data) ?? [];
    },
    refetchInterval: 5000,
    enabled: !!leadId,
  });
  const interactions = interactionsData ?? [];

  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interactions]);

  const handleSend = useCallback(async () => {
    const text = messageText.trim();
    if (!text || isSending) return;
    setMessageText("");
    setIsSending(true);
    try {
      await leadsApi.reply(leadId, text);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }, [messageText, isSending, leadId]);

  const displayName = lead?.displayName ?? "Chat";

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-text-primary font-sans">
      {/* Safe area top — handles notch/status bar since global layout is bypassed */}
      <div style={{ height: "env(safe-area-inset-top)" }} aria-hidden />
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 h-14 bg-card/90 backdrop-blur-xl border-b border-border-subtle shrink-0 sticky top-0 z-30">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 min-w-[44px] min-h-[44px] text-crimson active:opacity-70 transition-opacity"
          aria-label="Go back"
        >
          <CaretLeft size={20} weight="bold" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-sans font-bold text-[16px] text-text-primary truncate">
            {displayName}
          </p>
          <p className="text-[11px] font-sans text-text-muted">
            {interactions.length} messages
          </p>
        </div>
      </header>

      {/* ── Chat Messages ─────────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
        style={{ scrollbarWidth: "thin" }}
      >
        {interactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
            <Robot size={40} weight="duotone" className="opacity-40" />
            <p className="text-[13px] font-sans">No messages yet</p>
          </div>
        ) : (
          [...interactions].reverse().map((msg, i) => {
            const isSystem = msg.type === "SYSTEM_STATUS_CHANGE";
            const isBot = msg.type === "AUTO_REPLY_SENT";
            const isUser = msg.type === "MESSAGE_RECEIVED";

            if (isSystem) {
              return (
                <div key={msg.id ?? i} className="flex justify-center py-1">
                  <span className="text-[10px] font-sans italic text-text-muted bg-elevated px-3 py-1 rounded-full max-w-[90%] text-center">
                    {msg.content ?? ""}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id ?? i}
                className={cn("flex", isUser ? "justify-start" : "justify-end")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-sm",
                    isUser
                      ? "bg-elevated border border-border-default rounded-bl-sm"
                      : isBot
                        ? "bg-success/10 border border-success/20 rounded-br-sm"
                        : "bg-crimson/10 border border-crimson/20 rounded-br-sm",
                  )}
                >
                  {/* Sender label */}
                  {!isUser && (
                    <div className="flex items-center gap-1 mb-1">
                      {isBot ? (
                        <>
                          <Robot
                            size={10}
                            weight="bold"
                            className="text-success"
                          />
                          <span className="text-[9px] font-sans font-bold text-success uppercase tracking-wider">
                            Bot
                          </span>
                        </>
                      ) : (
                        <>
                          <UserCircle
                            size={10}
                            weight="bold"
                            className="text-crimson"
                          />
                          <span className="text-[9px] font-sans font-bold text-crimson uppercase tracking-wider">
                            Agent
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {msg.content && (
                    <p className="text-[14px] font-sans text-text-primary leading-relaxed">
                      {msg.content}
                    </p>
                  )}
                  <p className="text-[10px] font-mono text-text-muted mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </main>

      {/* ── Send Message Bar ────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-2 pb-[calc(12px+env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-xl border-t border-border-subtle">
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-card border border-border-subtle rounded-2xl overflow-hidden">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message…"
              rows={1}
              className="w-full bg-transparent px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted resize-none outline-none font-sans"
              style={{ maxHeight: "100px" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            className={cn(
              "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-[0.93]",
              messageText.trim() && !isSending
                ? "bg-crimson text-white shadow-lg shadow-crimson/20"
                : "bg-elevated text-text-muted",
            )}
            aria-label="Send message"
          >
            {isSending ? (
              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
              <PaperPlaneTilt size={20} weight="fill" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
