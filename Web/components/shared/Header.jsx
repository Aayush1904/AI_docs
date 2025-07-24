"use client";
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import NavItems from './NavItems';
import MobileNav from './MobileNav';
import Logo from './logo';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { MessageCircle } from 'lucide-react';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

const Header = () => {
  const [chatOpen, setChatOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([
    { role: 'assistant', content: 'Hi! I am your AI assistant. Ask me anything about your codebase or project.' }
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // For demo, use a static userId and projectId (replace with real auth/project context)
  const userId = 'demo-user';
  const projectId = 'demo-project';

  // Fetch notifications
  useEffect(() => {
    if (!notifOpen) return;
    fetch(`/api/notifications?userId=${userId}&projectId=${projectId}`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setUnreadCount((data.notifications || []).filter(n => !n.read).length);
      });
  }, [notifOpen]);

  // Mark as read when dropdown opens
  useEffect(() => {
    if (notifOpen && unreadCount > 0) {
      fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, projectId })
      }).then(() => setUnreadCount(0));
    }
  }, [notifOpen, unreadCount]);
  // Helper to send message
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      // Try code/project Q&A first
      const res = await fetch("/api/ai-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input })
      });
      const data = await res.json();
      let answer = data.result || "Sorry, I couldn't find an answer.";
      // Fallback: If answer is generic or not found, you could call a general LLM endpoint here
      setMessages((msgs) => [...msgs, { role: 'assistant', content: answer }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  return (
    <header className='w-full bg-white shadow-md'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-18'>
        <Link href="/" className='flex items-center'>
          {/* <Logo/> */}
          <Image src = "/Logo_Neural.jpg" alt='Logo' height={150} width={150} />
        </Link>

        <SignedIn>
          <nav className='hidden md:flex md:justify-between md:items-center w-full max-w-xs'>
            <NavItems />
          </nav>
        </SignedIn>

        <div className='flex items-center gap-4'>
          {/* Notification Bell */}
          <div className="relative">
            <button
              className="relative rounded-full p-2 hover:bg-gray-100 transition"
              aria-label="Notifications"
              onClick={() => setNotifOpen(v => !v)}
            >
              <Bell className="w-6 h-6 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="fixed left-1/2 top-20 -translate-x-1/2 w-full max-w-xs sm:max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg z-50 mx-auto p-2">
                <div className="p-3 border-b font-semibold text-primary flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Notifications
                </div>
                <div className="max-h-80 overflow-y-auto divide-y">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-gray-400 text-center">No notifications</div>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`p-3 ${n.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                      <div className="text-sm text-gray-800">{n.message}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Chatbot Launcher */}
          <Dialog open={chatOpen} onOpenChange={setChatOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full flex items-center gap-2 border-primary text-primary hover:bg-primary/10 transition"
                aria-label="Open AI Chatbot"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="hidden sm:inline">AI Chat</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-full sm:max-w-lg p-0 bg-white rounded-xl shadow-xl px-2 mx-4 sm:mx-auto">
              {/* Chatbot UI */}
              <div className="flex flex-col min-h-[60vh] max-h-[90vh] sm:h-[500px]">
                <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  <h2 className="text-lg font-semibold text-primary">AI Assistant</h2>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                      <div className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 text-gray-900'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="text-left">
                      <div className="inline-block px-3 py-2 rounded-lg bg-gray-200 text-gray-900 animate-pulse">Thinking...</div>
                    </div>
                  )}
                </div>
                <form className="flex items-center gap-2 p-4 border-t" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
                  <textarea
                    className="flex-1 rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={1}
                    placeholder="Ask about your codebase or project..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    disabled={loading}
                    style={{ minHeight: 36 }}
                  />
                  <Button type="submit" disabled={loading || !input.trim()} className="h-9 px-4">Send</Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
          <SignedIn>
            <UserButton afterSignOutUrl='/' />
            <MobileNav />
          </SignedIn>
          <SignedOut>
            <Button asChild className="rounded-full bg-primary text-white hover:bg-teal-600 transition duration-200" size="lg">
              <Link href="/sign-in">
                Login
              </Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}

export default Header;
