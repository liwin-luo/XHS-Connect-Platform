'use client';

import React, { useState } from 'react';

const FEATURES = [
  {
    icon: '🔍',
    title: '智能博主发现',
    desc: '浏览小红书博主主页时，插件自动提取互动数据、计算综合评分，一键加入意向清单。评分维度可自定义权重。',
  },
  {
    icon: '📊',
    title: '多维评分系统',
    desc: '基于互动率、粉丝量、活跃度三个维度，结合品类基准自动评分 0-100。权重自由调节，适配美妆、美食、穿搭等不同垂直品类。',
  },
  {
    icon: '🤖',
    title: 'AI 批量触达',
    desc: '输入品牌和产品信息，AI 自动为每位博主生成个性化合作邀约私信。支持专业、友好、种草等四种语气风格。',
  },
  {
    icon: '💬',
    title: '智能回复分析',
    desc: '博主回复后，AI 自动识别合作意图（感兴趣/询价/拒绝），分析置信度并建议下一步操作：发详情 / 跟进 / 归档。',
  },
  {
    icon: '📋',
    title: '跟进管理',
    desc: '自动记录沟通历史和回复状态。7天未回复自动生成跟进文案，可预设 3 天 / 7 天跟进提醒，不遗漏任何潜在合作。',
  },
  {
    icon: '☁️',
    title: '云端同步',
    desc: '数据存储在 Vercel Postgres 云端，多设备间自动同步。API Key 安全鉴权，LLM 请求走服务端代理，不暴露密钥。',
  },
];

const STEPS = [
  { num: '01', title: '安装插件', desc: 'Chrome 扩展商店安装 XHS Connect，浏览博主页面自动生成评分面板。' },
  { num: '02', title: '注册账户', desc: '在官网用邮箱注册，获取 API Key。填入插件设置即可开启云端同步。' },
  { num: '03', title: '创建活动', desc: '在插件中填写品牌、产品、卖点等信息，选择沟通语气风格。' },
  { num: '04', title: '筛选博主', desc: '从意向清单中按评分、品类、状态筛选目标博主，批量选中。' },
  { num: '05', title: 'AI 生成消息', desc: '点击生成，AI 为每位博主个性化编写合作邀约消息，可手动微调。' },
  { num: '06', title: '发送 & 跟进', desc: '发送后自动追踪回复，AI 分析意图，到期提醒跟进。' },
];

