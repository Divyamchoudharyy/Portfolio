import { useEffect, useRef, useState } from 'react';

const PROFILE = {
  name: 'Divyam Choudhary',
  email: 'divyamchoudhary15@gmail.com',
  github: 'https://github.com/Divyamchoudharyy',
  linkedin: 'https://www.linkedin.com/in/divyamchoudharyy/',
  location: 'New Delhi, India',
};

const projects = [
  {
    number: '01',
    name: 'ORBIT',
    eyebrow: 'FLAGSHIP / AGENTIC AI',
    title: 'A research workflow, orchestrated by agents.',
    description:
      'An autonomous deep-research engine built around a LangGraph supervisor and four specialized agents. It plans a research task, gathers evidence, critiques gaps, pauses for human review, and turns findings into cited reports.',
    stack: ['Python', 'LangGraph', 'LangChain', 'FastAPI', 'Tavily', 'LangSmith'],
    href: 'https://github.com/Divyamchoudharyy/orbit-research-engine',
    linkLabel: 'Explore repository',
    visual: 'orbit',
    metrics: [
      ['04', 'specialized agents'],
      ['HITL', 'human review'],
      ['SSE', 'live execution logs'],
    ],
  },
  {
    number: '02',
    name: 'Locust Watch',
    eyebrow: 'FULL-STACK MACHINE LEARNING',
    title: 'A more realistic view of environmental risk.',
    description:
      'An end-to-end desert-locust risk predictor combining 2,500+ FAO swarm records with TerraClimate variables. A Logistic Regression model is served through FastAPI and an interactive React + Leaflet map. Spatial validation replaced an overly optimistic random split and better reflected geographic generalization.',
    stack: ['Python', 'xarray', 'Scikit-learn', 'FastAPI', 'React', 'Leaflet'],
    href: 'https://github.com/Divyamchoudharyy/locust-watch',
    demo: 'https://locust-watch.netlify.app',
    linkLabel: 'Explore repository',
    visual: 'map',
    metrics: [
      ['0.76', 'spatial CV ROC-AUC'],
      ['~79%', 'real-swarm catch rate'],
      ['2,500+', 'FAO swarm records'],
    ],
  },
  {
    number: '03',
    name: 'Drug Discovery AI',
    eyebrow: 'APPLIED MACHINE LEARNING',
    title: 'Testing molecular predictions beyond random splits.',
    description:
      'A blood-brain barrier permeability classifier trained on 2,050 compounds using RDKit Morgan fingerprints and Random Forest. Scaffold-based evaluation tested performance on unseen molecular core structures.',
    stack: ['Python', 'RDKit', 'Morgan fingerprints', 'Random Forest', 'Scikit-learn'],
    href: 'https://github.com/Divyamchoudharyy/drug-discovery-ai',
    linkLabel: 'Explore repository',
    visual: 'molecule',
    metrics: [
      ['0.936', 'random-split ROC-AUC'],
      ['0.884', 'scaffold-split ROC-AUC'],
      ['2,050', 'compounds'],
    ],
  },
];

