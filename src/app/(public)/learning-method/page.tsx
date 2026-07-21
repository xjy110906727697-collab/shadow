'use client'

import { useState } from 'react'

const articles = [
  {
    id: 'shadow-reading',
    title: '影子跟读法：提升口语的秘密武器',
    tag: '口语',
    summary: '影子跟读（Shadow Reading）是一种高效的语言学习技巧，通过紧跟原声跟读来快速提升口语和听力能力。',
    readingTime: '8 分钟',
    readCount: 2341,
    date: '2024/1/15',
    content: `什么是影子跟读？

影子跟读（Shadow Reading）是一种语言学习技巧，学习者在听到音频的同时或稍后立即跟读，像影子一样紧跟原声。这种方法被广泛应用于口译训练和外语学习中。

影子跟读的核心原理

影子跟读的有效性源于以下几个方面：

1. **多感官协同学习** - 同时调动听觉、视觉和动觉，加深记忆

2. **即时反馈机制** - 实时对比自己的发音与原音的差异

3. **肌肉记忆训练** - 口腔肌肉适应外语发音方式

4. **语感培养** - 潜移默化地掌握语言节奏和韵律

影子跟读的五大好处

1. 显著提升听力理解能力
通过反复聆听和跟读，你会熟悉各种口音、语速和语调变化，听力自然提高。

2. 快速改善发音
模仿母语者的发音方式，包括连读、弱读、语调等，让你的发音更地道。

3. 增强语感
培养自然的表达习惯，说话时不再需要先翻译再说。

4. 扩大词汇量
在真实语境中学习新词汇，记忆更深刻，使用更准确。

5. 提高反应速度
训练大脑快速处理信息，提高语言思维能力。

如何进行影子跟读

第一步：选择合适的材料
• 选择略高于当前水平的内容
• 建议使用有字幕的视频材料
• 每段材料控制在2-5分钟

第二步：初步理解
• 先完整听一遍，了解大意
• 查看生词和难点
• 理解材料的主要内容

第三步：分段跟读
• 将材料分成小段（1-2句）
• 听一遍后暂停，然后跟读
• 注意模仿语音、语调、节奏

第四步：同步跟读
• 尝试与音频同步说
• 像影子一样紧跟原声
• 保持相同的速度和节奏

第五步：录音对比
• 录制自己的跟读
• 与原音进行对比
• 找出差距并针对性改进

常见问题解答

Q: 每天需要练习多长时间？
A: 建议每天30分钟，坚持比时长更重要。

Q: 跟不上怎么办？
A: 可以先降低音频速度，熟练后再恢复正常速度。

Q: 一定要完全听懂才能跟读吗？
A: 不需要，边跟读边理解是正常的学习过程。

实用技巧

1. 使用耳机，一只耳朵听原音，一只耳朵听自己的声音
2. 站着练习效果更好，可以配合肢体语言
3. 选择自己感兴趣的材料，保持学习动力
4. 记录进度，定期回顾对比进步`,
  },
  {
    id: 'overview',
    title: '学习方法概述',
    tag: '入门',
    summary: '了解我们平台的核心学习理念和方法论，为您的韩语学习之旅打下坚实基础。',
    readingTime: '3 分钟',
    readCount: 1280,
    content: `学习一门新语言需要科学的方法和持之以恒的努力。我们的韩语学习平台为您提供了系统化的学习路径，帮助您高效掌握韩语。

本学习方法页面将为您详细介绍如何利用平台的各种功能，最大化学习效果。无论您是零基础初学者，还是有一定基础的进阶学习者，都能找到适合自己的学习方案。`,
  },
  {
    id: 'watch',
    title: '如何观看视频课程',
    tag: '教程',
    summary: '学习如何高效利用视频课程、双语字幕和交互功能，最大化每一节课的学习效果。',
    readingTime: '5 分钟',
    readCount: 960,
    content: `1. 选择适合自己水平的视频
在首页浏览视频列表时，您可以根据等级、主题、难度等条件筛选合适的视频。建议从基础等级开始，循序渐进。

2. 完整的观看流程
第一步：先完整观看一遍视频，了解整体内容和语境。
第二步：第二遍时关注字幕，尝试跟读每一句话。
第三步：利用交互式字幕功能，逐句反复练习。

3. 使用双语字幕
每个视频都配有韩语和中文双语字幕。您可以随时切换关注点，先理解中文意思，再专注模仿韩语发音。`,
  },
  {
    id: 'repeat',
    title: '跟读与发音练习',
    tag: '进阶',
    summary: '掌握跟读技巧，通过模仿原声提升发音准确度和口语流利度。',
    readingTime: '4 分钟',
    readCount: 750,
    content: `跟读是语言学习中最重要的环节之一。

跟读练习方法：
• 播放一句韩语原声，仔细听发音和语调
• 暂停视频，模仿原声朗读同一句话
• 反复对比自己的发音和原声的差异
• 重点练习难发的音节和连音现象

建议每天至少进行15分钟的跟读练习，坚持一个月就能看到明显的进步。`,
  },
  {
    id: 'review',
    title: '复习与巩固技巧',
    tag: '技巧',
    summary: '科学的复习策略帮助您巩固所学知识，防止遗忘，稳步提升韩语水平。',
    readingTime: '4 分钟',
    readCount: 620,
    content: `定期复习是防止遗忘的关键。

复习策略：
• 每学习3-5个新视频后，安排一次集中复习
• 重新观看之前学过的视频，检验自己的理解程度
• 将学到的句型和词汇应用到实际场景中

使用平台的数据统计功能，查看自己的学习进度，合理安排学习计划。已学习的视频可以随时回看，巩固记忆。`,
  },
  {
    id: 'tips',
    title: '学习小贴士',
    tag: '建议',
    summary: '汇集了多位学习者的经验分享，帮助您更高效地规划学习路径。',
    readingTime: '3 分钟',
    readCount: 1100,
    content: `• 每天坚持学习 15-30 分钟，效果最佳
• 先完整观看一遍视频，了解整体内容
• 第二遍时跟随字幕跟读，注意发音
• 将学到的句子应用到实际对话中
• 定期复习已学内容，防止遗忘
• 利用碎片时间观看短视频，提高学习效率
• 多做笔记，记录重点词汇和句型
• 与同学一起学习，互相交流和鼓励`,
  },
]

