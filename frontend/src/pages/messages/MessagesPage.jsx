import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  messageApi,
  gigApi,
  bookingApi,
  applicationApi,
  providerApi,
  workerApi,
  userApi,
  toList,
} from '../../api/services';
import { normalizeMessage } from '../../api/normalizers';
import { formatDateTime } from '../../lib/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { MessageSquare, Send, User, Briefcase } from 'lucide-react';

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const { error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const deepGigId = searchParams.get('gig');
  const deepWithUserId = searchParams.get('with');

  // Conversations list: { id, gigId, gigTitle, counterpartUserId, counterpartName }
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  // Messages in active conversation
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inFlightRef = useRef(false);

  // Auto-scroll logic: scroll only if near bottom
  const scrollToBottomIfNear = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // 1. Build conversations list from user's gigs, bookings, applications
  useEffect(() => {
    let ignore = false;
    if (!user || !profile?.id) return;

    setLoadingConversations(true);

    async function loadConversations() {
      const convoMap = new Map(); // key: `${gigId}-${counterpartUserId}`

      try {
        if (user.role === 'PROVIDER') {
          // Provider: load bookings
          const bookingsRaw = await bookingApi.getByProvider(profile.id).catch(() => []);

          const bookings = toList(bookingsRaw);
          for (const b of bookings) {
            if (b.gigId && b.workerProfileId) {
              try {
                const wProf = await workerApi.getById(b.workerProfileId);
                const key = `${b.gigId}-${wProf.userId}`;
                convoMap.set(key, {
                  id: key,
                  gigId: b.gigId,
                  gigTitle: b.gigTitle || 'Gig Conversation',
                  counterpartUserId: wProf.userId,
                  counterpartName: b.workerName || wProf.userName || 'Worker',
                });
              } catch {}
            }
          }

          // If opened via deep link ?gig=&with=
          if (deepGigId && deepWithUserId) {
            const key = `${deepGigId}-${deepWithUserId}`;
            if (!convoMap.has(key)) {
              let gigTitle = 'Gig Chat';
              let counterpartName = 'Worker';
              try {
                const g = await gigApi.getById(deepGigId);
                gigTitle = g.title || gigTitle;
                const u = await userApi.getById(deepWithUserId);
                counterpartName = u.fullName || counterpartName;
              } catch {}

              convoMap.set(key, {
                id: key,
                gigId: deepGigId,
                gigTitle,
                counterpartUserId: deepWithUserId,
                counterpartName,
              });
            }
          }
        } else if (user.role === 'WORKER') {
          // Worker: load applications and bookings
          const [appsRaw, bookingsRaw] = await Promise.all([
            applicationApi.getByWorker(profile.id).catch(() => []),
            bookingApi.getByWorker(profile.id).catch(() => []),
          ]);

          const apps = toList(appsRaw);
          const bookings = toList(bookingsRaw);

          for (const b of bookings) {
            if (b.gigId && b.providerProfileId) {
              try {
                const pProf = await providerApi.getById(b.providerProfileId);
                const key = `${b.gigId}-${pProf.userId}`;
                convoMap.set(key, {
                  id: key,
                  gigId: b.gigId,
                  gigTitle: b.gigTitle || 'Gig Conversation',
                  counterpartUserId: pProf.userId,
                  counterpartName: b.providerName || pProf.userName || 'Provider',
                });
              } catch {}
            }
          }

          for (const a of apps) {
            const gigId = a.gigId;
            if (gigId) {
              try {
                const gig = await gigApi.getById(gigId);
                if (gig?.providerProfileId) {
                  const pProf = await providerApi.getById(gig.providerProfileId);
                  const key = `${gigId}-${pProf.userId}`;
                  if (!convoMap.has(key)) {
                    convoMap.set(key, {
                      id: key,
                      gigId,
                      gigTitle: gig.title || a.gigTitle || 'Gig Conversation',
                      counterpartUserId: pProf.userId,
                      counterpartName: gig.providerName || pProf.userName || 'Provider',
                    });
                  }
                }
              } catch {}
            }
          }

          // Deep link support for worker
          if (deepGigId && deepWithUserId) {
            const key = `${deepGigId}-${deepWithUserId}`;
            if (!convoMap.has(key)) {
              let gigTitle = 'Gig Chat';
              let counterpartName = 'Provider';
              try {
                const g = await gigApi.getById(deepGigId);
                gigTitle = g.title || gigTitle;
                const u = await userApi.getById(deepWithUserId);
                counterpartName = u.fullName || counterpartName;
              } catch {}

              convoMap.set(key, {
                id: key,
                gigId: deepGigId,
                gigTitle,
                counterpartUserId: deepWithUserId,
                counterpartName,
              });
            }
          }
        }

        if (!ignore) {
          const list = Array.from(convoMap.values());
          setConversations(list);

          // Select conversation
          if (deepGigId && deepWithUserId) {
            const match = list.find(
              (c) => c.gigId === deepGigId && c.counterpartUserId === deepWithUserId
            );
            if (match) setActiveChat(match);
            else if (list.length > 0) setActiveChat(list[0]);
          } else if (list.length > 0) {
            setActiveChat(list[0]);
          }
        }
      } catch {
        // error handling
      } finally {
        if (!ignore) setLoadingConversations(false);
      }
    }

    loadConversations();

    return () => {
      ignore = true;
    };
  }, [user, profile, deepGigId, deepWithUserId]);

  // 2. Fetch and poll messages for active conversation
  const fetchMessagesForActive = useCallback(
    async (isBackgroundPoll = false) => {
      if (!activeChat || !user) return;
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      if (!isBackgroundPoll) setLoadingMessages(true);

      try {
        const raw = await messageApi.getByGig(activeChat.gigId);
        const norm = toList(raw).map(normalizeMessage);

        // Filter messages to exactly user and counterpart pair
        const filtered = norm.filter(
          (m) =>
            (m.senderId === user.id && m.receiverId === activeChat.counterpartUserId) ||
            (m.senderId === activeChat.counterpartUserId && m.receiverId === user.id)
        );

        setMessages(filtered);
        scrollToBottomIfNear();
      } catch {
        // silent fail during poll
      } finally {
        inFlightRef.current = false;
        if (!isBackgroundPoll) setLoadingMessages(false);
      }
    },
    [activeChat, user, scrollToBottomIfNear]
  );

  // Initial load on activeChat change
  useEffect(() => {
    if (!activeChat) return;
    setMessages([]);
    fetchMessagesForActive(false);

    // Initial scroll
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 100);
  }, [activeChat, fetchMessagesForActive]);

  // 5000ms polling effect, only when visible, cleaned up on unmount or activeChat change
  useEffect(() => {
    if (!activeChat) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMessagesForActive(true);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [activeChat, fetchMessagesForActive]);

  // 3. Send message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const trimmed = textInput.trim();
    if (!trimmed || !activeChat || sending) return;

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: optimisticId,
      gigId: activeChat.gigId,
      senderId: user.id,
      senderName: user.fullName,
      receiverId: activeChat.counterpartUserId,
      receiverName: activeChat.counterpartName,
      text: trimmed,
      body: trimmed,
      sentAt: new Date().toISOString(),
    };

    // Optimistic append
    setMessages((prev) => [...prev, optimisticMessage]);
    setTextInput('');
    setSending(true);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const saved = await messageApi.send({
        gigId: activeChat.gigId,
        senderId: user.id,
        receiverId: activeChat.counterpartUserId,
        text: trimmed,
      });
      const normSaved = normalizeMessage(saved);

      // Replace optimistic message with saved
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? normSaved : m))
      );
    } catch (err) {
      // Rollback on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setTextInput(trimmed);
      toastError(err.message || 'Failed to send message. Please retry.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loadingConversations) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" id="messages-conversations-spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 font-heading mb-6">
        Direct Messages
      </h1>

      <div className="card-static overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px] max-h-[750px] shadow-sm">
        {/* Sidebar Conversations List */}
        <div className="md:col-span-4 border-r border-neutral-200 bg-neutral-50/50 flex flex-col">
          <div className="p-4 border-b border-neutral-200 bg-white">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Conversations ({conversations.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500">
                No active conversations yet. Messages appear here once you post or bid on gigs.
              </div>
            ) : (
              conversations.map((convo) => {
                const isSelected = activeChat?.id === convo.id;
                return (
                  <button
                    key={convo.id}
                    id={`conversation-item-${convo.id}`}
                    type="button"
                    onClick={() => {
                      setActiveChat(convo);
                      setSearchParams({ gig: convo.gigId, with: convo.counterpartUserId });
                    }}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white border-l-4 border-neutral-950 shadow-xs'
                        : 'hover:bg-neutral-100/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {convo.counterpartName?.slice(0, 2).toUpperCase() || 'GM'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-neutral-900 truncate">
                          {convo.counterpartName}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500 truncate block mt-0.5">
                        {convo.gigTitle}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Thread Panel */}
        <div className="md:col-span-8 flex flex-col bg-white">
          {activeChat ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center text-xs font-bold">
                    {activeChat.counterpartName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      {activeChat.counterpartName}
                    </h3>
                    <p className="text-xs text-neutral-500 truncate max-w-sm">
                      Regarding: <strong>{activeChat.gigTitle}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Message History Viewport */}
              <div
                ref={scrollContainerRef}
                id="messages-viewport"
                className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-neutral-50/30"
              >
                {loadingMessages ? (
                  <div className="py-12 flex justify-center">
                    <Spinner size="md" id="thread-loading-spinner" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center text-xs text-neutral-400">
                    No messages exchanged yet. Send a greeting to start the conversation!
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user.id;
                    return (
                      <div
                        key={m.id}
                        id={`chat-msg-${m.id}`}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                            isMe
                              ? 'bg-neutral-950 text-white rounded-br-xs'
                              : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        </div>
                        <span className="text-[10px] text-neutral-400 mt-1 px-1">
                          {formatDateTime(m.sentAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <div className="p-3 sm:p-4 border-t border-neutral-200 bg-white">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2"
                  id="message-send-form"
                >
                  <textarea
                    id="message-text-input"
                    rows={1}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message (Enter to send, Shift+Enter for new line)..."
                    className="input resize-none py-2 text-sm"
                  />
                  <button
                    type="submit"
                    id="message-send-btn"
                    disabled={!textInput.trim() || sending}
                    className="btn btn-primary px-4 py-2 shrink-0"
                    aria-label="Send message"
                  >
                    {sending ? <Spinner size="sm" id="msg-sending-spinner" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500">
              <MessageSquare className="w-12 h-12 text-neutral-300 mb-3" />
              <p className="text-sm font-medium">Select a conversation from the sidebar to chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
