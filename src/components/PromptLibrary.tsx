'use client';

import { useState } from 'react';

interface Prompt {
  title: string;
  content: string;
}

interface PromptLibraryProps {
  onPromptSelect: (prompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

// 内置的 prompt 列表
const defaultPrompts: Prompt[] = [
  {
    title: '数学辅导',
    content: `你是一位耐心的数学老师，正在帮助学生理解数学概念。请用简单易懂的语言解释问题，提供清晰的解题步骤，并在最后给出总结。如果学生有疑问，鼓励他们提出具体问题。`
  },
  {
    title: '英语辅导',
    content: `你是一位英语老师，正在帮助学生练习英语。请纠正学生的语法错误，提供改进建议，并用简单的英语解释复杂的概念。鼓励学生多练习。`
  },
  {
    title: '开放性问题',
    content: `请用启发式的方式回答这个问题，引导学生思考而不是直接给出答案。提供多个角度和观点，鼓励学生探索不同的解决方案。`
  },
  {
    title: '批判性思维',
    content: `请帮助分析这个问题的各个方面，包括优势和劣势。鼓励从不同角度思考，并提出可能的问题和改进建议。`
  },
  {
    title: '创意写作',
    content: `你是一位创意写作教练。请帮助学生发展他们的想法，提供具体的建议和反馈，同时保持他们的创造力和独特声音。`
  },
  {
    title: '考试准备',
    content: `你是一位考试辅导老师。请帮助学生复习关键概念，提供练习题，并模拟考试环境。重点放在理解和应用上，而不仅仅是记忆。`
  }
];

export default function PromptLibrary({ onPromptSelect, isOpen, onClose }: PromptLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPrompts = defaultPrompts.filter(prompt =>
    prompt.title.includes(searchTerm) || prompt.content.includes(searchTerm)
  );

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* 侧边栏 - Prompt 库 */}
      <aside className="fixed top-0 left-0 h-full w-80 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-50 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0">
        {/* 头部 */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Prompt 模板</h2>
          <input
            type="text"
            placeholder="搜索 prompt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100"
          />
        </div>

        {/* Prompt 列表 */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">没有找到匹配的 prompt</div>
          ) : (
            <div className="space-y-2">
              {filteredPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onPromptSelect(prompt.content);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {prompt.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 line-clamp-2">
                    {prompt.content}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 底部说明 */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            点击任意模板即可使用该 prompt 开始对话
          </p>
        </div>
      </aside>
    </>
  );
}