const tagColors: Record<string, string> = {
  '入门': 'bg-green-100 text-green-700',
  '教程': 'bg-blue-100 text-blue-700',
  '进阶': 'bg-purple-100 text-purple-700',
  '技巧': 'bg-orange-100 text-orange-700',
  '建议': 'bg-teal-100 text-teal-700',
  '口语': 'bg-pink-100 text-pink-700',
}

export default function LearningMethodPage() {
  const [activeId, setActiveId] = useState(articles[0].id)
  const current = articles.find(a => a.id === activeId) || articles[0]

  return (
    <div className="w-full px-4 md:px-6 py-4 pb-20 md:pb-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">学习方法</h1>

        {/* Mobile: horizontal scrollable chips */}
        <div className="md:hidden mb-4 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 w-max">
            {articles.map(article => {
              const isActive = article.id === activeId
              return (
                <button
                  key={article.id}
                  onClick={() => setActiveId(article.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap text-sm transition-colors ${
                    isActive
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    tagColors[article.tag] || 'bg-gray-100 text-gray-600'
                  }`}>
                    {article.tag}
                  </span>
                  {article.title}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-row gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-72 shrink-0">
            <nav className="space-y-3 sticky top-4">
              {articles.map(article => {
                const isActive = article.id === activeId
                return (
                  <button
                    key={article.id}
                    onClick={() => setActiveId(article.id)}
                    className={`w-full text-left rounded-lg border p-3.5 transition-all ${
                      isActive
                        ? 'border-blue-300 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        tagColors[article.tag] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {article.tag}
                      </span>
                    </div>
                    <h3 className={`text-sm font-semibold mb-1 ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      {article.date && (
                        <span className="flex items-center gap-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {article.date}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {article.readingTime}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {article.readCount.toLocaleString()}
                      </span>
                    </div>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Right content — article detail */}
          <main className="flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-semibold">{current.title}</h2>
                {current.date && (
                  <span className="text-xs text-gray-400 ml-auto">{current.date}</span>
                )}
              </div>
              <div className="text-gray-700 text-base leading-7 whitespace-pre-line">
                {current.content}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