const skillGroups = [
  {
    number: '01',
    label: 'Programming & CS',
    note: 'Skills listed on the résumé',
    items: ['C++', 'Python', 'JavaScript', 'SQL', 'Data Structures & Algorithms', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks'],
  },
  {
    number: '02',
    label: 'Backend & Web',
    note: 'Skills listed on the résumé',
    items: ['FastAPI', 'REST APIs', 'React.js', 'API Integration'],
  },
  {
    number: '03',
    label: 'AI / ML & Data',
    note: 'Skills listed on the résumé',
    items: ['Gemini API', 'Tool Calling', 'Prompt Engineering', 'Scikit-learn', 'Pandas', 'NumPy', 'RDKit', 'xarray'],
  },
  {
    number: '04',
    label: 'Project Stack & Tools',
    note: 'Additional technologies documented across ORBIT and other projects',
    items: ['LangGraph', 'LangChain', 'Groq', 'Tavily', 'ArXiv', 'LangSmith', 'Streamlit', 'SQLite', 'PostgreSQL', 'Docker', 'Git', 'GitHub', 'Linux', 'Render', 'Netlify'],
  },
];

const starterQuestions = [
  'Explain ORBIT\'s architecture.',
  'What did Divyam build at GSIT?',
  'How did he evaluate Locust Watch?',
  'Tell me about the Drug Discovery project.',
];

function normalizeAssistantMarkdown(value) {
  return String(value || '')
    .replace(/\\([\\`*_{}\[\]()#+.!|>~-])/g, '$1')
    .replace(/&#x20;/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();
}

function renderInlineMarkdown(value, keyPrefix = 'inline') {
  const pattern = /(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s]+|\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_)/g;
  return String(value).split(pattern).filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    const markdownLink = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (markdownLink) return <a key={key} href={markdownLink[2]} target="_blank" rel="noreferrer">{markdownLink[1]}</a>;
    if (/^https?:\/\//.test(part)) {
      const cleanUrl = part.replace(/[),.;!?]+$/, '');
      const trailing = part.slice(cleanUrl.length);
      return <span key={key}><a href={cleanUrl} target="_blank" rel="noreferrer">{cleanUrl}</a>{trailing}</span>;
    }
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) return <code key={key}>{part.slice(1, -1)}</code>;
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function AssistantMarkdown({ content }) {
  const lines = normalizeAssistantMarkdown(content).split(/\r?\n/);
  const blocks = [];
  let index = 0;

  const isTableSeparator = (line) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
  const isTableRow = (line) => line.trim().startsWith('|') && line.trim().endsWith('|');
  const cellsFrom = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
  const isListItem = (line) => /^\s*(?:[-*•]|\d+[.)])\s+/.test(line);

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }

    if (isTableRow(line) && lines[index + 1] && isTableSeparator(lines[index + 1])) {
      const headers = cellsFrom(line);
      index += 2;
      const rows = [];
      while (index < lines.length && isTableRow(lines[index].trim())) {
        rows.push(cellsFrom(lines[index]));
        index += 1;
      }
      blocks.push(
        <div className="chat-table-wrap" key={`table-${blocks.length}`}>
          <table className="chat-table">
            <thead><tr>{headers.map((cell, cellIndex) => <th key={cellIndex}>{renderInlineMarkdown(cell, `th-${blocks.length}-${cellIndex}`)}</th>)}</tr></thead>
            <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((_, cellIndex) => <td key={cellIndex}>{renderInlineMarkdown(row[cellIndex] || '', `td-${blocks.length}-${rowIndex}-${cellIndex}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const HeadingTag = heading[1].length === 1 ? 'h3' : heading[1].length === 2 ? 'h4' : 'h5';
      blocks.push(<HeadingTag key={`heading-${blocks.length}`}>{renderInlineMarkdown(heading[2], `heading-${blocks.length}`)}</HeadingTag>);
      index += 1;
      continue;
    }

    if (isListItem(line)) {
      const ordered = /^\s*\d+[.)]/.test(line);
      const items = [];
      while (index < lines.length && isListItem(lines[index])) {
        items.push(lines[index].replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim());
        index += 1;
      }
      const ListTag = ordered ? 'ol' : 'ul';
      blocks.push(<ListTag key={`list-${blocks.length}`}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInlineMarkdown(item, `li-${blocks.length}-${itemIndex}`)}</li>)}</ListTag>);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isTableRow(lines[index].trim()) && !/^#{1,3}\s+/.test(lines[index].trim()) && !isListItem(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${blocks.length}`}>{renderInlineMarkdown(paragraph.join(' '), `p-${blocks.length}`)}</p>);
  }
  return <div className="chat-markdown">{blocks}</div>;
}

function ArrowUpRight({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GithubIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.23-1.63-1.23-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.7-1.49-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.04-1.14 3.04-1.14.61 1.54.23 2.68.12 2.96.71.78 1.14 1.77 1.14 2.99 0 4.27-2.6 5.22-5.08 5.5.4.35.75 1.02.75 2.06v3.07c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" /></svg>;
}

function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.45H4.98V9h2.95v9.45ZM6.45 7.71a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12 10.74H15.5v-4.6c0-1.1-.02-2.52-1.54-2.52-1.54 0-1.78 1.2-1.78 2.44v4.68H9.23V9h2.83v1.29h.04c.39-.74 1.36-1.52 2.8-1.52 2.99 0 3.55 1.97 3.55 4.54v5.14Z" /></svg>;
}