const FAQS = [
  { q: '完全免费吗？', a: '是的。后端部署在 Vercel Hobby 计划，API 执行 100h/天 + 256MB 数据库，个人和小团队完全够用。您只需自备 LLM API Key（DeepSeek 很便宜）。' },
  { q: '需要自己部署后端吗？', a: '不需要。直接使用我们部署好的服务即可。如果想自部署，项目开源，一键部署到 Vercel。' },
  { q: '插件和网页怎么配合？', a: '插件负责小红书页面数据采集和 UI 交互，网页端提供后端 API 存储、AI 代理、评分引擎。在插件设置页填入网页地址和 API Key 即可打通。' },
  { q: 'AI 支持哪些模型？', a: '支持 DeepSeek 和 OpenAI。在 Vercel 环境变量中配置即可，插件端不用关心模型细节。DeepSeek 性价比最高。' },
  { q: '数据安全吗？', a: 'API Key 存在服务端环境变量中，插件只存一个认证 Token。所有 LLM 请求走后端代理，不会直接从浏览器调 API。数据传输使用 HTTPS。' },
  { q: '可以自部署吗？', a: '完全开源，MIT 协议。Fork 后配置 Vercel Postgres 和 LLM Key 即可一键部署。' },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [registering, setRegistering] = useState(false);
  const [apiKeyResult, setApiKeyResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setRegistering(true);
    setError(null);
    setApiKeyResult(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setApiKeyResult(data.data.apiKey);
      } else {
        setError(data.error || '注册失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setRegistering(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col min-h-full">

      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/70 backdrop-blur-2xl border-b border-white/[0.03]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-bold tracking-tight">
            <span className="gradient-text">XHS Connect</span>
          </span>
          <div className="hidden sm:flex items-center gap-8">
            {[
              { label: '功能', href: '#features' },
              { label: '流程', href: '#how-it-works' },
              { label: 'API', href: '#api' },
              { label: '常见问题', href: '#faq' },
            ].map(item => (
              <a key={item.href} href={item.href} className="text-xs text-gray-500 hover:text-gray-200 transition-colors">
                {item.label}
              </a>
            ))}
            <a href="#get-started" className="text-xs bg-accent/15 text-accent px-4 py-1.5 rounded-full font-medium hover:bg-accent/25 transition-all">
              免费开始
            </a>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-purple-600/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] text-gray-400 font-medium">免费 · 开源 · Chrome 插件 + 云服务</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            小红书商家
            <br />
            <span className="gradient-text">博主智能对接</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI 驱动的博主发现、综合评分、批量沟通一站式工具。
            <br />
            Chrome 插件采集数据，云端 API 存储分析，LLM 代理生成消息。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#get-started" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all glow-md">
              免费获取 API Key
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a href="#features" className="inline-flex items-center gap-2 border border-white/[0.08] text-gray-400 px-6 py-2.5 rounded-full text-sm font-medium hover:border-white/[0.15] hover:text-gray-200 transition-all">
              查看功能
            </a>
          </div>

          {/* Plugin Mockup */}
          <div className="mt-16 max-w-2xl mx-auto plugin-mockup glow-md">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.05]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[10px] text-gray-500 font-mono">XHS Connect — 小红书博主对接助手</span>
              </div>
            </div>
            <div className="p-5 flex gap-4">
              {/* Left: Plugin score panel */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center text-sm">🧑‍🎨</div>
                  <div>
                    <div className="text-xs font-medium">小A种草日记 ✨</div>
                    <div className="text-[9px] text-gray-500">美妆 · 5.2w 粉丝</div>
                  </div>
                </div>

                <div className="bg-white/[0.03] rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">综合评分</span>
                    <span className="gradient-text-simple font-bold text-lg">9.2</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { label: '互动表现', value: 85, color: 'bg-purple-500' },
                      { label: '影响力', value: 62, color: 'bg-indigo-500' },
                      { label: '活跃度', value: 91, color: 'bg-cyan-500' },
                    ].map(bar => (
                      <div key={bar.label} className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500 w-12">{bar.label}</span>
                        <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.value}%` }} />
                        </div>
                        <span className="text-[9px] text-gray-500 w-6 text-right">{bar.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <span className="text-[9px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full">美妆</span>
                  <span className="text-[9px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full">护肤</span>
                  <span className="text-[9px] bg-white/[0.05] text-gray-400 px-2 py-0.5 rounded-full">生活方式</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button className="flex-1 text-[10px] bg-purple-600/20 text-purple-300 py-1.5 rounded-lg font-medium hover:bg-purple-600/30 transition-colors">加入清单</button>
                  <button className="flex-1 text-[10px] border border-white/[0.08] text-gray-400 py-1.5 rounded-lg hover:border-white/[0.15] transition-colors">复制信息</button>
                </div>
              </div>

              {/* Right: Stats */}
              <div className="w-36 space-y-2">
                <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                  <div className="text-[9px] text-gray-500">互动率</div>
                  <div className="text-sm font-bold text-green-400">8.3%</div>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                  <div className="text-[9px] text-gray-500">近10篇平均</div>
                  <div className="text-sm font-bold text-blue-400">2,400</div>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                  <div className="text-[9px] text-gray-500">笔记总数</div>
                  <div className="text-sm font-bold text-amber-400">186</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-6 border-t border-white/[0.03]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag tag-purple mb-4 inline-flex">六大核心功能</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">从发现到成交，一整套工具</h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              告别 Excel 表格和手动私信。插件 + 云端 + AI，帮你把商务对接效率提升 10 倍。
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="glass-card p-5 group">
                <div className="icon-circle mb-4">{f.icon}</div>
                <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/[0.03]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag tag-green mb-4 inline-flex">六步上手</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">5 分钟完成配置</h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              从安装插件到发出第一条合作邀约，只需要 5 分钟。
            </p>
          </div>

          <div className="relative">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-6 pb-12 last:pb-0 relative">
                {i < STEPS.length - 1 && <div className="step-line" />}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-accent z-10">
                  {step.num}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-base font-semibold mb-1.5">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== API SECTION ===== */}
      <section id="api" className="py-24 px-6 border-t border-white/[0.03]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag tag-blue mb-4 inline-flex">开发者友好</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">完整的 REST API</h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              所有功能都有 API 端点，可以集成到你自己的工具链中。
            </p>
          </div>

          <div className="glass-card p-6 mb-8">
            <div className="text-xs text-gray-400 mb-4 font-mono">
              # 注册获取 API Key
            </div>
            <div className="code-block font-mono text-xs text-gray-300">
              <span className="text-green-400">$</span>{' '}
              curl -X POST https://xhs-connect.vercel.app/api/auth \<br />
              {'  '} -H &quot;Content-Type: application/json&quot; \<br />
              {'  '} -d &apos;{'{'}&quot;email&quot;: &quot;your@email.com&quot;{'}'}&apos;
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_2fr] gap-0 text-xs">
              <div className="bg-white/[0.03] px-4 py-2.5 font-semibold text-gray-500">方法</div>
              <div className="bg-white/[0.03] px-4 py-2.5 font-semibold text-gray-500">路径</div>
              <div className="bg-white/[0.03] px-4 py-2.5 font-semibold text-gray-500">说明</div>
              {[
                { method: 'POST', path: '/api/auth', desc: '注册获取 API Key' },
                { method: 'GET', path: '/api/wishlist', desc: '获取意向清单' },
                { method: 'POST', path: '/api/wishlist', desc: '添加博主到清单' },
                { method: 'PUT', path: '/api/wishlist/[id]', desc: '更新清单条目' },
                { method: 'GET', path: '/api/campaigns', desc: '获取活动列表' },
                { method: 'POST', path: '/api/campaigns', desc: '创建活动模板' },
                { method: 'POST', path: '/api/llm/generate', desc: 'AI 生成沟通消息' },
                { method: 'POST', path: '/api/llm/analyze-intent', desc: '分析回复意图' },
                { method: 'GET', path: '/api/settings', desc: '获取品牌设置' },
                { method: 'POST', path: '/api/kols/score', desc: '批量 KOL 评分' },
              ].map((ep, i) => (
                <React.Fragment key={ep.path}>
                  <div className={`px-4 py-2.5 font-mono ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      ep.method === 'GET' ? 'text-green-400 bg-green-400/8' : 'text-blue-400 bg-blue-400/8'
                    }`}>{ep.method}</span>
                  </div>
                  <div className={`px-4 py-2.5 font-mono text-gray-300 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>{ep.path}</div>
                  <div className={`px-4 py-2.5 text-gray-400 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>{ep.desc}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-24 px-6 border-t border-white/[0.03]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="tag tag-green mb-4 inline-flex">完全免费</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">零成本起步</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto mb-10">
            Vercel Hobby 计划，0 元月费。只需自备 LLM API Key。
          </p>

          <div className="max-w-sm mx-auto pricing-highlight rounded-2xl p-8 glow-sm">
            <div className="text-5xl font-bold mb-2 gradient-text">¥0</div>
            <div className="text-xs text-gray-500 mb-6">每月 / 永久免费</div>
            <ul className="text-left space-y-3 mb-8">
              {[
                '无限制 API 请求次数',
                '256MB 云端 PostgreSQL 数据库',
                'AI 消息生成（需自备模型 Key）',
                '多设备数据自动同步',
                '源码开源，MIT 协议',
                '可自部署到自己的 Vercel',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-24 px-6 border-t border-white/[0.03]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">常见问题</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i} className="glass-card group open:border-purple-500/30">
                <summary className="px-5 py-4 text-sm font-medium cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-xs text-gray-400 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GET STARTED (Register) ===== */}
      <section id="get-started" className="py-24 px-6 border-t border-white/[0.03]">
        <div className="max-w-md mx-auto text-center">
          <div className="tag tag-purple mb-4 inline-flex">开始使用</div>
          <h2 className="text-3xl font-bold mb-3">免费获取你的 API Key</h2>
          <p className="text-sm text-gray-400 mb-10">
            输入邮箱，立即注册。无需信用卡。
          </p>

          {apiKeyResult ? (
            <div className="glass-card p-6 text-left space-y-4">
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                注册成功！
              </div>
              <div className="text-xs text-gray-400">
                请保存好以下 API Key，关闭后不再显示：
              </div>
              <div className="flex items-center gap-2 bg-black/40 rounded-lg p-3 border border-white/[0.06]">
                <code className="text-xs text-accent font-mono break-all flex-1">{apiKeyResult}</code>
                <button onClick={() => copyToClipboard(apiKeyResult)} className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
              <div className="text-xs text-gray-500">
                将 API Key 填入 Chrome 插件设置 → 粘贴后端地址 → 即可同步数据
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="glass-card overflow-hidden flex items-center p-1">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={registering}
                  className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {registering ? '注册中...' : '免费获取'}
                </button>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
            </form>
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-10 px-6 border-t border-white/[0.03]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-gray-600">
            <span className="gradient-text font-semibold">XHS Connect</span> · 开源 · MIT License
          </span>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-gray-300 transition-colors">GitHub</a>
            <span>Next.js + Vercel Postgres + Drizzle ORM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
