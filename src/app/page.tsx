'use client';

import { useState, useRef } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ChatInput from '@/components/ChatInput';
import MessageList, { type Message } from '@/components/MessageList';
import Sidebar from '@/components/Sidebar';
import PromptLibrary from '@/components/PromptLibrary';
import PasswordModal from '@/components/PasswordModal';
import { useMessageHistory } from '@/contexts/MessageHistoryContext';
import { usePassword } from '@/contexts/PasswordContext';
import { compressImage } from '@/lib/image-compressor';
import { Analytics } from "@vercel/analytics/next"

export default function Home() {
  const {
    conversations,
    currentConversationId,
    isLoading: contextLoading,
    createConversation,
    setCurrentConversationId,
    saveMessage,
    loadMessages,
    fetchConversations,
  } = useMessageHistory();

  const { isAuthenticated, logout } = usePassword();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [promptLibraryOpen, setPromptLibraryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = async (file: File) => {
    setError(null);
    try {
      // 压缩图片到 5MB 以下
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
        lastModified: Date.now(),
      });
      setSelectedImage(compressedFile);
      setPreviewUrl(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.error('Compression error:', err);
      // 压缩失败则使用原图
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  // 加载指定会话的消息
  const loadConversationMessages = async (conversationId: string) => {
    try {
      const savedMessages = await loadMessages(conversationId);
      const convertedMessages: Message[] = savedMessages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),
      }));
      setMessages(convertedMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load conversation history');
    }
  };

  // 切换会话
  const handleConversationSelect = async (id: string | null) => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (id) {
      await loadConversationMessages(id);
    } else {
      setMessages([]);
    }
    setCurrentConversationId(id);
  };

  // 创建新对话
  const handleNewChat = async () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setMessages([]);
    setCurrentConversationId(null);
    setError(null);
    // 刷新列表
    await fetchConversations();
  };

  const handlePromptSelect = (prompt: string) => {
    // 将选择的 prompt 直接填入输入框
    const inputElement = document.querySelector('textarea') as HTMLTextAreaElement;
    if (inputElement) {
      inputElement.value = prompt;
    }
  };

  const handleAskQuestion = async (prompt: string) => {
    if (!prompt.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsLoading(true);
    setError(null);

    // 添加用户消息
    const userMessage: Message = {
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // 如果没有当前会话，先创建一个新的
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await createConversation(prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''));
        setCurrentConversationId(conversationId);
      }

      const formData = new FormData();
      formData.append('prompt', prompt);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      if (conversationId) {
        formData.append('sessionId', conversationId);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.result) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.result,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // 保存消息到数据库
        if (conversationId) {
          await saveMessage(conversationId, 'user', prompt, !!selectedImage);
          await saveMessage(conversationId, 'assistant', data.result, false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black flex">
      {/* 侧边栏 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onConversationSelect={handleConversationSelect}
        currentConversationId={currentConversationId}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* 头部 */}
        <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Aurora Tutor
            </h1>
            {/* Prompt 库按钮 */}
            <button
              onClick={() => setPromptLibraryOpen(true)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              title="选择 Prompt 模板"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            {/* 退出按钮 */}
            <button
              onClick={logout}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
            >
              退出
            </button>
            {/* 图片指示器 */}
            {selectedImage && (
              <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Image attached</span>
                <span className="sm:hidden">📷</span>
              </span>
            )}
          </div>
        </header>

        {/* 主内容区 */}
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 min-h-0">
          {/* 图片上传区域（可选） */}
          <section className="flex-shrink-0">
            {!previewUrl ? (
              <ImageUploader
                onImageSelect={handleImageSelect}
                onUpload={async () => {}}
              />
            ) : (
              <div className="relative w-full max-w-sm mx-auto">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <img
                    src={previewUrl}
                    alt="Selected"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={handleClearImage}
                  className="mt-2 w-full py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  Remove Image
                </button>
              </div>
            )}
          </section>

          {/* 错误提示 */}
          {error && (
            <section className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            </section>
          )}

          {/* 消息列表 */}
          <section className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
            <MessageList messages={messages} />
            {isLoading && (
              <div className="flex justify-start mt-3">
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </section>

          {/* 输入框 */}
          <section className="flex-shrink-0">
            <ChatInput onSubmit={handleAskQuestion} disabled={isLoading} />
          </section>
        </main>
      </div>

      {/* Prompt 库模态框 */}
      <PromptLibrary
        isOpen={promptLibraryOpen}
        onClose={() => setPromptLibraryOpen(false)}
        onPromptSelect={handlePromptSelect}
      />

      {/* 密码验证模态框 */}
      {!isAuthenticated && (
        <div className="fixed inset-0 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black z-50">
          <PasswordModal />
        </div>
      )}
    </div>
  );
}