function MenuIcon({ open }) {
  return open
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

function OrbitGraphic() {
  const [activeAgent, setActiveAgent] = useState('');
  const agents = [
    { id: 'planner', step: '01 / PLAN', name: 'Planner', description: 'Breaks down the task', detail: 'Turns the research prompt into a clear sequence of focused sub-tasks.', position: 'agent-planner', path: 'M300 218 C220 165 170 115 118 95' },
    { id: 'researcher', step: '02 / RETRIEVE', name: 'Researcher', description: 'Finds supporting evidence', detail: 'Gathers supporting material from connected research sources.', position: 'agent-researcher', path: 'M300 218 C380 165 430 115 482 95' },
    { id: 'critic', step: '03 / EVALUATE', name: 'Critic', description: 'Checks gaps and quality', detail: 'Reviews evidence, identifies gaps and decides whether another research pass is needed.', position: 'agent-critic', path: 'M300 218 C220 270 170 330 118 355' },
    { id: 'writer', step: '04 / SYNTHESIZE', name: 'Writer', description: 'Builds the final report', detail: 'Synthesizes reviewed findings into a structured report with citations.', position: 'agent-writer', path: 'M300 218 C380 270 430 330 482 355' },
  ];
  const active = agents.find((agent) => agent.id === activeAgent);

  return (
    <div className={`orbit-diagram ${activeAgent ? 'has-active-agent' : ''}`} aria-label="Interactive ORBIT system map. Focus or hover over an agent to see its role.">
      <div className="diagram-toolbar"><span><i className="status-dot" /> ORBIT / SYSTEM MAP</span><span>01 — 04 AGENTS</span></div>
      <svg className="diagram-connectors" viewBox="0 0 600 460" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="connector" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f2f2ed" stopOpacity=".12"/><stop offset=".5" stopColor="#f2f2ed" stopOpacity=".75"/><stop offset="1" stopColor="#f2f2ed" stopOpacity=".12"/></linearGradient>
        </defs>
        {agents.map((agent, index) => <path key={agent.id} className={`connector-path connector-delay-${index} ${activeAgent === agent.id ? 'is-active' : ''}`} d={agent.path} />)}
        <path d="M118 95 Q300 -5 482 95 M118 355 Q300 455 482 355" stroke="url(#connector)" strokeWidth="1" strokeDasharray="3 8" fill="none" opacity=".35" />
        <circle cx="300" cy="218" r="108" className="diagram-orbit-ring diagram-orbit-ring-outer" />
        <circle cx="300" cy="218" r="82" className="diagram-orbit-ring diagram-orbit-ring-inner" />
        {agents.map((agent) => <circle key={`node-${agent.id}`} r="4" className={`connector-node ${activeAgent === agent.id ? 'is-active' : ''}`}>
          <animateMotion dur="5.5s" repeatCount="indefinite" path={agent.path} begin={agent.id === 'planner' ? '0s' : agent.id === 'researcher' ? '-1.3s' : agent.id === 'critic' ? '-2.7s' : '-4s'} />
        </circle>)}
      </svg>
      <div className={`diagram-core ${activeAgent ? 'is-focused' : ''}`}>
        <span className="core-orbit">O</span><strong>ORBIT</strong><small>{active ? `FOCUS / ${active.name.toUpperCase()}` : 'SUPERVISOR'}</small>
      </div>
      {agents.map((agent) => (
        <button
          className={`diagram-agent ${agent.position} ${activeAgent === agent.id ? 'is-active' : ''}`}
          key={agent.id}
          type="button"
          aria-pressed={activeAgent === agent.id}
          aria-label={`${agent.name}: ${agent.detail}`}
          onMouseEnter={() => setActiveAgent(agent.id)}
          onMouseLeave={() => setActiveAgent('')}
          onFocus={() => setActiveAgent(agent.id)}
          onBlur={(event) => {
            if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setActiveAgent('');
          }}
          onClick={() => setActiveAgent(agent.id)}
        >
          <span>{agent.step}</span><strong>{agent.name}</strong><small>{agent.description}</small>
        </button>
      ))}
      <div className="diagram-detail" aria-live="polite">{active ? active.detail : 'SELECT AN AGENT TO EXPLORE THE WORKFLOW'}</div>
      <div className="diagram-foot"><span>PLAN</span><b /> <span>RESEARCH</span><b /> <span>CRITIQUE</span><b /> <span>WRITE</span></div>
    </div>
  );
}

function ProjectVisual({ type }) {
  if (type === 'orbit') {
    return (
      <div className="project-visual visual-orbit" aria-hidden="true">
        <span className="visual-orbit-ring visual-ring-one" /><span className="visual-orbit-ring visual-ring-two" />
        <div className="visual-orbit-center">O</div>
        <span className="visual-agent visual-agent-a">PLAN</span><span className="visual-agent visual-agent-b">RETRIEVE</span><span className="visual-agent visual-agent-c">CRITIQUE</span><span className="visual-agent visual-agent-d">WRITE</span>
      </div>
    );
  }
  if (type === 'map') {
    return (
      <div className="project-visual visual-map" aria-hidden="true">
        <div className="map-grid" />
        <svg viewBox="0 0 460 230" className="map-contours"><path d="M-10 150C45 100 67 193 123 143s88-32 124 9 78 25 108-24 54-44 115-18"/><path d="M-10 179c62-39 85 42 148-2s75-28 115 8 80 12 112-31 49-45 105-17"/><path d="M-10 105c58-62 91 25 147-26s77-12 112 23 83 19 116-26 53-38 105-2"/></svg>
        <span className="map-pin map-pin-one"/><span className="map-pin map-pin-two"/><span className="map-pin map-pin-three"/>
        <span className="map-label">SPATIAL VALIDATION / RISK SIGNALS</span>
      </div>
    );
  }
  return (
    <div className="project-visual visual-molecule" aria-hidden="true">
      <svg viewBox="0 0 460 230">
        <g stroke="currentColor" strokeOpacity=".5" strokeWidth="2" fill="none"><path d="m112 112 68-48 76 38 72-41 47 69-61 55-70-27-70 42-62-52Z"/><path d="m180 64 14 76m62-38 32 82m40-123 18 96m-173-79-7 91" strokeOpacity=".2"/></g>
        {[[112,112],[180,64],[256,102],[328,61],[375,130],[314,185],[244,158],[174,200]].map(([x,y], index) => <circle key={index} cx={x} cy={y} r={index % 3 === 0 ? 10 : 7} fill="currentColor" fillOpacity={index % 3 === 0 ? '.9' : '.58'} />)}
      </svg>
      <span className="molecule-label">MOLECULAR FINGERPRINT / 2,050 COMPOUNDS</span>
    </div>
  );
}

function ProjectCard({ project, featured = false }) {
  return (
    <article className={`project-card ${featured ? 'project-card-featured' : ''} reveal`}>
      <div className="project-card-top"><span>{project.number} / SELECTED WORK</span><span>{project.eyebrow}</span></div>
      <ProjectVisual type={project.visual} />
      <div className="project-copy">
        <div className="project-title-row"><h3>{project.name}</h3>{featured && <span className="featured-label">FLAGSHIP PROJECT</span>}</div>
        <h4>{project.title}</h4>
        <p>{project.description}</p>
        <div className="project-metrics">{project.metrics.map(([value, label]) => <div className="project-metric" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
        <div className="tag-list">{project.stack.map((item) => <span className="tag" key={item}>{item}</span>)}</div>
        <div className="project-links"><a href={project.href} target="_blank" rel="noreferrer" className="text-link">{project.linkLabel} <ArrowUpRight /></a>{project.demo && <a href={project.demo} target="_blank" rel="noreferrer" className="text-link secondary-link">Live demo <ArrowUpRight /></a>}</div>
      </div>
    </article>
  );
}

function AskAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const transcriptRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [messages, isLoading]);

  async function sendMessage(value = input) {
    const text = value.trim();
    if (!text || isLoading) return;
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.slice(-8) }),
      });

      if (!response.ok) {
        let detail = 'The assistant could not respond right now.';
        try {
          const data = await response.json();
          detail = data.error || detail;
        } catch { /* keep fallback message */ }
        throw new Error(detail);
      }
      if (!response.body) throw new Error('Streaming is not available in this browser.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let answer = '';
      let done = false;

      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        buffer += decoder.decode(chunk.value || new Uint8Array(), { stream: !done });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          for (const line of event.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (payload === '[DONE]') continue;
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                answer += delta;
                setMessages([...nextMessages, { role: 'assistant', content: answer }]);
              }
              if (parsed.error) throw new Error(parsed.error.message || 'The model returned an error.');
            } catch (parseError) {
              if (parseError instanceof SyntaxError) continue;
              throw parseError;
            }
          }
        }
      }

      if (!answer.trim()) throw new Error('The assistant returned an empty response. Please try again.');
    } catch (requestError) {
      const message = requestError.message || 'Something went wrong. Please try again.';
      setError(message);
      setMessages(nextMessages);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  return (
    <div className="assistant-layout">
      <div className="assistant-intro reveal">
        <span className="section-kicker">05 / PORTFOLIO ASSISTANT</span>
        <h2>Ask about the <em>work.</em></h2>
        <p>A small, grounded assistant that can walk through my projects, technical decisions, experience and tools. Answers are based on a curated set of portfolio notes.</p>
        <div className="assistant-tech"><span>GROQ INFERENCE</span><i /> <span>BM25 RETRIEVAL</span><i /> <span>CURATED CONTEXT</span></div>
        <span className="assistant-note">It is a portfolio guide, not a general-purpose chatbot.</span>
      </div>

      <div className="assistant-window reveal">
        <div className="assistant-window-head">
          <div className="assistant-window-brand"><span className="assistant-mark">D.</span><div><strong>DIVYAM.AI</strong><small>PROJECT & PROFILE KNOWLEDGE</small></div></div>
          <div className="assistant-status"><i /> READY</div>
        </div>
        <div className="assistant-transcript" ref={transcriptRef} aria-live="polite" aria-label="Assistant conversation">
          {messages.length === 0 ? (
            <div className="assistant-welcome">
              <span className="welcome-index">// INITIALIZE_QUERY</span>
              <h3>What would you like to know?</h3>
              <p>Ask about a project, implementation choice, metric or experience.</p>
              <div className="question-list">
                {starterQuestions.map((question) => <button type="button" key={question} onClick={() => sendMessage(question)} disabled={isLoading}>{question}<ArrowUpRight size={13}/></button>)}
              </div>
            </div>
          ) : (
            <div className="message-list">
              <div className="assistant-system-note">SESSION / PORTFOLIO KNOWLEDGE BASE</div>
              {messages.map((message, index) => (
                <div className={`chat-message ${message.role === 'user' ? 'chat-user' : 'chat-assistant'}`} key={`${message.role}-${index}`}>
                  <span className="message-role">{message.role === 'user' ? 'YOU' : 'DIVYAM.AI'}</span>
                  {message.role === 'assistant'
                    ? <AssistantMarkdown content={message.content || (isLoading && index === messages.length - 1 ? 'Thinking through the relevant project notes…' : '')} />
                    : <p>{message.content}</p>}
                </div>
              ))}
              {isLoading && <div className="typing-indicator"><i/><i/><i/></div>}
            </div>
          )}
        </div>
        {error && <div className="assistant-error" role="alert">{error} <button type="button" onClick={() => setError('')}>Dismiss</button></div>}
        <form className="assistant-composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="assistant-question">Ask a question about Divyam</label>
          <span className="composer-prompt">›</span>
          <input ref={inputRef} id="assistant-question" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about a project, skill or experience…" maxLength={600} disabled={isLoading}/>
          <button type="submit" disabled={isLoading || !input.trim()} aria-label="Send question">{isLoading ? <span className="send-spinner"/> : <ArrowUpRight size={18}/>}</button>
        </form>
        <div className="assistant-window-foot"><span>GROQ / GPT-OSS 120B</span><span>DO NOT SHARE SENSITIVE INFORMATION</span></div>
      </div>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  }

  return (
    <div className="site-shell">
      <div className="grain" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="Divyam Choudhary home">
          <span className="brand-full">DIVYAM CHOUDHARY</span>
          <span className="brand-mobile">DIVYAM</span>
        </a>
        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <a href="#work" onClick={closeMenu}>Work</a>
          <a href="#experience" onClick={closeMenu}>Experience</a>
          <a href="#toolkit" onClick={closeMenu}>Toolkit</a>
          <a href="#ask" onClick={closeMenu}>Ask AI</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#contact" className="nav-contact" onClick={closeMenu}>Contact <ArrowUpRight size={13}/></a>
        </nav>
        <a className="header-availability" href="#contact"><span /> OPEN TO OPPORTUNITIES</a>
        <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}><MenuIcon open={menuOpen}/></button>
      </header>

      <main>
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <div className="hero-meta reveal"><span className="meta-line"/> <strong>DIVYAM CHOUDHARY</strong> <span className="meta-slash">/</span> AI ENGINEER <span className="meta-slash">/</span> VIT BHOPAL '27</div>
            <div className="hero-focus-tag reveal"><span className="focus-tag-mark"/> AGENTIC AI <span>/</span> MULTI-AGENT SYSTEMS</div>
            <h1 className="reveal">I BUILD<br/><span>AGENTIC AI</span><br/>SYSTEMS<span className="hero-period">.</span></h1>
            <p className="hero-lede reveal">I build practical AI systems that bring together LLMs, external tools and multi-agent workflows — turning complex ideas into working applications.</p>
            <div className="hero-actions reveal">
              <a href="#work" className="button button-primary">View selected work <ArrowUpRight /></a>
              <a href="#ask" className="button button-outline">Ask my AI <span>↗</span></a>
            </div>
            <div className="hero-socials reveal">
              <a href={PROFILE.github} target="_blank" rel="noreferrer"><GithubIcon/> GitHub</a>
              <span className="social-divider"/><a href={PROFILE.linkedin} target="_blank" rel="noreferrer"><LinkedInIcon/> LinkedIn</a>
              <span className="social-divider"/><span className="location-label">{PROFILE.location}</span>
            </div>
          </div>
          <div className="hero-visual reveal"><OrbitGraphic/><div className="hero-visual-caption"><span>ORCHESTRATION / 04 AGENTS</span><span>HUMAN-IN-THE-LOOP</span><a href={projects[0].href} target="_blank" rel="noreferrer">EXPLORE ORBIT <ArrowUpRight size={11}/></a></div></div>
          <div className="hero-bottomline"><span>SCROLL TO EXPLORE</span><span className="scroll-mark">↓</span><span className="hero-index">PORTFOLIO — {new Date().getFullYear()}</span></div>
        </section>

        <section className="intro-strip">
          <div className="section-wrap intro-grid reveal"><span className="section-kicker">A LITTLE CONTEXT</span><p>Not just prompts and responses. I'm interested in systems that can <strong>plan, use tools, evaluate their work</strong> and remain useful beyond a demo.</p></div>
        </section>

        <section className="content-section section-wrap" id="about">
          <div className="section-heading reveal"><span className="section-kicker">01 / ABOUT</span><h2>Curious by nature.<br/><em>Engineer by practice.</em></h2></div>
          <div className="about-grid">
            <div className="about-main reveal">
              <p className="large-copy">I'm Divyam — a Computer Science undergraduate at VIT Bhopal University, graduating in 2027, with a CGPA of 8.44.</p>
              <p>My current focus is Agentic AI and multi-agent systems: designing workflows where language models can break down tasks, work with external tools, coordinate specialized agents and produce useful outcomes.</p>
              <p>My background also includes applied machine learning and full-stack development. Projects in environmental risk prediction and molecular property classification taught me to look beyond convenient test splits and think carefully about generalization.</p>
            </div>
            <aside className="about-aside reveal">
              <div className="aside-rule"/>
              <div className="aside-item"><span>01</span><div><strong>Build beyond the prompt</strong><p>Useful agents need orchestration, tools and boundaries.</p></div></div>
              <div className="aside-item"><span>02</span><div><strong>Measure what matters</strong><p>Evaluation should reflect the conditions a system will face.</p></div></div>
              <div className="aside-item"><span>03</span><div><strong>Ship the whole thing</strong><p>From model logic to APIs, interfaces and observability.</p></div></div>
            </aside>
          </div>
        </section>

        <section className="content-section work-section" id="work">
          <div className="section-wrap">
            <div className="section-heading section-heading-row reveal"><div><span className="section-kicker">02 / SELECTED WORK</span><h2>Things I've <em>built.</em></h2></div><p className="section-note">A mix of agentic systems and applied machine learning — built to solve a problem, not just to fill a grid.</p></div>
            <div className="projects-grid">{projects.map((project, index) => <ProjectCard key={project.number} project={project} featured={index === 0}/>)}</div>
          </div>
        </section>

        <section className="content-section section-wrap" id="experience">
          <div className="section-heading reveal"><span className="section-kicker">03 / EXPERIENCE & EDUCATION</span><h2>Learning by <em>building.</em></h2></div>
          <div className="timeline">
            <article className="timeline-entry reveal">
              <div className="timeline-date">APR 2026 — JUN 2026</div><div className="timeline-mark"><span/></div>
              <div className="timeline-content"><span className="timeline-type">INTERNSHIP / REMOTE</span><h3>AI/ML Intern <span>@ GSIT Innovators Pvt. Ltd.</span></h3>
                <p>Developed Python customer-support agents using the Google Gemini API to automate replies to customer queries.</p>
                <ul className="experience-points"><li>Implemented tool calling so agents could fetch live data from external APIs and ground replies in current information.</li><li>Iterated on prompts and response-handling logic to improve relevance and consistency.</li></ul>
                <div className="tag-list"><span className="tag">Python</span><span className="tag">Gemini API</span><span className="tag">Tool Calling</span><span className="tag">External APIs</span></div>
              </div>
            </article>
            <article className="timeline-entry reveal">
              <div className="timeline-date">2023 — 2027</div><div className="timeline-mark"><span/></div>
              <div className="timeline-content"><span className="timeline-type">EDUCATION</span><h3>B.Tech, Computer Science & Engineering <span>@ VIT Bhopal University</span></h3><p>Undergraduate study in computer science and engineering.</p><div className="education-meta"><span>Graduating 2027</span><i/><span>CGPA 8.44 / 10</span></div></div>
            </article>
          </div>
          <div className="recognition-row reveal"><div className="recognition-title"><span className="section-kicker">TRAINING & ACHIEVEMENTS</span><strong>Learning from the field.</strong></div><div className="recognition-item"><span className="recognition-symbol">✳</span><div><strong>Amazon ML Summer School 2025</strong><small>Selected mentee · Aug–Sep 2025</small></div></div></div>
        </section>

        <section className="toolkit-section" id="toolkit">
          <div className="section-wrap"><div className="section-heading section-heading-row reveal"><div><span className="section-kicker">04 / TECHNICAL TOOLKIT</span><h2>Tools for the <em>work.</em></h2></div><p className="section-note">The first three groups reflect résumé-listed skills. The final group separates additional technologies documented across my projects.</p></div>
            <div className="skills-grid">{skillGroups.map((group) => <div className="skill-group reveal" key={group.number}><div className="skill-group-top"><span>{group.number}</span><div className="skill-group-heading"><h3>{group.label}</h3><small>{group.note}</small></div></div><div className="skill-chips">{group.items.map((item) => <span key={item}>{item}</span>)}</div></div>)}</div>
          </div>
        </section>

        <section className="assistant-section section-wrap" id="ask"><AskAssistant/></section>

        <section className="contact-section section-wrap" id="contact">
          <div className="contact-panel reveal"><div className="contact-orbit" aria-hidden="true"><span/><span/><span/></div><span className="section-kicker">06 / THE NEXT THING</span><h2>Have a problem<br/>worth <em>building for?</em></h2><p>I'm looking for opportunities to contribute to AI engineering, Agentic AI and software development teams. Always happy to connect with thoughtful builders.</p>
            <div className="contact-actions"><a className="button button-primary" href={`mailto:${PROFILE.email}`}>Email me <ArrowUpRight/></a><button className="button button-outline copy-button" onClick={copyEmail}>{copied ? 'Email copied ✓' : 'Copy email'}</button></div>
            <div className="contact-socials"><a href={PROFILE.linkedin} target="_blank" rel="noreferrer"><LinkedInIcon/> LinkedIn <ArrowUpRight size={13}/></a><a href={PROFILE.github} target="_blank" rel="noreferrer"><GithubIcon/> GitHub <ArrowUpRight size={13}/></a></div>
          </div>
        </section>
      </main>

      <footer className="site-footer section-wrap"><a className="brand footer-brand" href="#home" aria-label="Back to top — Divyam Choudhary">DIVYAM CHOUDHARY</a><span>DESIGNED & BUILT WITH INTENT.</span><span>© {new Date().getFullYear()} DIVYAM CHOUDHARY</span><a href="#home" className="back-top">BACK TO TOP ↑</a></footer>
    </div>
  );
}

export default App;
