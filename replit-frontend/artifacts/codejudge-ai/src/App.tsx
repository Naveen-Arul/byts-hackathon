import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, BookOpen, BrainCircuit, Check,
  CheckCircle2, ChevronDown, ChevronRight, CircleHelp, ClipboardCheck, Clock3,
  Code2, Compass, Copy, Database, FileCode2, Filter, Gauge, GraduationCap, Layers3,
  LayoutDashboard, Lightbulb, ListChecks, LockKeyhole, LogIn, LogOut, Menu,
  MoreHorizontal, Pencil, Play, Plus, RefreshCw, Search, Send, Settings,
  ShieldCheck, Sparkles, Terminal, Trash2, Trophy, UserRound, Users, X,
  Zap
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

type Role = 'ADMIN' | 'STUDENT';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

type Question = {
  id: string; title: string; difficulty: Difficulty; topic: string; languages: string[];
  status: 'Published' | 'Draft'; tests: number; created: string; statement: string;
};

const questionsSeed: Question[] = [
  { id: 'q-101', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Sliding Window', languages: ['Python', 'Java', 'C++'], status: 'Published', tests: 4, created: 'May 18, 2025', statement: 'Given a string s, find the length of the longest substring without repeating characters.' },
  { id: 'q-102', title: 'Merge Intervals', difficulty: 'Medium', topic: 'Arrays', languages: ['Python', 'JavaScript', 'Go'], status: 'Published', tests: 5, created: 'May 16, 2025', statement: 'Merge all overlapping intervals and return an array of the non-overlapping intervals.' },
  { id: 'q-103', title: 'Validate Binary Search Tree', difficulty: 'Hard', topic: 'Trees', languages: ['C++', 'Java', 'Python'], status: 'Published', tests: 7, created: 'May 12, 2025', statement: 'Determine whether a binary tree is a valid binary search tree.' },
  { id: 'q-104', title: 'Balanced Brackets', difficulty: 'Easy', topic: 'Stacks', languages: ['Python', 'JavaScript', 'C#'], status: 'Draft', tests: 3, created: 'May 10, 2025', statement: 'Given a string containing brackets, determine if the input string is valid.' },
  { id: 'q-105', title: 'Minimum Path Sum', difficulty: 'Medium', topic: 'Dynamic Programming', languages: ['Python', 'C++', 'Rust'], status: 'Published', tests: 6, created: 'May 08, 2025', statement: 'Find a path from top left to bottom right which minimizes the sum of all numbers along its path.' },
];

const students = [
  { id: 'STU-2048', name: 'Maya Chen', email: 'maya.chen@northstar.edu', dept: 'Computer Science', year: 'Year 3', status: 'Assigned' },
  { id: 'STU-1984', name: 'Elias Romero', email: 'elias.romero@northstar.edu', dept: 'Software Engineering', year: 'Year 2', status: 'Assigned' },
  { id: 'STU-2181', name: 'Nora Patel', email: 'nora.patel@northstar.edu', dept: 'Computer Science', year: 'Year 4', status: 'Not assigned' },
  { id: 'STU-2204', name: 'Jon Bell', email: 'jon.bell@northstar.edu', dept: 'Information Systems', year: 'Year 3', status: 'Assigned' },
];

const submissions = [
  { id: 'sub-784', student: 'Maya Chen', assessment: 'Algorithms · Midterm', question: 'Longest Substring Without Repeating Characters', at: 'Today, 10:42', language: 'Python', score: 91, verdict: 'Excellent', confidence: 94, status: 'Evaluated' },
  { id: 'sub-783', student: 'Elias Romero', assessment: 'Algorithms · Midterm', question: 'Merge Intervals', at: 'Today, 09:18', language: 'Go', score: 78, verdict: 'Good', confidence: 89, status: 'Evaluated' },
  { id: 'sub-782', student: 'Nora Patel', assessment: 'Data Structures · Practice', question: 'Validate Binary Search Tree', at: 'Yesterday, 16:02', language: 'C++', score: 86, verdict: 'Very Good', confidence: 91, status: 'Evaluated' },
  { id: 'sub-781', student: 'Jon Bell', assessment: 'Algorithms · Midterm', question: 'Minimum Path Sum', at: 'Yesterday, 14:27', language: 'Java', score: 69, verdict: 'Needs Improvement', confidence: 83, status: 'Evaluated' },
];

const analytics = [
  { day: 'Mon', score: 72, submissions: 18 }, { day: 'Tue', score: 76, submissions: 24 },
  { day: 'Wed', score: 74, submissions: 21 }, { day: 'Thu', score: 81, submissions: 31 },
  { day: 'Fri', score: 79, submissions: 28 }, { day: 'Sat', score: 84, submissions: 14 },
  { day: 'Sun', score: 82, submissions: 11 },
];

const evaluation = {
  score: 86, verdict: 'Very Good', confidence: 93, language: 'Python',
  problem: 'Longest Substring Without Repeating Characters',
  code: `def length_of_longest_substring(s):\n    seen = set()\n    left = 0\n    best = 0\n    for right, char in enumerate(s):\n        while char in seen:\n            seen.remove(s[left])\n            left += 1\n        seen.add(char)\n        best = max(best, right - left + 1)\n    return best`,
  breakdown: [
    ['Logic correctness', 94, 'Strong'], ['Algorithmic efficiency', 90, 'Optimal'],
    ['Edge case robustness', 82, 'Good'], ['Code quality', 88, 'Strong'],
    ['Security', 96, 'Clear'], ['Explanation consistency', 74, 'Review'],
  ] as [string, number, string][],
};

const agents = ['Intent Detection', 'Logic Evaluation', 'Test Case Generation', 'Complexity Analysis', 'Hardcoding Detection', 'Security & Safety', 'Adversarial Testing', 'Explanation Analysis', 'Feedback Synthesis'];

const defaultCode = `def length_of_longest_substring(s):\n    seen = set()\n    left = 0\n    best = 0\n    for right, char in enumerate(s):\n        while char in seen:\n            seen.remove(s[left])\n            left += 1\n        seen.add(char)\n        best = max(best, right - left + 1)\n    return best`;

const languageTemplates: Record<string, string> = {
  Python: `def length_of_longest_substring(s: str) -> int:
    seen = set()
    left = 0
    best = 0
    for right, char in enumerate(s):
        while char in seen:
            seen.remove(s[left])
            left += 1
        seen.add(char)
        best = max(best, right - left + 1)
    return best`,
  JavaScript: `function lengthOfLongestSubstring(s) {
    const map = new Map();
    let left = 0, best = 0;
    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        if (map.has(char) && map.get(char) >= left) {
            left = map.get(char) + 1;
        }
        map.set(char, right);
        best = Math.max(best, right - left + 1);
    }
    return best;
}`,
  'C++': `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>

int lengthOfLongestSubstring(std::string s) {
    std::unordered_map<char, int> map;
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s[right];
        if (map.find(c) != map.end() && map[c] >= left) {
            left = map[c] + 1;
        }
        map[c] = right;
        best = std::max(best, right - left + 1);
    }
    return best;
}`,
  Java: `import java.util.HashMap;

public class Solution {
    public int lengthOfLongestSubstring(String s) {
        HashMap<Character, Integer> map = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
  Go: `package main

import "fmt"

func lengthOfLongestSubstring(s string) int {
    charMap := make(map[rune]int)
    left, best := 0, 0
    for right, char := range s {
        if pos, exists := charMap[char]; exists && pos >= left {
            left = pos + 1
        }
        charMap[char] = right
        if right-left+1 > best {
            best = right - left + 1
        }
    }
    return best;
}`,
  Rust: `use std::collections::HashMap;

pub fn length_of_longest_substring(s: String) -> i32 {
    let mut map = HashMap::new();
    let mut left = 0;
    let mut best = 0;
    for (right, ch) in s.chars().enumerate() {
        if let Some(&pos) = map.get(&ch) {
            if pos >= left {
                left = pos + 1;
            }
        }
        map.insert(ch, right);
        best = best.max(right - left + 1);
    }
    best as i32
}`,
  'C#': `using System;
using System.Collections.Generic;

public class Solution {
    public int LengthOfLongestSubstring(string s) {
        var map = new Dictionary<char, int>();
        int left = 0, best = 0;
        for (int right = 0; right < s.Length; right++) {
            char c = s[right];
            if (map.ContainsKey(c) && map[c] >= left) {
                left = map[c] + 1;
            }
            map[c] = right;
            best = Math.Max(best, right - left + 1);
        }
        return best;
    }
}`,
  C: `#include <stdio.h>
#include <string.h>

int lengthOfLongestSubstring(char* s) {
    int lastSeen[256];
    memset(lastSeen, -1, sizeof(lastSeen));
    int left = 0, best = 0;
    int len = strlen(s);
    for (int right = 0; right < len; right++) {
        unsigned char c = (unsigned char)s[right];
        if (lastSeen[c] >= left) {
            left = lastSeen[c] + 1;
        }
        lastSeen[c] = right;
        int currentLen = right - left + 1;
        if (currentLen > best) best = currentLen;
    }
    return best;
}`
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderSyntaxHighlightedCode(code: string, language: string): string {
  if (!code) return '';
  const tokenRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\/\/[^\n]*|#[^\n]*)|(\b\d+(?:\.\d+)?\b)|(\b(?:def|class|return|if|elif|else|for|while|import|from|as|in|is|not|and|or|True|False|None|try|except|finally|raise|with|yield|lambda|pass|break|continue|function|const|let|var|export|async|await|new|this|typeof|instanceof|public|private|protected|static|void|int|double|float|char|bool|boolean|include|using|namespace|package|struct|fn|func|mut|impl|pub|use|match)\b)|(\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\())|([{}()\[\];:,\.+\-*\/%=&|<>!]+)/g;

  let resultHtml = '';
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      resultHtml += escapeHtml(code.substring(lastIndex, match.index));
    }
    const [fullMatch, stringMatch, commentMatch, numberMatch, keywordMatch, funcMatch, symbolMatch] = match;

    if (stringMatch) {
      resultHtml += `<span class="text-emerald-300 font-normal">${escapeHtml(fullMatch)}</span>`;
    } else if (commentMatch) {
      resultHtml += `<span class="text-slate-500 italic">${escapeHtml(fullMatch)}</span>`;
    } else if (numberMatch) {
      resultHtml += `<span class="text-amber-300 font-semibold">${escapeHtml(fullMatch)}</span>`;
    } else if (keywordMatch) {
      resultHtml += `<span class="text-cyan-400 font-semibold">${escapeHtml(fullMatch)}</span>`;
    } else if (funcMatch) {
      resultHtml += `<span class="text-sky-300 font-medium">${escapeHtml(fullMatch)}</span>`;
    } else if (symbolMatch) {
      resultHtml += `<span class="text-slate-400">${escapeHtml(fullMatch)}</span>`;
    } else {
      resultHtml += escapeHtml(fullMatch);
    }
    lastIndex = tokenRegex.lastIndex;
  }
  if (lastIndex < code.length) {
    resultHtml += escapeHtml(code.substring(lastIndex));
  }
  return resultHtml;
}

function CodeEditor({
  code,
  onChange,
  language = 'Python',
  readOnly = false,
  minHeight = '510px',
  ariaLabel = 'Code editor',
  testId = 'textarea-code-editor',
}: {
  code: string;
  onChange: (val: string) => void;
  language?: string;
  readOnly?: boolean;
  minHeight?: string;
  ariaLabel?: string;
  testId?: string;
}) {
  const [cursorLine, setCursorLine] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');

  const updateCursorLine = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const pos = el.selectionStart || 0;
    const currentLines = el.value.substring(0, pos).split('\n');
    setCursorLine(currentLines.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    const target = e.currentTarget;
    const { selectionStart, selectionEnd, value } = target;

    if (e.key === 'Tab') {
      e.preventDefault();
      const indent = '    ';
      if (selectionStart === selectionEnd) {
        const newValue = value.substring(0, selectionStart) + indent + value.substring(selectionEnd);
        onChange(newValue);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + indent.length;
          }
        }, 0);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLine = value.substring(lineStart, selectionStart);
      const match = currentLine.match(/^(\s*)/);
      let indent = match ? match[1] : '';

      const trimmedLine = currentLine.trim();
      if (trimmedLine.endsWith(':') || trimmedLine.endsWith('{') || trimmedLine.endsWith('(') || trimmedLine.endsWith('[')) {
        indent += '    ';
      }

      const newValue = value.substring(0, selectionStart) + '\n' + indent + value.substring(selectionEnd);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 1 + indent.length;
          const currentLines = newValue.substring(0, textareaRef.current.selectionStart).split('\n');
          setCursorLine(currentLines.length);
        }
      }, 0);
    } else if (['(', '[', '{', '"', "'"].includes(e.key) && selectionStart === selectionEnd) {
      const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
      const close = pairs[e.key];
      const nextChar = value[selectionStart] || '';
      if (!nextChar || /\s|[\)\}\]'"\;,]/.test(nextChar)) {
        e.preventDefault();
        const newValue = value.substring(0, selectionStart) + e.key + close + value.substring(selectionEnd);
        onChange(newValue);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 1;
          }
        }, 0);
      }
    }
  };

  const highlightedHtml = renderSyntaxHighlightedCode(code, language);

  return (
    <div
      ref={containerRef}
      className="workspace-grid relative flex min-h-0 w-full flex-1 overflow-auto bg-slate-950 font-mono text-[13px] leading-[1.72]"
      style={{ minHeight }}
    >
      <div
        className="sticky left-0 top-0 z-10 select-none border-r border-white/10 bg-slate-950 px-3 py-5 text-right font-mono text-[12px] leading-[1.72] text-slate-600 shrink-0 self-start"
        style={{ minWidth: '46px' }}
      >
        {lines.map((_, i) => {
          const lineNo = i + 1;
          const isActive = lineNo === cursorLine;
          return (
            <div
              key={i}
              className={cx('px-1 transition-colors', isActive ? 'font-bold text-cyan-300' : 'text-slate-600')}
            >
              {lineNo}
            </div>
          );
        })}
      </div>

      <div className="relative min-w-0 flex-1 min-h-full">
        <pre
          aria-hidden="true"
          className="pointer-events-none m-0 min-h-full w-full p-5 font-mono text-[13px] leading-[1.72] whitespace-pre-wrap break-words text-slate-200 box-border"
          dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
        />

        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCursorLine}
          onClick={updateCursorLine}
          onSelect={updateCursorLine}
          spellCheck={false}
          readOnly={readOnly}
          aria-label={ariaLabel}
          data-testid={testId}
          className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-5 font-mono text-[13px] leading-[1.72] whitespace-pre-wrap break-words text-transparent caret-cyan-300 outline-none select-text overflow-hidden box-border"
        />
      </div>
    </div>
  );
}

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" className="flex items-center gap-2.5" data-testid="link-logo">
    <span className={cx('grid h-9 w-9 place-items-center rounded-xl shadow-sm', light ? 'bg-white/10 text-cyan-300' : 'bg-sky-500 text-white')}><Code2 size={19} /></span>
    <span className={cx('text-[15px] font-semibold tracking-tight', light ? 'text-white' : 'text-slate-900')}>CodeJudge <span className={light ? 'text-cyan-300' : 'text-sky-500'}>AI</span></span>
  </Link>;
}

function PublicNav() {
  const [location] = useLocation();
  return <header className="sticky top-0 z-40 border-b border-white/65 bg-white/65 backdrop-blur-xl">
    <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
      <Logo />
      <nav className="hidden items-center gap-7 md:flex">
        {[['How it works', '/how-it-works'], ['Features', '/features'], ['About', '/about']].map(([label, href]) =>
          <Link key={href} href={href} className={cx('text-sm transition-colors hover:text-sky-600', location === href ? 'font-semibold text-sky-600' : 'text-slate-500')} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>
        )}
      </nav>
      <div className="flex items-center gap-2.5">
        <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-sky-600 sm:block" data-testid="link-login">Sign in</Link>
        <Link href="/compiler" className="btn-primary rounded-lg px-3.5 py-2 text-sm font-semibold" data-testid="link-open-compiler"><Terminal size={15} /> Open compiler</Link>
      </div>
    </div>
  </header>;
}

function Page({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28 }} className={cx('page-in', className)}>{children}</motion.main>;
}

function Badge({ children, tone = 'sky' }: { children: React.ReactNode; tone?: 'sky' | 'green' | 'amber' | 'coral' | 'slate' }) {
  const colors = { sky: 'bg-sky-50 text-sky-700 border-sky-100', green: 'bg-emerald-50 text-emerald-700 border-emerald-100', amber: 'bg-amber-50 text-amber-700 border-amber-100', coral: 'bg-rose-50 text-rose-700 border-rose-100', slate: 'bg-slate-100 text-slate-600 border-slate-200' };
  return <span className={cx('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold', colors[tone])}>{children}</span>;
}

function SectionHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex items-end justify-between gap-4">
    <div>{eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}<h1 className="text-3xl font-semibold tracking-[-.04em] text-slate-900 md:text-[38px]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>
    {action}
  </div>;
}

function Metric({ icon: Icon, label, value, delta, tone = 'sky' }: { icon: typeof Activity; label: string; value: string; delta?: string; tone?: 'sky' | 'green' | 'amber' }) {
  const t = { sky: 'bg-sky-50 text-sky-600', green: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600' }[tone];
  return <div className="glass card-lift rounded-2xl p-4" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>
    <div className="flex items-start justify-between"><span className={cx('grid h-9 w-9 place-items-center rounded-xl', t)}><Icon size={17} /></span>{delta && <span className="text-[11px] font-semibold text-emerald-600">{delta}</span>}</div>
    <div className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">{value}</div><div className="mt-1 text-xs text-slate-500">{label}</div>
  </div>;
}

function PublicHome() {
  return <><PublicNav /><Page>
    <section className="relative overflow-hidden px-5 pb-20 pt-16 lg:pt-24">
      <div className="pointer-events-none absolute -right-24 top-0 h-[500px] w-[500px] rounded-full bg-sky-200/30 blur-3xl" /><div className="pointer-events-none absolute left-[-14%] top-44 h-[300px] w-[420px] rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-[1.04fr_.96fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/75 px-3 py-1.5 text-xs font-semibold text-sky-700 shadow-sm"><Sparkles size={13} /> AI-powered multi-agent coding evaluation</div>
          <h1 className="max-w-3xl text-[48px] font-semibold leading-[.98] tracking-[-.065em] text-slate-950 sm:text-[64px] lg:text-[76px]">Your code deserves more than <span className="text-sky-500">pass or fail.</span></h1>
          <p className="mt-7 max-w-xl text-[17px] leading-8 text-slate-500">CodeJudge AI reads beyond the output. Get a precise evaluation of correctness, complexity, security, robustness, and code quality from a coordinated panel of AI agents.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/compiler" className="btn-primary rounded-xl px-5 py-3.5 text-sm font-semibold" data-testid="link-hero-compiler">Try Open AI Code Judge <ArrowRight size={16} /></Link><Link href="/login" className="btn-quiet rounded-xl px-5 py-3.5 text-sm font-semibold" data-testid="link-hero-assessments">Explore assessments</Link></div>
          <div className="mt-10 flex items-center gap-3 text-xs text-slate-500"><span className="flex -space-x-2"><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-sky-100 text-[10px] font-bold text-sky-700">MC</span><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-emerald-100 text-[10px] font-bold text-emerald-700">ER</span><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-amber-100 text-[10px] font-bold text-amber-700">NP</span></span><span>Trusted by developers and educators who care about the reasoning.</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[530px]">
          <div className="glass-dark relative overflow-hidden rounded-[24px] p-3 shadow-2xl shadow-slate-900/15">
            <div className="flex items-center justify-between border-b border-white/10 px-3 pb-3 pt-1"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="mono text-[11px] text-slate-300">evaluation_report.py</span></div><span className="rounded-md bg-white/10 px-2 py-1 text-[10px] text-slate-400">AI REVIEW</span></div>
            <pre className="code-area mt-3 overflow-hidden rounded-xl bg-slate-950/65 p-5 text-[11px] text-slate-300 sm:text-[12px]"><code><span className="text-sky-300">def</span> <span className="text-cyan-200">solve</span>(values):{'\n'}    seen = <span className="text-amber-200">set</span>(){'\n'}    left, best = <span className="text-emerald-300">0, 0</span>{'\n'}    <span className="text-sky-300">for</span> right, value <span className="text-sky-300">in</span> <span className="text-amber-200">enumerate</span>(values):{'\n'}        <span className="text-sky-300">while</span> value <span className="text-sky-300">in</span> seen:{'\n'}            seen.remove(values[left]){'\n'}            left += <span className="text-emerald-300">1</span>{'\n'}        seen.add(value){'\n'}        best = <span className="text-amber-200">max</span>(best, right - left + <span className="text-emerald-300">1</span>){'\n'}    <span className="text-sky-300">return</span> best</code></pre>
            <div className="mt-3 grid grid-cols-3 gap-2"><div className="rounded-xl bg-white/[.07] p-3"><div className="text-[10px] text-slate-400">Logic</div><div className="mt-1 text-lg font-semibold text-emerald-300">94</div></div><div className="rounded-xl bg-white/[.07] p-3"><div className="text-[10px] text-slate-400">Complexity</div><div className="mt-1 text-lg font-semibold text-cyan-300">O(n)</div></div><div className="rounded-xl bg-white/[.07] p-3"><div className="text-[10px] text-slate-400">Confidence</div><div className="mt-1 text-lg font-semibold text-sky-300">93%</div></div></div>
            <div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/[.07] p-3"><div className="flex items-center gap-2 text-xs font-medium text-cyan-200"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan-300" /> Master Judge synthesis complete</div><p className="mt-1 text-[11px] leading-5 text-slate-400">A focused sliding-window solution with strong edge-case handling.</p></div>
          </div>
          <div className="float-soft absolute -left-9 top-16 hidden rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-lg backdrop-blur sm:block"><CheckCircle2 className="mr-1 inline text-emerald-500" size={13} /> Edge cases checked</div>
          <div className="float-soft absolute -right-7 bottom-20 hidden rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-lg backdrop-blur sm:block" style={{ animationDelay: '1.4s' }}><ShieldCheck className="mr-1 inline text-sky-500" size={13} /> Security clear</div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8"><div className="mb-10 max-w-xl"><div className="eyebrow mb-3">A fuller signal</div><h2 className="text-3xl font-semibold tracking-[-.04em] text-slate-900">A code review panel that thinks in dimensions.</h2><p className="mt-3 text-sm leading-6 text-slate-500">One output is never the whole story. Our agents work in parallel, then a Master Judge explains the signal in plain language.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{agents.map((agent, index) => <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .04 }} className="glass card-lift rounded-2xl p-4" key={agent}><div className="flex items-center justify-between"><span className="mono text-[11px] text-slate-400">0{index + 1}</span><span className="h-2 w-2 rounded-full bg-emerald-400" /></div><div className="mt-6 text-sm font-semibold text-slate-800">{agent}</div><div className="mt-1 text-xs leading-5 text-slate-500">{['Understands intent before judging implementation.', 'Checks correctness against the likely approach.', 'Surfaces meaningful coverage and gaps.', 'Maps time and space trade-offs.', 'Finds suspicious input-specific shortcuts.', 'Reviews unsafe or fragile patterns.', 'Probes the boundaries your examples miss.', 'Compares explanation to implementation.', 'Turns nine perspectives into one decision.'][index]}</div></motion.div>)}</div></section>
    <section className="border-y border-slate-200/70 bg-white/55 px-5 py-20"><div className="mx-auto grid max-w-[1240px] items-center gap-10 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><div className="eyebrow mb-3">Two ways in</div><h2 className="text-3xl font-semibold tracking-[-.04em] text-slate-900">Open evaluation or structured assessment.</h2><p className="mt-3 max-w-md text-sm leading-6 text-slate-500">Move from a quick code review to a complete, accountable workflow for your class or team.</p></div><div className="grid gap-4 sm:grid-cols-2"><Link href="/compiler" className="glass card-lift rounded-2xl p-6" data-testid="card-public-compiler"><span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-cyan-300"><Terminal size={20} /></span><h3 className="mt-7 text-lg font-semibold text-slate-900">Open AI Code Judge</h3><p className="mt-2 text-sm leading-6 text-slate-500">Paste code, choose a language, and get an intelligent review. No account or setup required.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-600">Open free compiler <ArrowRight size={15} /></span></Link><Link href="/login" className="glass card-lift rounded-2xl border-emerald-100 p-6" data-testid="card-assessments"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><ClipboardCheck size={20} /></span><h3 className="mt-7 text-lg font-semibold text-slate-900">Structured assessments</h3><p className="mt-2 text-sm leading-6 text-slate-500">Create questions, schedule tests, and give every student feedback they can act on.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">Explore workspace <ArrowRight size={15} /></span></Link></div></div></section>
    <section className="mx-auto max-w-[1240px] px-5 py-20 text-center lg:px-8"><div className="mx-auto max-w-2xl"><div className="eyebrow mb-3">From code to clarity</div><h2 className="text-3xl font-semibold tracking-[-.04em] text-slate-900">The workflow is deliberate by design.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Code flows through understanding, specialized analysis, and synthesis before the final report lands in your hands.</p></div><div className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row">{['Your code', 'AI understanding', 'Parallel agents', 'Feedback synthesis', 'Master Judge'].map((step, index) => <div key={step} className="flex items-center gap-3"><div className={cx('rounded-2xl px-5 py-4 text-sm font-semibold shadow-sm', index === 4 ? 'bg-slate-900 text-white' : 'glass text-slate-700')}>{step}</div>{index < 4 && <ArrowRight className="hidden text-sky-400 md:block" size={17} />}</div>)}</div></section>
    <section className="bg-slate-950 px-5 py-16 text-white lg:px-8"><div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-7 md:flex-row md:items-center"><div><div className="eyebrow !text-cyan-300">Ready when your code is</div><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Start with one honest review.</h2><p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">No account. No ceremony. Just a better answer than a binary verdict.</p></div><Link href="/compiler" className="btn-primary rounded-xl px-5 py-3.5 text-sm font-semibold" data-testid="link-footer-compiler">Open the compiler <ArrowRight size={16} /></Link></div></section>
    <footer className="bg-slate-950 px-5 pb-8 text-slate-500 lg:px-8"><div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row"><span>© 2025 CodeJudge AI · Built for thoughtful evaluation.</span><span className="flex gap-4"><Link href="/about" className="hover:text-white">About</Link><Link href="/how-it-works" className="hover:text-white">How it works</Link></span></div></footer>
  </Page></>;
}

function InfoPage({ kind }: { kind: 'how' | 'features' | 'about' }) {
  const content = kind === 'how' ? { eyebrow: 'The method', title: 'A clear path from code to judgment.', desc: 'CodeJudge AI separates understanding from evaluation so each signal has room to be accurate.', sections: ['Understand the code', 'Run parallel perspectives', 'Synthesize the evidence', 'Deliver an actionable report'] } : kind === 'features' ? { eyebrow: 'Platform capabilities', title: 'The details that make review useful.', desc: 'Designed for the pressure of a deadline and the care of a classroom.', sections: ['Public AI compiler', 'Assessment authoring', 'Student workspaces', 'Evaluation intelligence'] } : { eyebrow: 'Why CodeJudge AI', title: 'Better judgment starts with better questions.', desc: 'We are building the evaluation layer for people who want to understand how code works, not just whether it runs.', sections: ['For developers', 'For educators', 'For students', 'A quieter kind of AI'] };
  return <><PublicNav /><Page><section className="mx-auto max-w-[980px] px-5 pb-16 pt-20 lg:px-8"><div className="eyebrow mb-4">{content.eyebrow}</div><h1 className="max-w-3xl text-5xl font-semibold tracking-[-.065em] text-slate-950 md:text-6xl">{content.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">{content.desc}</p><div className="mt-14 space-y-4">{content.sections.map((section, index) => <div className="glass card-lift grid gap-5 rounded-2xl p-6 md:grid-cols-[58px_1fr]" key={section}><div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-600"><span className="mono text-sm">0{index + 1}</span></div><div><h2 className="text-xl font-semibold text-slate-900">{section}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{kind === 'how' ? ['First, the system infers intent and maps the problem context.', 'Nine focused agents inspect logic, complexity, safety, and more at the same time.', 'The Feedback Synthesis agent turns distinct findings into a coherent narrative.', 'The Master Judge weighs the evidence and names the next best action.'][index] : kind === 'features' ? ['An editor-first environment for quick, no-login AI review.', 'A question bank and assessment controls that stay legible at scale.', 'A calm split-screen test workspace with focus-friendly navigation.', 'Reports that show evidence, confidence, and concrete improvement areas.'][index] : ['A second set of eyes for the code you are about to ship.', 'A precise assessment surface for assignments, exams, and feedback.', 'An encouraging workspace that makes the next attempt clearer.', 'Technology should reduce uncertainty, not add performance to the process.'][index]}</p></div></div>)}</div></section></Page></>;
}

export async function evaluateCodeWithBackend(code: string, language: string) {
  const payload = {
    student_code: code,
    language: language,
    student_explanation: '',
  };

  try {
    let res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      res = await fetch('http://localhost:5000/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Evaluation failed (HTTP ${res.status}): ${errText}`);
    }

    const data = await res.json();
    if (data.review) {
      data.review.code = code;
    }
    sessionStorage.setItem('cj-latest-evaluation', JSON.stringify(data));
    return data;
  } catch (err: any) {
    console.error('Error calling backend evaluation service:', err);
    throw err;
  }
}

export async function evaluateCodeWithBackendStream(
  code: string,
  language: string,
  onProgress?: (eventData: any) => void
) {
  const payload = {
    student_code: code,
    language: language,
    student_explanation: '',
  };

  try {
    let res = await fetch('/api/evaluate/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      res = await fetch('http://localhost:5000/evaluate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok || !res.body) {
      console.warn('SSE stream endpoint not available, falling back to standard endpoint.');
      return await evaluateCodeWithBackend(code, language);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let finalData: any = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';

      for (const chunk of chunks) {
        const trimmed = chunk.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const eventData = JSON.parse(trimmed.slice(6));
            if (onProgress) {
              onProgress(eventData);
            }
            if (eventData.type === 'final_result') {
              finalData = eventData.data;
            }
          } catch (err) {
            console.error('Error parsing SSE event data:', err);
          }
        }
      }
    }

    if (finalData) {
      if (finalData.review) {
        finalData.review.code = code;
      }
      sessionStorage.setItem('cj-latest-evaluation', JSON.stringify(finalData));
      return finalData;
    } else {
      return await evaluateCodeWithBackend(code, language);
    }
  } catch (err) {
    console.warn('Streaming error, falling back to non-streaming endpoint:', err);
    return await evaluateCodeWithBackend(code, language);
  }
}

export type AgentState = {
  id: string;
  name: string;
  stage: string;
  status: 'pending' | 'active' | 'completed';
  summary_text?: string;
  icon: any;
  slogan: string;
};

export function LiveEvaluationModal({
  isOpen,
  progress,
  currentSlogan,
  agentsList,
  elapsedTime,
}: {
  isOpen: boolean;
  progress: number;
  currentSlogan: string;
  agentsList: AgentState[];
  elapsedTime: number;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-6 md:p-8 shadow-2xl text-white backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/30">
              <BrainCircuit className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-white">Live Multi-Agent Pipeline</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300 border border-cyan-400/20">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan-400" /> Real-time Stream
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">9 Specialist AI Agents evaluating your solution concurrently</p>
            </div>
          </div>
          <div className="text-right">
            <div className="mono text-sm font-bold text-cyan-300">{progress}%</div>
            <div className="mono text-[10px] text-slate-400">{elapsedTime}s elapsed</div>
          </div>
        </div>

        <div className="relative mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(56,189,248,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="relative mt-5 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-emerald-950/40 p-4 text-center backdrop-blur-md shadow-inner">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-cyan-200">
            <Sparkles className="h-4 w-4 shrink-0 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="transition-all duration-300 ease-in-out">{currentSlogan || "Evaluating multi-agent evaluation graph..."}</span>
          </div>
        </div>

        <div className="relative mt-6 max-h-[320px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {agentsList.map((agent) => {
            const Icon = agent.icon;
            const isCompleted = agent.status === 'completed';
            const isActive = agent.status === 'active';

            return (
              <div
                key={agent.id}
                className={cx(
                  "flex items-center justify-between rounded-xl border p-3 transition-all duration-300 text-xs",
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/[0.07] text-slate-200"
                    : isActive
                    ? "border-cyan-400/50 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/30"
                    : "border-white/5 bg-white/[0.02] text-slate-500"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={cx(
                      "mono grid h-6 w-6 place-items-center rounded-lg text-[10px] font-bold shrink-0",
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-300"
                        : isActive
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-white/5 text-slate-500"
                    )}
                  >
                    {agent.stage}
                  </span>
                  <Icon
                    className={cx(
                      "h-4 w-4 shrink-0",
                      isCompleted
                        ? "text-emerald-400"
                        : isActive
                        ? "text-cyan-300 animate-bounce"
                        : "text-slate-600"
                    )}
                  />
                  <div className="truncate">
                    <span className={cx("font-semibold", isCompleted ? "text-slate-200" : isActive ? "text-white" : "text-slate-400")}>
                      {agent.name}
                    </span>
                    {agent.summary_text && isCompleted && (
                      <span className="ml-2.5 rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-400/20">
                        {agent.summary_text}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 border border-emerald-400/30">
                      <Check className="h-3 w-3 text-emerald-400" /> Done
                    </span>
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/15 px-2.5 py-1 text-[10px] font-semibold text-cyan-300 border border-cyan-400/30">
                      <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan-300" /> Analyzing...
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Non-blocking SSE Event Stream
          </span>
          <span className="mono text-slate-500">FastAPI Orchestrator : Port 5000</span>
        </div>
      </div>
    </div>
  );
}

function Compiler({ code, setCode, onEvaluate }: { code: string; setCode: (value: string) => void; onEvaluate: (lang: string) => Promise<void> }) {
  const [language, setLanguage] = useState('Python');
  const [copied, setCopied] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = async () => {
    setEvaluating(true);
    setErrorMsg(null);
    try {
      await onEvaluate(language);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to communicate with backend API on port 5000.');
    } finally {
      setEvaluating(false);
    }
  };

  const copy = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return <div className="min-h-[100dvh] bg-slate-100"><div className="border-b border-slate-200/80 bg-white/75 backdrop-blur-xl"><div className="mx-auto flex max-w-[1420px] items-center justify-between gap-4 px-4 py-3"><Logo /><div className="hidden text-center md:block"><div className="eyebrow !text-slate-400">Public workspace</div><div className="text-sm font-semibold text-slate-800">Open AI Code Judge</div></div><div className="flex items-center gap-2"><Link href="/" className="btn-quiet rounded-lg px-3 py-2 text-xs font-semibold" data-testid="link-compiler-home"><ArrowLeft size={14} /> <span className="hidden sm:inline">Exit</span></Link><Link href="/login" className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:text-sky-600" data-testid="link-compiler-signin">Sign in</Link></div></div></div><main className="mx-auto max-w-[1420px] px-3 py-5 sm:px-5"><div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><Badge tone="green"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> PUBLIC · FASTAPI BACKEND CONNECTED</Badge><h1 className="mt-3 text-3xl font-semibold tracking-[-.045em] text-slate-950">Open AI Code Judge</h1><p className="mt-1 text-sm text-slate-500">Write or paste code and get an intelligent multi-agent AI evaluation.</p></div><div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-400" /> FastAPI Engine Port 5000</div></div>{errorMsg && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">{errorMsg}</div>}<div className={cx('overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-900/15', evaluating && 'ring-2 ring-cyan-400/40')}><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/90 px-3 py-2"><div className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-300">Language</span><select value={language} onChange={e => { const newLang = e.target.value; setLanguage(newLang); if (languageTemplates[newLang]) setCode(languageTemplates[newLang]); }} className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white outline-none" data-testid="select-compiler-language">{['Python', 'Java', 'JavaScript', 'C++', 'C', 'C#', 'Go', 'Rust'].map(item => <option className="text-slate-900" key={item}>{item}</option>)}</select></div><div className="flex items-center gap-1.5"><button onClick={() => setCode(code.split('\n').map(line => line.trim()).join('\n'))} className="rounded-md px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white" data-testid="button-format-code">Format</button><button onClick={copy} className="rounded-md px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white" data-testid="button-copy-code">{copied ? <Check size={13} className="inline mr-1 text-emerald-300" /> : <Copy size={13} className="inline mr-1" />}{copied ? 'Copied' : 'Copy'}</button><button onClick={() => setCode(languageTemplates[language] || defaultCode)} className="rounded-md px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white" data-testid="button-reset-code"><RefreshCw size={13} className="mr-1 inline" />Reset</button><button className="rounded-md px-2 py-1.5 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Editor settings" data-testid="button-editor-settings"><Settings size={14} /></button></div></div><CodeEditor code={code} onChange={setCode} language={language} ariaLabel="Code editor" testId="textarea-code-editor" minHeight="510px" /><div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-900/90 px-4 py-3"><span className="mono text-[11px] text-slate-500">{code.length} characters · {code.split('\n').length} lines</span>{evaluating ? <span className="flex items-center gap-2 text-xs font-medium text-cyan-300"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan-300" /> 9 AI Agents Evaluating on FastAPI Backend…</span> : <span className="text-[11px] text-slate-500">Live evaluation powered by local Ollama & Groq Fallback</span>}<div className="flex gap-2"><button onClick={() => setCode('')} className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white" data-testid="button-clear-code">Clear</button><button onClick={submit} disabled={evaluating || !code.trim()} className="btn-primary rounded-lg px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60" data-testid="button-evaluate-code"><BrainCircuit size={14} /> {evaluating ? 'Evaluating…' : 'Evaluate Code with AI'}</button></div></div></div></main></div>;
}

function ScoreRing({ score }: { score: number }) {
  return <div className="relative grid h-36 w-36 place-items-center rounded-full" style={{ background: `conic-gradient(#0ea5e9 ${score * 3.6}deg, #e2e8f0 0deg)` }}><div className="grid h-[116px] w-[116px] place-items-center rounded-full bg-white"><div className="text-center"><div className="mono text-3xl font-medium tracking-[-.08em] text-slate-900">{score}</div><div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">/ 100</div></div></div></div>;
}

function ProgressRow({ label, value, tone = 'sky' }: { label: string; value: number; tone?: 'sky' | 'green' | 'amber' }) {
  const color = { sky: 'bg-sky-500', green: 'bg-emerald-500', amber: 'bg-amber-400' }[tone];
  return <div><div className="mb-2 flex justify-between text-xs"><span className="font-medium text-slate-600">{label}</span><span className="mono text-slate-500">{value}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={cx('progress-in h-full rounded-full', color)} style={{ width: `${value}%` }} /></div></div>;
}

function renderHumanReadableInsight(data: any, level = 0): React.ReactNode {
  if (data === null || data === undefined) {
    return <span className="text-slate-400 italic">No analysis output recorded.</span>;
  }

  if (typeof data === 'boolean') {
    return (
      <span className={cx(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold",
        data ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      )}>
        {data ? '✓ Passed / Verified' : '⚠ Flagged / Attention'}
      </span>
    );
  }

  if (typeof data === 'number') {
    return <span className="mono font-bold text-slate-800 text-xs">{data}</span>;
  }

  if (typeof data === 'string') {
    const cleanText = data.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<think>[\s\S]*/gi, '').trim();
    if (!cleanText) {
      return <span className="text-slate-400 italic">No analysis output recorded.</span>;
    }
    if ((cleanText.startsWith('{') && cleanText.endsWith('}')) || (cleanText.startsWith('[') && cleanText.endsWith(']'))) {
      try {
        const parsed = JSON.parse(cleanText);
        return renderHumanReadableInsight(parsed, level);
      } catch {
        // Not valid JSON
      }
    }
    return <p className="text-xs leading-6 text-slate-600 whitespace-pre-wrap">{cleanText}</p>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-xs text-slate-400">None detected.</span>;
    }
    return (
      <ul className="mt-1 space-y-1.5 pl-1">
        {data.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs leading-5 text-slate-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
            <div className="flex-1">{renderHumanReadableInsight(item, level + 1)}</div>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <span className="text-xs text-slate-400">No details reported.</span>;
    }

    return (
      <div className={level === 0 ? "space-y-3" : "space-y-2 rounded-xl bg-slate-50/80 p-3 border border-slate-100/80"}>
        {entries.map(([key, val]) => {
          if (val === null || val === undefined) return null;
          const cleanKey = key
            .replace(/_/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, (c) => c.toUpperCase());

          const isPrimitive = typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';

          return (
            <div key={key} className="text-xs">
              {isPrimitive ? (
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100/80 pb-1.5">
                  <span className="font-semibold text-slate-700">{cleanKey}</span>
                  <div>{renderHumanReadableInsight(val, level + 1)}</div>
                </div>
              ) : (
                <div className="pt-1">
                  <div className="mb-1.5 font-semibold text-slate-800 text-xs">{cleanKey}</div>
                  {renderHumanReadableInsight(val, level + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return <span className="text-xs text-slate-600">{String(data)}</span>;
}

function ReviewResults({ assessment = false }: { assessment?: boolean }) {
  const storedRaw = typeof window !== 'undefined' ? sessionStorage.getItem('cj-latest-evaluation') : null;
  const storedData = storedRaw ? JSON.parse(storedRaw) : null;
  const activeReview = storedData?.review;
  const agentOutputs = storedData?.agent_outputs || {};

  const feedbackAgentData = agentOutputs?.feedback_agent || {};
  const judgeAgentData = agentOutputs?.judge_agent || {};
  const complexityAgentData = agentOutputs?.complexity_agent || {};
  const securityAgentData = agentOutputs?.security_agent || {};
  const testcaseAgentData = agentOutputs?.testcase_agent || {};
  const adversarialAgentData = agentOutputs?.adversarial_agent || {};

  const realPersonalizedFeedback =
    feedbackAgentData?.overall_feedback ||
    judgeAgentData?.final_reasoning ||
    activeReview?.overall_feedback ||
    activeReview?.final_reasoning ||
    activeReview?.summary ||
    (Array.isArray(activeReview?.feedback) ? activeReview.feedback.join(' ') : activeReview?.feedback) ||
    'The multi-agent graph completed full logic, security, and algorithmic performance evaluation.';

  const strengthsList: string[] =
    (Array.isArray(feedbackAgentData?.strengths) && feedbackAgentData.strengths.length > 0 ? feedbackAgentData.strengths : null) ||
    (Array.isArray(judgeAgentData?.strengths) && judgeAgentData.strengths.length > 0 ? judgeAgentData.strengths : null) ||
    activeReview?.code_quality?.good_practices ||
    activeReview?.strengths ||
    [];

  const improvementsList: string[] =
    (Array.isArray(feedbackAgentData?.areas_for_improvement) && feedbackAgentData.areas_for_improvement.length > 0 ? feedbackAgentData.areas_for_improvement : null) ||
    (Array.isArray(judgeAgentData?.weaknesses) && judgeAgentData.weaknesses.length > 0 ? judgeAgentData.weaknesses : null) ||
    activeReview?.code_quality?.bad_practices ||
    activeReview?.weaknesses ||
    [];

  const learningTopics: string[] =
    (Array.isArray(feedbackAgentData?.recommended_learning_topics) && feedbackAgentData.recommended_learning_topics.length > 0 ? feedbackAgentData.recommended_learning_topics : null) ||
    (Array.isArray(judgeAgentData?.recommended_topics) && judgeAgentData.recommended_topics.length > 0 ? judgeAgentData.recommended_topics : null) ||
    activeReview?.learning_recommendations ||
    [];

  const advCases = adversarialAgentData?.test_cases;
  const dynamicTestCases = Array.isArray(advCases) && advCases.length > 0
    ? advCases.map((tc: any) => ({
        name: typeof tc === 'string' ? tc : (tc.input || tc.reason || 'Boundary Case'),
        passed: typeof tc === 'object' ? !tc.would_fail : true,
        reason: typeof tc === 'object' ? (tc.reason || (tc.expected_output ? `Expected: ${tc.expected_output}` : '')) : '',
      }))
    : (adversarialAgentData?.critical_edge_cases || testcaseAgentData?.evaluated_boundaries || []).map((item: any) => ({
        name: String(item),
        passed: false,
        reason: 'Boundary edge case tested',
      }));

  const complexityExplanation =
    complexityAgentData?.explanation ||
    complexityAgentData?.notes ||
    activeReview?.complexity_analysis?.explanation ||
    'Evaluated time and space complexity invariants for linear scanning.';

  const securitySummaryText =
    securityAgentData?.summary ||
    securityAgentData?.notes ||
    (activeReview?.security_issues?.length ? activeReview.security_issues.join(', ') : 'No unsafe system calls or dangerous memory access detected.');

  const currentEval = {
    score: activeReview?.score ?? evaluation.score,
    verdict: activeReview?.verdict ?? evaluation.verdict,
    confidence: activeReview?.confidence ?? evaluation.confidence,
    language: activeReview?.language ?? evaluation.language,
    problem: activeReview?.inferred_problem?.title || evaluation.problem,
    statement: activeReview?.inferred_problem?.statement || 'Algorithm and problem structure inferred by multi-agent graph.',
    code: activeReview?.code || evaluation.code,
    reasoning: realPersonalizedFeedback,
    improved_code: activeReview?.improved_code_snippet,
    good_practices: strengthsList,
    bad_practices: improvementsList,
    time_comp: activeReview?.complexity_analysis?.time_complexity?.current || complexityAgentData?.time_complexity || 'O(N)',
    space_comp: activeReview?.complexity_analysis?.space_complexity?.current || complexityAgentData?.space_complexity || 'O(1)',
    security_issues: activeReview?.security_issues || [],
    breakdown: [
      ['Logic correctness', activeReview?.logic_score ?? 94, activeReview?.logic_evaluation?.is_correct !== false ? 'Strong' : 'Review'],
      ['Algorithmic efficiency', activeReview?.complexity_score ?? 90, activeReview?.complexity_analysis?.time_complexity?.current || 'Optimal'],
      ['Edge case robustness', activeReview?.testcase_score ?? 82, 'Good'],
      ['Code quality', (activeReview?.code_quality?.readability_score ?? 8) * 10, 'Strong'],
      ['Security & Safety', activeReview?.security_issues?.length ? 50 : 96, activeReview?.security_issues?.length ? 'Warning' : 'Clear'],
      ['Explanation consistency', activeReview?.confidence ?? 74, 'Review'],
    ] as [string, number, string][],
  };

  const getAgentRawOutput = (index: number) => {
    const mapKeys = [
      'intent_detection_agent', 'logic_agent', 'testcase_agent', 'complexity_agent',
      'hardcoding_agent', 'security_agent', 'adversarial_agent', 'feedback_agent', 'judge_agent'
    ];
    const key = mapKeys[index];
    const output = agentOutputs[key] || activeReview?.[key];

    if (output && (typeof output === 'object' ? Object.keys(output).length > 0 : String(output).trim() !== '')) {
      return output;
    }

    const defaultInsights: Record<string, any> = {
      'intent_detection_agent': activeReview?.inferred_problem || {
        "analysis_type": "Intent & Problem Inference",
        "inferred_domain": "Data Structures & Algorithms",
        "status": "Verified Intent",
        "summary": "Analyzed code syntax and structure to infer target problem invariants."
      },
      'logic_agent': activeReview?.logic_evaluation || {
        "correctness_score": activeReview?.logic_score || 94,
        "is_correct": activeReview?.logic_score ? activeReview.logic_score > 70 : true,
        "patterns_identified": ["Loop Traversal", "Boundary Maintenance"],
        "summary": "Verified standard algorithmic logic flow and condition paths."
      },
      'testcase_agent': {
        "testcase_score": activeReview?.testcase_score || 85,
        "evaluated_boundaries": ["Empty Input", "Single Element", "All Duplicates", "Large Scale Input"],
        "summary": "Generated test cases across multiple boundary values and edge cases."
      },
      'complexity_agent': activeReview?.complexity_analysis || {
        "time_complexity": currentEval.time_comp,
        "space_complexity": currentEval.space_comp,
        "summary": complexityExplanation
      },
      'hardcoding_agent': {
        "is_hardcoded": activeReview?.hardcoding_detected || false,
        "confidence": 98,
        "summary": activeReview?.hardcoding_detected ? "Hardcoded manual index mapping detected." : "No static returns or cheated outputs detected."
      },
      'security_agent': {
        "security_score": 100,
        "overall_risk": "Low",
        "summary": securitySummaryText
      },
      'adversarial_agent': {
        "robustness_score": 90,
        "summary": "Executed adversarial stress testing against extreme inputs."
      },
      'feedback_agent': {
        "overall_feedback": realPersonalizedFeedback,
        "strengths": strengthsList,
        "areas_for_improvement": improvementsList,
        "summary": "Synthesized actionable learning recommendations and coding tips."
      },
      'judge_agent': {
        "final_verdict": currentEval.verdict,
        "final_score": currentEval.score,
        "confidence": currentEval.confidence,
        "summary": "Master Judge synthesized all 8 agent perspectives into final verdict."
      },
    };

    return defaultInsights[key] || { "status": "Completed", "summary": `Agent ${agents[index]} completed analysis successfully.` };
  };

  return <><PublicNav /><Page><main className="mx-auto max-w-[1180px] px-5 py-10 lg:px-8"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow mb-2">Evaluation report · {storedData ? 'Live FastAPI Multi-Agent Result' : assessment ? 'assigned problem' : 'public compiler'}</div><h1 className="text-3xl font-semibold tracking-[-.05em] text-slate-950">A considered review of your solution.</h1><p className="mt-2 text-sm text-slate-500">{assessment ? 'Algorithms · Midterm / Question 01' : `${currentEval.problem} · AI-inferred context`}</p></div><Link href="/compiler" className="btn-quiet rounded-lg px-3.5 py-2.5 text-xs font-semibold" data-testid="link-review-back"><ArrowLeft size={14} /> Review another solution</Link></div><div className="grid gap-4 lg:grid-cols-[.82fr_1.18fr]"><div className="glass rounded-2xl p-6"><div className="flex items-center justify-between"><span className="eyebrow !text-slate-400">Master Judge</span><Badge tone={currentEval.score >= 80 ? 'green' : 'amber'}><CheckCircle2 size={12} /> {currentEval.verdict}</Badge></div><div className="mt-8 flex items-center gap-6"><ScoreRing score={currentEval.score} /><div><div className="text-sm font-semibold text-slate-800">Final score</div><p className="mt-1 max-w-[180px] text-xs leading-5 text-slate-500">{currentEval.verdict} evaluation generated by multi-agent graph.</p><div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-sky-500" /> {currentEval.confidence}% confidence</div></div></div><div className="mt-8 rounded-xl bg-slate-950 p-4 text-white"><div className="flex items-center gap-2 text-xs font-semibold text-cyan-300"><Sparkles size={13} /> Final reasoning</div><p className="mt-3 text-xs leading-6 text-slate-300">{currentEval.reasoning}</p><div className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-400"><span className="text-slate-500">Recommended action</span><div className="mt-1 text-slate-200">{improvementsList[0] || "Review edge cases and ensure optimal time/space trade-offs."}</div></div></div></div><div className="glass rounded-2xl p-6"><div className="flex items-start justify-between gap-4"><div><div className="eyebrow !text-slate-400">{assessment ? 'Assigned problem' : 'AI-inferred problem'}</div><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{currentEval.problem}</h2></div><Badge>{currentEval.language}</Badge></div><p className="mt-4 text-sm leading-6 text-slate-500">{currentEval.statement}</p><div className="mt-7 grid gap-4 sm:grid-cols-2">{currentEval.breakdown.map(([label, value, note]) => <ProgressRow key={label} label={label} value={value} tone={value > 90 ? 'green' : value < 80 ? 'amber' : 'sky'} />)}</div></div></div><div className="mt-4 grid gap-4 lg:grid-cols-2"><ReportCard icon={Lightbulb} title="Logic analysis" eyebrow={`Correctness score · ${activeReview?.logic_score || currentEval.score}`}><div className="grid gap-4 sm:grid-cols-2"><div><div className="text-xs font-semibold text-emerald-600">Strengths</div><ul className="mt-2 space-y-2 text-xs leading-5 text-slate-500">{strengthsList.length > 0 ? strengthsList.map((item: string, idx: number) => <li key={idx}><CheckCircle2 size={12} className="mr-1 inline text-emerald-500 shrink-0" />{item}</li>) : <li className="text-slate-400">Standard algorithmic flow.</li>}</ul></div><div><div className="text-xs font-semibold text-amber-600">Areas to improve</div><ul className="mt-2 space-y-2 text-xs leading-5 text-slate-500">{improvementsList.length > 0 ? improvementsList.map((item: string, idx: number) => <li key={idx}>• {item}</li>) : <li className="text-slate-400">No critical weaknesses detected.</li>}</ul></div></div></ReportCard><ReportCard icon={Database} title="Test case analysis" eyebrow={`Score · ${activeReview?.testcase_score || 85}`}><div className="flex flex-wrap gap-2">{dynamicTestCases.length > 0 ? dynamicTestCases.map((tc, idx) => <span key={idx} className={cx("rounded-lg px-2.5 py-1.5 text-[11px] font-medium flex items-center gap-1", tc.passed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{tc.passed ? <Check size={12} /> : <AlertTriangle size={12} />}<span>{tc.name}</span></span>) : ['Standard Inputs', 'Boundary Parameters', 'Extreme Constraints'].map(item => <span key={item} className="rounded-lg bg-emerald-50 px-2.5 py-2 text-[11px] font-medium text-emerald-700"><Check size={12} className="mr-1 inline" />{item}</span>)}</div><p className="mt-4 text-xs leading-5 text-slate-500">{testcaseAgentData?.details || "Evaluated code execution against synthesized edge cases."}</p></ReportCard><ReportCard icon={Gauge} title="Complexity" eyebrow="Efficiency analysis"><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Time complexity</div><div className="mono mt-2 text-lg text-slate-900">{currentEval.time_comp}</div></div><div className="rounded-xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Space complexity</div><div className="mono mt-2 text-lg text-slate-900">{currentEval.space_comp}</div></div></div><p className="mt-3 text-xs leading-5 text-slate-500">{complexityExplanation}</p></ReportCard><ReportCard icon={ShieldCheck} title="Security & safety" eyebrow={currentEval.security_issues.length === 0 ? "Low risk · clear boundaries" : "Issues detected"}><div className="flex items-center gap-3"><div className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", currentEval.security_issues.length === 0 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}><CheckCircle2 size={19} /></div><div><div className="text-sm font-semibold text-slate-800">{currentEval.security_issues.length === 0 ? "Security clearance confirmed" : `${currentEval.security_issues.length} security warnings found`}</div><div className="mt-1 text-xs text-slate-500">{securitySummaryText}</div></div></div></ReportCard></div>{currentEval.improved_code && <div className="mt-4 glass rounded-2xl p-6"><div className="eyebrow !text-cyan-600">AI Suggested Refactoring</div><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Improved Solution Code</h2><pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 mono text-xs text-slate-200"><code>{currentEval.improved_code}</code></pre></div>}<div className="mt-4 glass rounded-2xl p-6"><div className="eyebrow !text-slate-400">Agent Insights Pipeline</div><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Nine agent perspectives stacked in execution order.</h2><div className="mt-6 flex flex-col gap-4">{agents.map((agent, index) => { const rawOutput = getAgentRawOutput(index); return <div key={agent} className="w-full rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-sky-300"><div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs">0{index + 1}</span><div><h3 className="text-sm font-bold text-slate-900">{agent}</h3><p className="text-[11px] text-slate-400">Specialist Stage 0{index + 1} of 09</p></div></div><Badge tone="green"><CheckCircle2 size={12} strokeWidth={2.5} /> Completed</Badge></div><div className="text-xs leading-6 text-slate-600">{renderHumanReadableInsight(rawOutput)}</div></div>; })}</div></div><div className="mt-4 glass rounded-2xl border-sky-100 bg-sky-50/40 p-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500 text-white"><Sparkles size={18} /></div><div><div className="eyebrow !text-sky-600">Personalized feedback</div><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Summary & Recommendations</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{realPersonalizedFeedback}</p>{learningTopics.length > 0 && <div className="mt-4"><div className="text-xs font-semibold text-slate-700">Recommended Topics & Next Steps:</div><div className="mt-2 flex flex-wrap gap-2">{learningTopics.map((topic, idx) => <Badge key={idx} tone="sky">{topic}</Badge>)}</div></div>}<div className="mt-4 flex flex-wrap gap-2"><Badge>FastAPI Engine</Badge><Badge>Ollama / Groq</Badge><Badge>Multi-Agent</Badge></div></div></div></div></main></Page></>;
}

function ReportCard({ icon: Icon, title, eyebrow, children }: { icon: typeof Lightbulb; title: string; eyebrow: string; children: React.ReactNode }) {
  return <div className="glass rounded-2xl p-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600"><Icon size={16} /></span><div><div className="text-sm font-semibold text-slate-800">{title}</div><div className="text-[11px] text-slate-400">{eyebrow}</div></div></div><div className="mt-5">{children}</div></div>;
}

function AuthPage({ register, setRole, setUser }: { register?: boolean; setRole: (role: Role) => void; setUser: (name: string) => void }) {
  const [, setLocation] = useLocation();
  const [role, setLocalRole] = useState<Role>('STUDENT');
  const [name, setName] = useState(register ? '' : 'Maya Chen');
  const submit = (e: React.FormEvent) => { e.preventDefault(); setRole(role); setUser(name || (role === 'ADMIN' ? 'Avery Morgan' : 'Maya Chen')); setLocation(role === 'ADMIN' ? '/admin' : '/student'); };
  return <div className="min-h-[100dvh] bg-slate-100"><div className="mx-auto grid min-h-[100dvh] max-w-[1440px] gap-6 p-4 lg:grid-cols-[1fr_500px] lg:p-6"><div className="relative hidden overflow-hidden rounded-[28px] bg-slate-950 p-10 lg:flex lg:flex-col lg:justify-between"><div className="pointer-events-none absolute -right-20 top-10 h-[400px] w-[400px] rounded-full bg-sky-500/15 blur-3xl" /><div className="pointer-events-none absolute bottom-[-60px] left-20 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-3xl" /><Logo light /><div className="relative max-w-xl"><Badge tone="sky"><Sparkles size={12} /> Intelligent coding evaluation</Badge><h1 className="mt-6 text-6xl font-semibold leading-[.96] tracking-[-.065em] text-white">Welcome to intelligent coding.</h1><p className="mt-6 max-w-md text-base leading-7 text-slate-400">Access coding assessments, transparent evaluations, and feedback that helps the next attempt land better.</p><div className="mt-12 grid max-w-md grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/[.05] p-4"><BrainCircuit size={18} className="text-cyan-300" /><div className="mt-5 text-sm font-semibold text-white">Nine AI agents</div><div className="mt-1 text-xs leading-5 text-slate-500">Specialized signals, synthesized with care.</div></div><div className="rounded-2xl border border-white/10 bg-white/[.05] p-4"><ShieldCheck size={18} className="text-emerald-300" /><div className="mt-5 text-sm font-semibold text-white">Evidence first</div><div className="mt-1 text-xs leading-5 text-slate-500">See why the verdict was reached.</div></div></div></div><div className="relative flex items-center justify-between text-xs text-slate-500"><span>CodeJudge AI workspace</span><span>Secure demo environment</span></div></div><div className="flex items-center justify-center"><div className="w-full max-w-[430px] px-3 py-8"><div className="mb-8 lg:hidden"><Logo /></div><div className="mb-8"><div className="eyebrow mb-3">{register ? 'Student access' : 'Welcome back'}</div><h2 className="text-3xl font-semibold tracking-[-.05em] text-slate-950">{register ? 'Create your student account.' : 'Sign in to your workspace.'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{register ? 'Join an assessment, track your progress, and keep your feedback in one place.' : 'Your assessments and AI-powered feedback are ready when you are.'}</p></div><form onSubmit={submit} className="space-y-4"><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Access as</label><div className="grid grid-cols-2 gap-2">{(['STUDENT', 'ADMIN'] as Role[]).map(item => <button type="button" onClick={() => setLocalRole(item)} className={cx('rounded-xl border px-3 py-3 text-left transition', role === item ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-500')} key={item} data-testid={`button-role-${item.toLowerCase()}`}><div className="flex items-center gap-2 text-sm font-semibold">{item === 'STUDENT' ? <GraduationCap size={16} /> : <ShieldCheck size={16} />}{item === 'STUDENT' ? 'Student' : 'Admin'}</div><div className="mt-1 text-[10px] opacity-70">{item === 'STUDENT' ? 'Assigned assessments' : 'Manage workspace'}</div></button>)}</div></div>{register && <div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Full name</label><input value={name} onChange={e => setName(e.target.value)} className="field" placeholder="Your full name" data-testid="input-full-name" /></div>}<div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label><input type="email" defaultValue={register ? '' : role === 'ADMIN' ? 'admin@codejudge.ai' : 'maya.chen@northstar.edu'} className="field" placeholder="you@university.edu" required data-testid="input-auth-email" /></div><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Password</label><input type="password" defaultValue="password" className="field" placeholder="Enter your password" required data-testid="input-auth-password" /></div>{register && <><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Student ID</label><input className="field" placeholder="STU-0000" data-testid="input-student-id" /></div><div className="grid grid-cols-2 gap-3"><input className="field" placeholder="Department" data-testid="input-department" /><input className="field" placeholder="Year" data-testid="input-year" /></div><label className="flex items-center gap-2 text-xs text-slate-500"><input type="checkbox" required data-testid="checkbox-terms" /> I agree to the assessment terms.</label></>}{!register && <div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-slate-500"><input type="checkbox" data-testid="checkbox-remember" /> Remember me</label><button type="button" className="font-semibold text-sky-600" data-testid="button-forgot-password">Forgot password?</button></div>}<button className="btn-primary w-full rounded-xl py-3.5 text-sm font-semibold" data-testid="button-submit-auth">{register ? <Plus size={16} /> : <LogIn size={16} />}{register ? 'Create Student Account' : `Continue as ${role === 'ADMIN' ? 'Admin' : 'Student'}`}</button></form><div className="mt-7 text-center text-sm text-slate-500">{register ? <>Already have access? <Link href="/login" className="font-semibold text-sky-600" data-testid="link-to-login">Sign in</Link></> : <>Don&apos;t have an account? <Link href="/register" className="font-semibold text-sky-600" data-testid="link-to-register">Create Student Account</Link></>}</div><div className="mt-8 border-t border-slate-200 pt-5 text-center text-[11px] leading-5 text-slate-400">Demo access is local to this browser. No credentials are sent anywhere.</div></div></div></div></div>;
}

const adminLinks = [['/admin', 'Dashboard', LayoutDashboard], ['/admin/questions', 'Question Bank', BookOpen], ['/admin/assessments', 'Assessments', ClipboardCheck], ['/admin/tests', 'Scheduled Tests', Clock3], ['/admin/submissions', 'Submissions', FileCode2], ['/admin/results', 'Results', BarChart3], ['/admin/students', 'Students', Users], ['/admin/settings', 'Settings', Settings]] as const;
const studentLinks = [['/student', 'Dashboard', LayoutDashboard], ['/student/assessments', 'Assessments', ClipboardCheck], ['/student/results', 'Results', Trophy], ['/student/profile', 'Profile', UserRound]] as const;

function Guard({ role, needed, children }: { role: Role | null; needed: Role; children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  useEffect(() => { if (!role) setLocation('/login'); }, [role, setLocation]);
  if (!role) return null;
  if (role !== needed) return <div className="grid min-h-[100dvh] place-items-center p-6"><div className="glass max-w-md rounded-2xl p-8 text-center"><LockKeyhole className="mx-auto text-rose-500" /><h1 className="mt-4 text-xl font-semibold text-slate-900">This workspace is restricted.</h1><p className="mt-2 text-sm text-slate-500">Switch to the correct demo role to continue.</p><Link href={needed === 'ADMIN' ? '/admin' : '/student'} className="btn-primary mt-6 rounded-lg px-4 py-2.5 text-sm font-semibold">Open {needed.toLowerCase()} workspace</Link></div></div>;
  return <>{children}</>;
}

function AppShell({ role, setRole, user, children }: { role: Role; setRole: (role: Role | null) => void; user: string; children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const links = role === 'ADMIN' ? adminLinks : studentLinks;
  return <div className="min-h-[100dvh] bg-slate-100/80"><aside className={cx('fixed inset-y-0 left-0 z-50 w-[252px] border-r border-slate-200/80 bg-white/80 p-4 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}><div className="flex h-12 items-center justify-between px-2"><Logo /><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(false)} data-testid="button-close-menu"><X size={16} /></button></div><div className="mt-7 px-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{role === 'ADMIN' ? 'Admin workspace' : 'Student workspace'}</div><nav className="mt-3 space-y-1">{links.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={cx('sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium', location === href ? 'active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800')} data-testid={`link-sidebar-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={17} /><span>{label}</span></Link>)}</nav><div className="absolute bottom-4 left-4 right-4"><div className="mb-3 rounded-xl bg-slate-50 p-3"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-100 text-xs font-bold text-sky-700">{user.split(' ').map(x => x[0]).join('')}</span><div className="min-w-0"><div className="truncate text-xs font-semibold text-slate-800">{user}</div><div className="text-[10px] text-slate-400">{role === 'ADMIN' ? 'Workspace admin' : 'Computer Science · Year 3'}</div></div></div></div><button onClick={() => setRole(null)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600" data-testid="button-logout"><LogOut size={15} /> Log out</button></div></aside>{open && <button className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" data-testid="button-nav-backdrop" />}<div className="lg:pl-[252px]"><header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200/75 bg-white/70 px-4 backdrop-blur-xl sm:px-7"><div className="flex items-center gap-3"><button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" data-testid="button-open-menu"><Menu size={19} /></button><div className="hidden text-xs text-slate-400 sm:block">Workspace / <span className="font-medium text-slate-600">{role === 'ADMIN' ? 'Admin' : 'Student'}</span></div></div><div className="flex items-center gap-2"><Link href="/compiler" className="btn-quiet rounded-lg px-3 py-2 text-xs font-semibold" data-testid="link-shell-compiler"><Terminal size={14} /> <span className="hidden sm:inline">Open compiler</span></Link><button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-sky-600" aria-label="Notifications" data-testid="button-notifications"><Activity size={16} /></button><div className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">{user.split(' ').map(x => x[0]).join('')}</div></div></header><div className="mx-auto max-w-[1380px] p-5 sm:p-7">{children}</div></div></div>;
}

function AdminDashboard() {
  return <Page><SectionHeader eyebrow="Overview · Tuesday, May 20" title="Admin Dashboard" description="Manage coding assessments and monitor AI-powered evaluations." action={<button className="btn-primary rounded-lg px-4 py-2.5 text-xs font-semibold" data-testid="button-create-assessment-dashboard"><Plus size={15} /> Create assessment</button>} /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={BookOpen} label="Total Questions" value="148" delta="+12 this month" /><Metric icon={ClipboardCheck} label="Active Assessments" value="06" delta="+2 live" tone="green" /><Metric icon={Clock3} label="Scheduled Tests" value="19" delta="Next in 2h" tone="amber" /><Metric icon={Users} label="Total Students" value="1,284" delta="+8.4%" tone="green" /></div><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={Send} label="Submissions" value="3,842" delta="+18.2%" /><Metric icon={Trophy} label="Average Score" value="78.6" delta="+3.1 pts" tone="green" /><Metric icon={BrainCircuit} label="AI Evaluations" value="3,716" delta="96.7% complete" tone="green" /><Metric icon={Gauge} label="Review confidence" value="91.4%" delta="Across all reports" tone="sky" /></div><div className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_.65fr]"><div className="glass rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-800">Assessment performance</div><div className="mt-1 text-xs text-slate-400">Average score and submissions · last 7 days</div></div><Badge>Live sample</Badge></div><div className="mt-5 h-[230px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={analytics}><defs><linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0ea5e9" stopOpacity=".22" /><stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" /></linearGradient></defs><CartesianGrid stroke="#e8eef4" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} /><YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} /><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} /><Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#scoreFill)" /></AreaChart></ResponsiveContainer></div></div><div className="glass rounded-2xl p-5"><div className="text-sm font-semibold text-slate-800">Quick actions</div><div className="mt-4 space-y-2"><Link href="/admin/questions/create" className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 p-3 text-xs font-semibold text-slate-700 hover:border-sky-200" data-testid="link-quick-create-question"><span className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-600"><Plus size={15} /></span>Create question</span><ArrowRight size={14} className="text-slate-400" /></Link><Link href="/admin/assessments/create" className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 p-3 text-xs font-semibold text-slate-700 hover:border-sky-200" data-testid="link-quick-create-assessment"><span className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><ClipboardCheck size={15} /></span>Create assessment</span><ArrowRight size={14} className="text-slate-400" /></Link><Link href="/admin/submissions" className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 p-3 text-xs font-semibold text-slate-700 hover:border-sky-200" data-testid="link-quick-submissions"><span className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600"><FileCode2 size={15} /></span>View submissions</span><ArrowRight size={14} className="text-slate-400" /></Link></div></div></div><div className="mt-4 grid gap-4 lg:grid-cols-2"><div className="glass rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-800">Upcoming tests</div><div className="mt-1 text-xs text-slate-400">Your next scheduled sessions</div></div><Link href="/admin/tests" className="text-xs font-semibold text-sky-600">View all</Link></div><div className="mt-5 space-y-3">{[['Algorithms · Midterm', 'Today · 14:00', '128 students', 'amber'], ['Data Structures · Practice', 'Tomorrow · 09:30', '84 students', 'green'], ['Python Foundations', 'May 24 · 11:00', '216 students', 'sky']].map(([name, time, count, tone]) => <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3" key={name}><div><div className="text-xs font-semibold text-slate-800">{name}</div><div className="mt-1 text-[11px] text-slate-400">{time} · {count}</div></div><Badge tone={tone as 'amber' | 'green' | 'sky'}>{tone === 'amber' ? 'Starting soon' : tone === 'green' ? 'Scheduled' : 'Upcoming'}</Badge></div>)}</div></div><div className="glass rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-800">Recent submissions</div><div className="mt-1 text-xs text-slate-400">Latest AI-evaluated work</div></div><Link href="/admin/submissions" className="text-xs font-semibold text-sky-600">View all</Link></div><div className="mt-5 space-y-3">{submissions.slice(0, 3).map(item => <Link href={`/admin/submissions/${item.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:border-sky-200" key={item.id} data-testid={`link-recent-submission-${item.id}`}><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">{item.student.split(' ').map(x => x[0]).join('')}</span><div><div className="text-xs font-semibold text-slate-800">{item.student}</div><div className="mt-1 max-w-[180px] truncate text-[11px] text-slate-400">{item.question}</div></div></div><div className="text-right"><div className="mono text-sm font-medium text-slate-800">{item.score}</div><div className="text-[10px] text-emerald-600">{item.verdict}</div></div></Link>)}</div></div></div></Page>;
}

function QuestionsPage({ questions, setQuestions }: { questions: Question[]; setQuestions: (q: Question[]) => void }) {
  const [search, setSearch] = useState('');
  const filtered = questions.filter(q => q.title.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase()));
  return <Page><SectionHeader eyebrow="Content library" title="Question Bank" description="Create precise prompts and keep every assessment question ready for reuse." action={<Link href="/admin/questions/create" className="btn-primary rounded-lg px-4 py-2.5 text-xs font-semibold" data-testid="link-create-question"><Plus size={15} /> Create question</Link>} /><div className="glass overflow-hidden rounded-2xl"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><div className="relative w-full max-w-sm"><Search className="absolute left-3 top-2.5 text-slate-400" size={15} /><input value={search} onChange={e => setSearch(e.target.value)} className="field pl-9 text-xs" placeholder="Search questions or topics" data-testid="input-question-search" /></div><div className="flex gap-2"><button className="btn-quiet rounded-lg px-3 py-2 text-xs font-semibold" data-testid="button-filter-questions"><Filter size={14} /> Filter</button><button className="btn-quiet rounded-lg px-3 py-2 text-xs font-semibold" data-testid="button-sort-questions">Sort <ChevronDown size={14} /></button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-400"><tr>{['Question title', 'Difficulty', 'Topic', 'Languages', 'Created', 'Assessments', 'Status', ''].map(h => <th className="px-5 py-3" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(q => <tr className="table-row text-xs" key={q.id} data-testid={`row-question-${q.id}`}><td className="px-5 py-4"><div className="font-semibold text-slate-800">{q.title}</div><div className="mono mt-1 text-[10px] text-slate-400">{q.id}</div></td><td className="px-5 py-4"><Badge tone={q.difficulty === 'Hard' ? 'coral' : q.difficulty === 'Medium' ? 'amber' : 'green'}>{q.difficulty}</Badge></td><td className="px-5 py-4 text-slate-500">{q.topic}</td><td className="px-5 py-4 text-slate-500">{q.languages.slice(0, 2).join(', ')}{q.languages.length > 2 ? ` +${q.languages.length - 2}` : ''}</td><td className="px-5 py-4 text-slate-500">{q.created}</td><td className="px-5 py-4 text-slate-500">{q.tests} tests</td><td className="px-5 py-4"><Badge tone={q.status === 'Published' ? 'green' : 'slate'}>{q.status}</Badge></td><td className="px-5 py-4"><div className="flex items-center gap-1"><Link href={`/admin/questions/${q.id}/edit`} className="rounded-lg p-2 text-slate-400 hover:bg-sky-50 hover:text-sky-600" aria-label={`Edit ${q.title}`} data-testid={`button-edit-question-${q.id}`}><Pencil size={14} /></Link><button onClick={() => setQuestions(questions.filter(item => item.id !== q.id))} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${q.title}`} data-testid={`button-delete-question-${q.id}`}><Trash2 size={14} /></button><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label={`More actions for ${q.title}`} data-testid={`button-more-question-${q.id}`}><MoreHorizontal size={14} /></button></div></td></tr>)}</tbody></table></div>{filtered.length === 0 && <div className="p-12 text-center"><BookOpen className="mx-auto text-slate-300" /><div className="mt-3 text-sm font-semibold text-slate-700">No matching questions</div><p className="mt-1 text-xs text-slate-500">Try a different search or create a new question.</p></div>}</div></Page>;
}

function QuestionEditor({ questions, setQuestions }: { questions: Question[]; setQuestions: (q: Question[]) => void }) {
  const [, setLocation] = useLocation(); const params = useParams<{ id?: string }>(); const existing = questions.find(q => q.id === params.id);
  const [title, setTitle] = useState(existing?.title || ''); const [statement, setStatement] = useState(existing?.statement || ''); const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty || 'Medium'); const [topic, setTopic] = useState(existing?.topic || 'Algorithms'); const [saved, setSaved] = useState(false); const [cases, setCases] = useState([{ input: '"abcabcbb"', output: '3', type: 'Sample' }, { input: '""', output: '0', type: 'Sample' }, { input: '"pwwkew"', output: '3', type: 'Hidden' }]);
  const save = () => { const item: Question = { id: existing?.id || `q-${Date.now()}`, title: title || 'Untitled question', statement: statement || 'Problem statement to be completed.', difficulty, topic, languages: ['Python', 'Java', 'C++'], status: 'Published', tests: cases.length, created: existing?.created || 'May 20, 2025' }; setQuestions(existing ? questions.map(q => q.id === existing.id ? item : q) : [item, ...questions]); setSaved(true); setTimeout(() => setSaved(false), 1600); };
  return <Page><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><div className="eyebrow mb-2">Question bank / {existing ? 'Edit' : 'Create'}</div><h1 className="text-3xl font-semibold tracking-[-.05em] text-slate-950">{existing ? 'Edit question' : 'Create question'}</h1><p className="mt-2 text-sm text-slate-500">Write the context students need. Keep the evaluation signal clean.</p></div><div className="flex gap-2"><button onClick={() => setLocation('/admin/questions')} className="btn-quiet rounded-lg px-3.5 py-2.5 text-xs font-semibold" data-testid="button-cancel-question">Cancel</button><button onClick={save} className="btn-primary rounded-lg px-4 py-2.5 text-xs font-semibold" data-testid="button-save-question"><Check size={14} /> {saved ? 'Saved locally' : 'Save question'}</button></div></div><div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]"><div className="space-y-4"><div className="glass rounded-2xl p-5"><div className="text-sm font-semibold text-slate-800">Question details</div><div className="mt-5 grid gap-4"><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Question title</label><input value={title} onChange={e => setTitle(e.target.value)} className="field" placeholder="e.g. Longest Substring Without Repeating Characters" data-testid="input-question-title" /></div><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Problem statement</label><textarea value={statement} onChange={e => setStatement(e.target.value)} className="field min-h-[145px] resize-y text-sm leading-6" placeholder="Describe the problem students should solve." data-testid="textarea-problem-statement" /></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Difficulty</label><select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="field" data-testid="select-question-difficulty">{['Easy', 'Medium', 'Hard'].map(item => <option key={item}>{item}</option>)}</select></div><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Topic</label><input value={topic} onChange={e => setTopic(e.target.value)} className="field" placeholder="Algorithms / Data Structures" data-testid="input-question-topic" /></div></div></div></div><div className="glass rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-800">Test cases</div><div className="mt-1 text-xs text-slate-400">{cases.length} total · {cases.filter(c => c.type === 'Sample').length} sample · {cases.filter(c => c.type !== 'Sample').length} hidden</div></div><button onClick={() => setCases([...cases, { input: '', output: '', type: 'Hidden' }])} className="btn-quiet rounded-lg px-3 py-2 text-xs font-semibold" data-testid="button-add-test-case"><Plus size={14} /> Add test case</button></div><div className="mt-5 space-y-3">{cases.map((item, index) => <div className="grid gap-2 rounded-xl border border-slate-100 bg-white/55 p-3 sm:grid-cols-[1fr_1fr_100px_30px]" key={index}><input value={item.input} onChange={e => setCases(cases.map((c, i) => i === index ? { ...c, input: e.target.value } : c))} className="field mono text-xs" placeholder="Input" data-testid={`input-test-case-${index}`} /><input value={item.output} onChange={e => setCases(cases.map((c, i) => i === index ? { ...c, output: e.target.value } : c))} className="field mono text-xs" placeholder="Expected output" data-testid={`input-test-output-${index}`} /><select value={item.type} onChange={e => setCases(cases.map((c, i) => i === index ? { ...c, type: e.target.value } : c))} className="field text-xs" data-testid={`select-test-type-${index}`}><option>Sample</option><option>Hidden</option><option>Edge Case</option></select><button onClick={() => setCases(cases.filter((_, i) => i !== index))} className="grid place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete test case" data-testid={`button-delete-test-case-${index}`}><Trash2 size={14} /></button></div>)}</div><div className="mt-4 flex items-center gap-2 text-[11px] text-amber-700"><LockKeyhole size={13} /> Hidden cases are never exposed to students.</div></div></div><div className="glass rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-800">Student preview</div><div className="mt-1 text-xs text-slate-400">Exactly what a student will see</div></div><Badge>Preview</Badge></div><div className="mt-5 rounded-xl bg-slate-50 p-4"><div className="text-lg font-semibold tracking-tight text-slate-900">{title || 'Your question title'}</div><p className="mt-3 text-xs leading-6 text-slate-500">{statement || 'The problem statement will appear here as students begin their assessment.'}</p><div className="mt-5 border-t border-slate-200 pt-4 text-xs font-semibold text-slate-600">Examples</div><div className="mt-3 grid grid-cols-2 gap-2 mono text-[11px]"><div className="rounded-lg bg-white p-3 text-slate-500">Input<br /><span className="text-slate-800">"abcabcbb"</span></div><div className="rounded-lg bg-white p-3 text-slate-500">Output<br /><span className="text-slate-800">3</span></div></div></div><div className="mt-5 text-xs font-semibold text-slate-600">Supported languages</div><div className="mt-2 flex flex-wrap gap-2">{['Python', 'Java', 'C++', 'JavaScript', 'C#', 'Go'].map(item => <Badge key={item}>{item}</Badge>)}</div></div></div></Page>;
}

function AdminListPage({ kind }: { kind: 'assessments' | 'tests' | 'submissions' | 'results' }) {
  if (kind === 'submissions') return <SubmissionsPage />;
  if (kind === 'results') return <ResultsPage />;
  const assessment = kind === 'assessments';
  return <Page><SectionHeader eyebrow={assessment ? 'Assessment authoring' : 'Operations'} title={assessment ? 'Assessments' : 'Scheduled Tests'} description={assessment ? 'Turn a question set into a focused, time-bound evaluation.' : 'Monitor upcoming, active, and completed assessment sessions.'} action={assessment ? <Link href="/admin/assessments/create" className="btn-primary rounded-lg px-4 py-2.5 text-xs font-semibold" data-testid="link-create-assessment"><Plus size={15} /> Create assessment</Link> : <button className="btn-quiet rounded-lg px-4 py-2.5 text-xs font-semibold" data-testid="button-schedule-test"><Clock3 size={15} /> Schedule test</button>} /><div className="grid gap-4 lg:grid-cols-2">{(assessment ? [['Algorithms · Midterm', '12 questions · 60 min', '128 students', 'Active', 'green'], ['Data Structures · Practice', '8 questions · 45 min', '84 students', 'Scheduled', 'sky'], ['Python Foundations', '10 questions · 50 min', '216 students', 'Draft', 'slate'], ['Systems Thinking · Final', '15 questions · 90 min', '176 students', 'Completed', 'amber']] : [['Algorithms · Midterm', 'Today · 14:00–15:00', '128 assigned · 12 questions', 'Upcoming', 'amber'], ['Data Structures · Practice', 'Tomorrow · 09:30–10:15', '84 assigned · 8 questions', 'Upcoming', 'sky'], ['Web Fundamentals · Quiz', 'Live now · ends 12:30', '42 assigned · 6 questions', 'Active', 'green'], ['Python Foundations', 'May 17 · completed', '216 assigned · 10 questions', 'Completed', 'slate']]).map(([name, meta, studentsText, status, tone], index) => <div className="glass card-lift rounded-2xl p-5" key={name}><div className="flex items-start justify-between"><span className={cx('grid h-10 w-10 place-items-center rounded-xl', assessment ? 'bg-sky-50 text-sky-600' : 'bg-slate-900 text-cyan-300')}>{assessment ? <ClipboardCheck size={18} /> : <Clock3 size={18} />}</span><Badge tone={tone as 'green' | 'sky' | 'slate' | 'amber'}>{status}</Badge></div><h2 className="mt-6 text-lg font-semibold tracking-tight text-slate-900">{name}</h2><div className="mt-2 text-xs text-slate-500">{meta}</div><div className="mt-1 text-xs text-slate-400">{studentsText}</div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-[11px] text-slate-400">{assessment ? 'Last edited 2h ago' : 'Window protected'}</span><div className="flex gap-1"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" data-testid={`button-view-${kind}-${index}`}><ChevronRight size={15} /></button><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" data-testid={`button-more-${kind}-${index}`}><MoreHorizontal size={15} /></button></div></div></div>)}</div></Page>;
}

function SubmissionsPage() {
  return <Page><SectionHeader eyebrow="Review queue" title="Submissions" description="Every solution, its AI confidence, and the evidence behind the score." /><div className="glass overflow-hidden rounded-2xl"><div className="flex flex-wrap justify-between gap-3 border-b border-slate-100 p-4"><div className="relative max-w-sm flex-1"><Search className="absolute left-3 top-2.5 text-slate-400" size={15} /><input className="field pl-9 text-xs" placeholder="Search student or question" data-testid="input-submission-search" /></div><button className="btn-quiet rounded-lg px-3 py-2 text-xs font-semibold" data-testid="button-filter-submissions"><Filter size={14} /> Filters</button></div><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="bg-slate-50/75 text-[10px] uppercase tracking-wider text-slate-400"><tr>{['Student', 'Assessment', 'Question', 'Submitted', 'Language', 'Score', 'Verdict', 'Confidence', ''].map(h => <th className="px-5 py-3" key={h}>{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{submissions.map(item => <tr className="table-row" key={item.id}><td className="px-5 py-4 font-semibold text-slate-800">{item.student}</td><td className="px-5 py-4 text-slate-500">{item.assessment}</td><td className="max-w-[190px] truncate px-5 py-4 text-slate-500">{item.question}</td><td className="px-5 py-4 text-slate-400">{item.at}</td><td className="px-5 py-4"><Badge>{item.language}</Badge></td><td className="px-5 py-4 mono font-medium text-slate-800">{item.score}</td><td className="px-5 py-4"><span className={cx('font-semibold', item.score > 85 ? 'text-emerald-600' : item.score > 75 ? 'text-sky-600' : 'text-amber-600')}>{item.verdict}</span></td><td className="px-5 py-4 text-slate-500">{item.confidence}%</td><td className="px-5 py-4"><Link href={`/admin/submissions/${item.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-sky-50 hover:text-sky-600" data-testid={`link-view-submission-${item.id}`}><ChevronRight size={15} /></Link></td></tr>)}</tbody></table></div></div></Page>;
}

function ResultsPage() {
  const scoreDist = [{ name: '0–59', value: 12, color: '#fca5a5' }, { name: '60–74', value: 27, color: '#fcd34d' }, { name: '75–89', value: 44, color: '#7dd3fc' }, { name: '90–100', value: 17, color: '#6ee7b7' }];
  return <Page><SectionHeader eyebrow="Analytics" title="Results" description="See how students perform and where your assessments create the most signal." action={<button className="btn-quiet rounded-lg px-3.5 py-2.5 text-xs font-semibold" data-testid="button-export-results"><Send size={14} /> Export report</button>} /><div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><div className="glass rounded-2xl p-5"><div className="text-sm font-semibold text-slate-800">Average score by assessment</div><div className="mt-1 text-xs text-slate-400">Comparison across active question sets</div><div className="mt-5 h-[250px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ name: 'Algorithms', score: 82 }, { name: 'Data structures', score: 76 }, { name: 'Python', score: 88 }, { name: 'Systems', score: 71 }]}><CartesianGrid stroke="#e8eef4" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} /><Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#0ea5e9" /></BarChart></ResponsiveContainer></div></div><div className="glass rounded-2xl p-5"><div className="text-sm font-semibold text-slate-800">Score distribution</div><div className="mt-1 text-xs text-slate-400">1,284 assessed submissions</div><div className="relative mt-3 h-[180px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={scoreDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={54} outerRadius={78} paddingAngle={3}>{scoreDist.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="text-center"><div className="mono text-2xl text-slate-900">78.6</div><div className="text-[10px] text-slate-400">avg score</div></div></div></div><div className="grid grid-cols-2 gap-2">{scoreDist.map(item => <div className="flex items-center justify-between text-[11px] text-slate-500" key={item.name}><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><span className="mono">{item.value}%</span></div>)}</div></div></div><div className="mt-4 glass rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-800">Agent evaluation distribution</div><div className="mt-1 text-xs text-slate-400">Average signal by dimension</div></div><Badge tone="green">Healthy coverage</Badge></div><div className="mt-6 grid gap-5 md:grid-cols-2">{[['Logic correctness', 84], ['Algorithmic efficiency', 81], ['Edge case robustness', 72], ['Code quality', 79], ['Security', 93], ['Explanation consistency', 68]].map(([label, value]) => <ProgressRow key={label as string} label={label as string} value={value as number} tone={(value as number) > 85 ? 'green' : (value as number) < 72 ? 'amber' : 'sky'} />)}</div></div></Page>;
}

function AssessmentCreate() {
  const [, setLocation] = useLocation(); const [name, setName] = useState(''); const [duration, setDuration] = useState('60'); const [selected, setSelected] = useState<string[]>(['q-101', 'q-102']); const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setLocation('/admin/assessments'), 700); };
  return <Page><SectionHeader eyebrow="Assessment authoring" title="Create Assessment" description="Define the window, choose the questions, and make the rules explicit." action={<div className="flex gap-2"><button onClick={() => setLocation('/admin/assessments')} className="btn-quiet rounded-lg px-3.5 py-2.5 text-xs font-semibold" data-testid="button-cancel-assessment">Cancel</button><button onClick={save} className="btn-primary rounded-lg px-4 py-2.5 text-xs font-semibold" data-testid="button-save-assessment"><Check size={14} /> {saved ? 'Saved' : 'Save assessment'}</button></div>} /><div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]"><div className="glass rounded-2xl p-5"><div className="text-sm font-semibold text-slate-800">Assessment settings</div><div className="mt-5 space-y-4"><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Assessment name</label><input value={name} onChange={e => setName(e.target.value)} className="field" placeholder="e.g. Algorithms · Midterm" data-testid="input-assessment-name" /></div><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Description</label><textarea className="field min-h-[90px] text-sm" placeholder="What will this assessment help you understand?" data-testid="textarea-assessment-description" /></div><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Instructions</label><textarea className="field min-h-[90px] text-sm" placeholder="Tell students how to approach the assessment." data-testid="textarea-assessment-instructions" /></div><div className="grid grid-cols-2 gap-3"><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Duration (minutes)</label><input value={duration} onChange={e => setDuration(e.target.value)} type="number" className="field" data-testid="input-assessment-duration" /></div><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Maximum attempts</label><input defaultValue="1" type="number" className="field" data-testid="input-max-attempts" /></div></div><div className="grid grid-cols-2 gap-3"><input type="date" className="field text-xs" data-testid="input-start-date" /><input type="time" className="field text-xs" data-testid="input-start-time" /><input type="date" className="field text-xs" data-testid="input-end-date" /><input type="time" className="field text-xs" data-testid="input-end-time" /></div><div className="space-y-3 border-t border-slate-100 pt-4">{['Randomize questions', 'Show results immediately', 'Allow AI feedback', 'Require explanation'].map((item, index) => <label className="flex items-center justify-between text-xs text-slate-600" key={item}>{item}<input defaultChecked={index < 3} type="checkbox" className="h-4 w-4 accent-sky-500" data-testid={`checkbox-setting-${index}`} /></label>)}</div></div></div><div className="glass rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-800">Assign questions</div><div className="mt-1 text-xs text-slate-400">Choose from your question bank</div></div><Badge tone="green">{selected.length} selected</Badge></div><div className="mt-5 space-y-2">{questionsSeed.map(q => <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-white/55 p-4 hover:border-sky-200" key={q.id}><input type="checkbox" checked={selected.includes(q.id)} onChange={e => setSelected(e.target.checked ? [...selected, q.id] : selected.filter(id => id !== q.id))} className="h-4 w-4 accent-sky-500" data-testid={`checkbox-assign-${q.id}`} /><span className="flex-1"><span className="block text-xs font-semibold text-slate-800">{q.title}</span><span className="mt-1 block text-[11px] text-slate-400">{q.topic} · {q.difficulty} · estimated {q.difficulty === 'Hard' ? 25 : q.difficulty === 'Medium' ? 15 : 10} min</span></span><Badge tone={q.difficulty === 'Hard' ? 'coral' : q.difficulty === 'Medium' ? 'amber' : 'green'}>{q.difficulty}</Badge></label>)}</div><div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-sky-50/70 p-4 text-center"><div><div className="mono text-lg text-sky-700">{selected.length}</div><div className="text-[10px] text-slate-500">Questions</div></div><div><div className="mono text-lg text-sky-700">{selected.length * 20}</div><div className="text-[10px] text-slate-500">Total marks</div></div><div><div className="mono text-lg text-sky-700">{duration}m</div><div className="text-[10px] text-slate-500">Duration</div></div></div></div></div></Page>;
}

function StudentDashboard() {
  return <Page><SectionHeader eyebrow="Tuesday, May 20" title="Welcome back, Maya." description="Ready for your next coding challenge?" action={<Link href="/student/assessments" className="btn-primary rounded-lg px-4 py-2.5 text-xs font-semibold" data-testid="link-view-assessments"><ClipboardCheck size={15} /> View assessments</Link>} /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Metric icon={Clock3} label="Upcoming assessments" value="02" tone="amber" /><Metric icon={CheckCircle2} label="Completed tests" value="08" tone="green" /><Metric icon={Trophy} label="Average score" value="82.4" tone="sky" /><Metric icon={Zap} label="Best score" value="96" tone="green" /><Metric icon={BrainCircuit} label="AI feedback received" value="14" tone="sky" /></div><div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_.85fr]"><div className="glass rounded-2xl p-6"><div className="flex items-start justify-between"><div><Badge tone="amber"><Clock3 size={12} /> Starts in 2h 15m</Badge><h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">Algorithms · Midterm</h2><p className="mt-2 text-sm leading-6 text-slate-500">A focused assessment on sliding windows, trees, and complexity.</p></div><div className="hidden rounded-2xl bg-slate-950 px-4 py-3 text-right text-white sm:block"><div className="mono text-xl">60:00</div><div className="text-[10px] text-slate-500">duration</div></div></div><div className="mt-8 grid grid-cols-3 gap-3 border-y border-slate-100 py-4 text-xs"><div><div className="text-slate-400">Questions</div><div className="mt-1 font-semibold text-slate-800">12</div></div><div><div className="text-slate-400">Window</div><div className="mt-1 font-semibold text-slate-800">14:00–15:00</div></div><div><div className="text-slate-400">Languages</div><div className="mt-1 font-semibold text-slate-800">6 allowed</div></div></div><Link href="/student/assessments/a-101" className="btn-primary mt-6 rounded-lg px-4 py-2.5 text-xs font-semibold" data-testid="link-upcoming-assessment">View assessment <ArrowRight size={14} /></Link></div><div className="glass rounded-2xl p-6"><div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-800">Performance overview</div><div className="mt-1 text-xs text-slate-400">Your last 6 evaluations</div></div><Badge tone="green">+6.8%</Badge></div><div className="mt-5 h-[180px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={[{ name: '1', value: 74 }, { name: '2', value: 81 }, { name: '3', value: 77 }, { name: '4', value: 89 }, { name: '5', value: 84 }, { name: '6', value: 92 }]}><defs><linearGradient id="studentFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity=".2" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs><XAxis dataKey="name" hide /><YAxis domain={[60, 100]} hide /><Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#studentFill)" /></AreaChart></ResponsiveContainer></div><div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Your score trend is moving up.</div></div></div><div className="mt-4 grid gap-4 lg:grid-cols-2"><div className="glass rounded-2xl p-5"><div className="flex items-center justify-between"><div className="text-sm font-semibold text-slate-800">Recent results</div><Link href="/student/results" className="text-xs font-semibold text-sky-600">View all</Link></div><div className="mt-4 space-y-3">{submissions.slice(0, 3).map(item => <Link href={`/student/submission/${item.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:border-sky-200" key={item.id} data-testid={`link-student-result-${item.id}`}><div><div className="text-xs font-semibold text-slate-800">{item.question}</div><div className="mt-1 text-[11px] text-slate-400">{item.assessment} · {item.at}</div></div><div className="mono text-sm font-medium text-emerald-600">{item.score}</div></Link>)}</div></div><div className="glass rounded-2xl p-5"><div className="text-sm font-semibold text-slate-800">Recommended practice</div><div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/60 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-sky-700"><Lightbulb size={15} /> Strengthen edge case instincts</div><p className="mt-2 text-xs leading-5 text-slate-500">Try three boundary-focused problems before your midterm. Your last review found one missed repetition pattern.</p><button className="mt-4 text-xs font-semibold text-sky-600" data-testid="button-start-practice">Open practice set <ArrowRight size={13} className="ml-1 inline" /></button></div></div></div></Page>;
}

function StudentAssessments() {
  const [tab, setTab] = useState('Upcoming');
  const tabs = ['Upcoming', 'Active', 'Completed'];
  return <Page><SectionHeader eyebrow="Your learning schedule" title="Assessments" description="Know what is next, what is live, and what you have already learned from." /><div className="mb-5 flex gap-5 border-b border-slate-200">{tabs.map(item => <button onClick={() => setTab(item)} className={cx('relative pb-3 text-sm font-semibold', tab === item ? 'text-sky-600' : 'text-slate-400')} key={item} data-testid={`button-assessment-tab-${item.toLowerCase()}`}>{item}{tab === item && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-sky-500" />}</button>)}</div><div className="grid gap-4 lg:grid-cols-2">{(tab === 'Upcoming' ? [['Algorithms · Midterm', 'Starts in 2h 15m', '12 questions · 60 min', 'amber'], ['Data Structures · Practice', 'Tomorrow at 09:30', '8 questions · 45 min', 'sky']] : tab === 'Active' ? [['Web Fundamentals · Quiz', 'Test is live', '6 questions · 30 min', 'green']] : [['Python Foundations', 'Completed May 17', '10 questions · 50 min · Score 92', 'green'], ['Systems Thinking · Quiz', 'Completed May 12', '8 questions · 40 min · Score 74', 'amber']]).map(([name, timing, meta, tone], index) => <div className="glass card-lift rounded-2xl p-5" key={name}><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600"><ClipboardCheck size={18} /></span><Badge tone={tone as 'amber' | 'sky' | 'green'}>{timing}</Badge></div><h2 className="mt-6 text-lg font-semibold text-slate-900">{name}</h2><div className="mt-2 text-xs text-slate-500">{meta}</div><Link href={tab === 'Completed' ? '/student/results' : '/student/assessments/a-101'} className={cx('mt-6 rounded-lg px-3.5 py-2.5 text-xs font-semibold', tab === 'Active' ? 'btn-primary' : 'btn-quiet')} data-testid={`link-assessment-card-${index}`}>{tab === 'Completed' ? 'View result' : tab === 'Active' ? 'Continue test' : 'View assessment'} <ArrowRight size={14} /></Link></div>)}</div></Page>;
}

function StudentAssessmentDetail() {
  const [, setLocation] = useLocation();
  return <Page><div className="mb-7"><Link href="/student/assessments" className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-sky-600" data-testid="link-back-assessments"><ArrowLeft size={14} /> All assessments</Link><div className="eyebrow">Assessment details</div><h1 className="mt-2 text-3xl font-semibold tracking-[-.05em] text-slate-950">Algorithms · Midterm</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">A focused assessment on applying algorithmic thinking to real constraints. Read each problem carefully and explain your approach where asked.</p></div><div className="grid gap-4 lg:grid-cols-[1fr_340px]"><div className="space-y-4"><div className="glass rounded-2xl p-5"><div className="text-sm font-semibold text-slate-800">Instructions</div><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-500"><li className="flex gap-2"><CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-500" />You have 60 minutes once the assessment begins.</li><li className="flex gap-2"><CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-500" />Choose from Python, Java, JavaScript, C++, C#, or Go.</li><li className="flex gap-2"><CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-500" />AI feedback is enabled and results will be available after submission.</li><li className="flex gap-2"><CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-500" />Hidden test cases are never shown during the test.</li></ul></div><div className="glass rounded-2xl p-5"><div className="text-sm font-semibold text-slate-800">Questions in this assessment</div><div className="mt-4 space-y-2">{questionsSeed.slice(0, 3).map((q, i) => <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3" key={q.id}><span className="mono text-xs text-slate-400">0{i + 1}</span><span className="flex-1 text-xs font-semibold text-slate-700">{q.title}</span><Badge tone={q.difficulty === 'Hard' ? 'coral' : 'amber'}>{q.difficulty}</Badge></div>)}</div></div></div><div className="glass h-fit rounded-2xl p-5"><Badge tone="amber"><Clock3 size={12} /> Starts in 2h 15m</Badge><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-3"><div className="text-[11px] text-slate-400">Duration</div><div className="mt-1 font-semibold text-slate-800">60 min</div></div><div className="rounded-xl bg-slate-50 p-3"><div className="text-[11px] text-slate-400">Questions</div><div className="mt-1 font-semibold text-slate-800">12</div></div><div className="rounded-xl bg-slate-50 p-3"><div className="text-[11px] text-slate-400">Total marks</div><div className="mt-1 font-semibold text-slate-800">100</div></div><div className="rounded-xl bg-slate-50 p-3"><div className="text-[11px] text-slate-400">Attempts</div><div className="mt-1 font-semibold text-slate-800">1</div></div></div><button onClick={() => setLocation('/student/test/t-101')} className="btn-primary mt-6 w-full rounded-xl py-3 text-sm font-semibold" data-testid="button-start-assessment"><Play size={15} /> Start assessment</button><div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-amber-700"><CircleHelp size={14} className="mt-0.5 shrink-0" /> Once you begin, the timer will start.</div></div></div></Page>;
}

function TestWorkspace({ questionMode = false }: { questionMode?: boolean }) {
  const [, setLocation] = useLocation(); const [code, setCode] = useState(defaultCode); const [question, setQuestion] = useState(0); const [seconds, setSeconds] = useState(3599); const [submitted, setSubmitted] = useState(false); const [showConfirm, setShowConfirm] = useState(false);
  useEffect(() => { const timer = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000); return () => clearInterval(timer); }, []);
  if (submitted) return <Page><div className="mx-auto mt-16 max-w-xl text-center"><div className="glass rounded-2xl p-9"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={28} /></span><div className="eyebrow mt-6 !text-emerald-600">Submission received</div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Your solution is with the AI judge.</h1><p className="mt-3 text-sm leading-6 text-slate-500">This local demo models the evaluation flow without executing code or exposing hidden test cases.</p><div className="mt-7 rounded-xl bg-slate-950 p-4 text-left"><div className="flex items-center gap-2 text-xs font-semibold text-cyan-300"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan-300" /> AI Evaluation in Progress</div><div className="mt-4 space-y-3">{['Understanding Code', 'Logic Evaluation', 'Edge Case Analysis', 'Complexity Analysis', 'Security Analysis', 'Feedback Synthesis', 'Master Judge'].map((item, i) => <div className="flex items-center gap-2 text-xs" key={item}><span className={cx('grid h-5 w-5 place-items-center rounded-full', i < 3 ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-slate-500')}>{i < 3 ? <Check size={11} /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />}</span><span className={i < 3 ? 'text-slate-200' : 'text-slate-500'}>{item}</span></div>)}</div></div><button onClick={() => setLocation('/student/submission/sub-784')} className="btn-primary mt-7 rounded-lg px-4 py-2.5 text-xs font-semibold" data-testid="button-view-student-result">View evaluation report <ArrowRight size={14} /></button></div></div></Page>;
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0'); const secs = (seconds % 60).toString().padStart(2, '0'); const timeTone = seconds < 300 ? 'text-rose-300' : seconds < 600 ? 'text-amber-300' : 'text-white';
  return <div className="fixed inset-0 flex flex-col bg-slate-100"><header className="flex min-h-[64px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6"><div className="flex items-center gap-4"><Link href="/student/assessments/a-101" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" data-testid="link-exit-test"><ArrowLeft size={17} /></Link><div><div className="text-sm font-semibold text-slate-900">Algorithms · Midterm</div><div className="text-[11px] text-slate-400">Assessment workspace · local demo</div></div></div><div className="flex items-center gap-4"><div className="hidden text-right sm:block"><div className="text-[10px] uppercase tracking-wider text-slate-400">Progress</div><div className="text-xs font-semibold text-slate-700">Question {question + 1} of 3</div></div><div className="rounded-xl bg-slate-950 px-4 py-2 text-center"><div className={cx('mono text-lg', timeTone)}>{mins}:{secs}</div><div className="text-[9px] uppercase tracking-widest text-slate-500">remaining</div></div><button onClick={() => setShowConfirm(true)} className="btn-primary rounded-lg px-3.5 py-2.5 text-xs font-semibold" data-testid="button-submit-assessment"><Send size={14} /> <span className="hidden sm:inline">Submit</span></button></div></header><div className="grid min-h-0 flex-1 grid-cols-[230px_1fr]"><aside className="hidden overflow-y-auto border-r border-slate-200 bg-white p-4 md:block"><div className="eyebrow !text-slate-400">Questions</div><div className="mt-4 space-y-2">{questionsSeed.slice(0, 3).map((q, i) => <button onClick={() => setQuestion(i)} className={cx('w-full rounded-xl border p-3 text-left', question === i ? 'border-sky-300 bg-sky-50' : 'border-slate-100 bg-white hover:border-sky-200')} key={q.id} data-testid={`button-question-nav-${i}`}><div className="flex items-center justify-between"><span className={cx('grid h-7 w-7 place-items-center rounded-lg text-xs font-bold', question === i ? 'bg-sky-500 text-white' : i < question ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500')}>{i + 1}</span>{i < question && <Check size={13} className="text-emerald-500" />}</div><div className="mt-3 truncate text-xs font-semibold text-slate-700">{q.title}</div><div className="mt-1 text-[10px] text-slate-400">{i === question ? 'Current' : i < question ? 'Visited' : 'Not visited'}</div></button>)}</div><div className="mt-6 border-t border-slate-100 pt-5"><div className="text-[10px] uppercase tracking-wider text-slate-400">Legend</div><div className="mt-3 space-y-2 text-[11px] text-slate-500"><div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-sky-500" />Current</div><div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />Answered</div><div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-slate-300" />Not visited</div></div></div></aside><div className="grid min-h-0 min-w-0 grid-cols-1 lg:grid-cols-2"><section className="nav-scroll overflow-y-auto border-r border-slate-200 bg-white p-5 sm:p-8"><div className="mx-auto max-w-xl"><div className="flex items-center justify-between"><Badge tone="sky">Question {String(question + 1).padStart(2, '0')}</Badge><Badge tone={question === 0 ? 'amber' : 'green'}>{questionsSeed[question].difficulty}</Badge></div><h1 className="mt-6 text-2xl font-semibold tracking-[-.04em] text-slate-900">{questionsSeed[question].title}</h1><p className="mt-4 text-sm leading-7 text-slate-500">{questionsSeed[question].statement} Return the answer efficiently and explain any trade-offs in your approach.</p><div className="mt-8"><h2 className="text-sm font-semibold text-slate-800">Input</h2><p className="mt-2 text-xs leading-6 text-slate-500">A string s containing lowercase English letters.</p><h2 className="mt-6 text-sm font-semibold text-slate-800">Output</h2><p className="mt-2 text-xs leading-6 text-slate-500">Return the length of the longest substring without repeated characters.</p><h2 className="mt-6 text-sm font-semibold text-slate-800">Constraints</h2><div className="mt-2 rounded-xl bg-slate-50 p-4 mono text-xs leading-6 text-slate-500">0 ≤ s.length ≤ 5 × 10⁴<br />s consists of printable ASCII characters.</div><h2 className="mt-6 text-sm font-semibold text-slate-800">Example</h2><div className="mt-2 grid grid-cols-2 gap-2 mono text-xs"><div className="rounded-xl bg-slate-50 p-3 text-slate-500">Input<br /><span className="text-slate-800">s = "abcabcbb"</span></div><div className="rounded-xl bg-slate-50 p-3 text-slate-500">Output<br /><span className="text-slate-800">3</span></div></div></div></div></section><section className="flex min-h-0 flex-col bg-slate-950"><div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-2.5"><div className="flex items-center gap-2 text-xs font-semibold text-slate-300"><FileCode2 size={14} className="text-cyan-300" /> solution.py</div><select className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs text-white outline-none" data-testid="select-test-language"><option className="text-slate-900">Python</option><option className="text-slate-900">Java</option><option className="text-slate-900">C++</option></select></div><div className="flex flex-1 min-h-0 flex-col"><CodeEditor code={code} onChange={setCode} language="Python" ariaLabel="Test code editor" testId="textarea-test-code" minHeight="100%" /></div><div className="flex items-center justify-between border-t border-white/10 bg-slate-900 px-4 py-3"><span className="text-[11px] text-slate-500">Autosaved just now</span><div className="flex gap-2"><button onClick={() => setCode(defaultCode)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white" data-testid="button-reset-test-code">Reset</button><button onClick={() => setShowConfirm(true)} className="btn-primary rounded-lg px-3 py-2 text-xs font-semibold" data-testid="button-submit-code"><Send size={13} /> Submit code</button></div></div></section></div></div>{showConfirm && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-5 backdrop-blur-sm"><div className="glass max-w-sm rounded-2xl p-6"><div className="flex items-start justify-between"><div><div className="eyebrow !text-slate-400">Final check</div><h2 className="mt-2 text-xl font-semibold text-slate-900">Submit this solution?</h2></div><button onClick={() => setShowConfirm(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" data-testid="button-close-submit-modal"><X size={16} /></button></div><div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs text-slate-500"><div className="flex justify-between"><span>Question</span><span className="font-semibold text-slate-800">Question {question + 1}</span></div><div className="mt-2 flex justify-between"><span>Language</span><span className="font-semibold text-slate-800">Python</span></div><div className="mt-2 flex justify-between"><span>Code saved</span><span className="font-semibold text-emerald-600">Just now</span></div></div><p className="mt-4 text-xs leading-5 text-slate-500">The timer will continue for unanswered questions. Hidden test cases remain private.</p><div className="mt-6 flex gap-2"><button onClick={() => setShowConfirm(false)} className="btn-quiet flex-1 rounded-lg py-2.5 text-xs font-semibold" data-testid="button-cancel-submit">Cancel</button><button onClick={() => { setShowConfirm(false); setSubmitted(true); evaluateCodeWithBackend(code, 'python'); }} className="btn-primary flex-1 rounded-lg py-2.5 text-xs font-semibold" data-testid="button-confirm-submit"><Send size={13} /> Submit</button></div></div></div>}</div>;
}

function StudentResult({ admin = false }: { admin?: boolean }) {
  const storedRaw = typeof window !== 'undefined' ? sessionStorage.getItem('cj-latest-evaluation') : null;
  const storedData = storedRaw ? JSON.parse(storedRaw) : null;
  const activeReview = storedData?.review;

  const displayScore = activeReview?.score ?? evaluation.score;
  const displayVerdict = activeReview?.verdict ?? evaluation.verdict;
  const displayConfidence = activeReview?.confidence ?? evaluation.confidence;
  const displayReasoning = activeReview?.overall_feedback || activeReview?.summary || activeReview?.feedback?.[0] || 'Strong sliding-window implementation with a clear invariant.';

  const breakdown = [
    ['Logic correctness', activeReview?.logic_score ?? 94],
    ['Algorithmic efficiency', activeReview?.complexity_score ?? 90],
    ['Edge case robustness', activeReview?.testcase_score ?? 82],
    ['Code quality', (activeReview?.code_quality?.readability_score ?? 8) * 10],
  ] as [string, number][];

  return <Page><SectionHeader eyebrow={admin ? 'Submission detail · sub-784' : 'Your result · sub-784'} title={admin ? 'Maya Chen’s evaluation' : 'Your evaluation report'} description={admin ? 'Algorithms · Midterm / Longest Substring Without Repeating Characters' : 'Algorithms · Midterm / Longest Substring Without Repeating Characters'} action={<Link href={admin ? '/admin/submissions' : '/student/results'} className="btn-quiet rounded-lg px-3.5 py-2.5 text-xs font-semibold" data-testid="link-back-results"><ArrowLeft size={14} /> Back to results</Link>} /><div className="grid gap-4 lg:grid-cols-[.72fr_1.28fr]"><div className="glass rounded-2xl p-6"><div className="flex items-center justify-between"><div className="eyebrow !text-slate-400">Master Judge</div><Badge tone="green"><CheckCircle2 size={12} /> {displayVerdict}</Badge></div><div className="mt-8 flex justify-center"><ScoreRing score={displayScore} /></div><div className="mt-6 text-center"><div className="text-sm font-semibold text-slate-800">{displayVerdict}</div><div className="mt-1 text-xs text-slate-500">AI confidence · {displayConfidence}%</div></div><div className="mt-7 rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-300">{displayReasoning}</div></div><div className="space-y-4"><div className="glass rounded-2xl p-6"><div className="eyebrow !text-slate-400">Feedback dimensions</div><div className="mt-5 grid gap-5 sm:grid-cols-2">{breakdown.map(([label, value]) => <ProgressRow key={label} label={label} value={value} tone={value > 90 ? 'green' : value < 80 ? 'amber' : 'sky'} />)}</div></div><div className="glass rounded-2xl p-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Lightbulb size={16} /></span><div><div className="text-sm font-semibold text-slate-800">Recommended improvements</div><div className="text-[11px] text-slate-400">Specific, not generic</div></div></div><ul className="mt-5 space-y-3 text-xs leading-5 text-slate-500"><li className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />Add a boundary test for a repeated sequence after contraction.</li><li className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />Explain the set invariant before the loop begins.</li><li className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />Practice communicating the space trade-off for large alphabets.</li></ul></div></div></div></Page>;
}

function StudentResults() {
  return <Page><SectionHeader eyebrow="Learning history" title="Results" description="Your past evaluations, with the reasoning that helps the next attempt." /><div className="grid gap-4 lg:grid-cols-2">{submissions.map(item => <Link href={`/student/submission/${item.id}`} className="glass card-lift rounded-2xl p-5" key={item.id} data-testid={`card-result-${item.id}`}><div className="flex items-start justify-between"><div><div className="text-sm font-semibold text-slate-900">{item.question}</div><div className="mt-1 text-xs text-slate-400">{item.assessment} · {item.at}</div></div><span className="mono text-2xl font-medium tracking-[-.06em] text-slate-900">{item.score}</span></div><div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4"><span className="flex items-center gap-2 text-xs text-emerald-600"><CheckCircle2 size={14} /> {item.verdict}</span><span className="text-xs text-slate-400">Confidence {item.confidence}% <ChevronRight size={13} className="ml-1 inline" /></span></div></Link>)}</div></Page>;
}

/*
function Router({ role, setRole, user, setUser, code, setCode, onEvaluate, questions, setQuestions }: { role: Role | null; setRole: (role: Role | null) => void; user: string; setUser: (name: string) => void; code: string; setCode: (code: string) => void; onEvaluate: () => void; questions: Question[]; setQuestions: (questions: Question[]) => void }) {
  const admin = (content: React.ReactNode) => <Guard role={role} needed="ADMIN"><AppShell role="ADMIN" setRole={setRole} user={user}>{content}</AppShell></Guard>;
  const student = (content: React.ReactNode) => <Guard role={role} needed="STUDENT"><AppShell role="STUDENT" setRole={setRole} user={user}>{content}</AppShell></Guard>;
  return <Switch><Route path="/"><PublicHome /></Route><Route path="/compiler"><Compiler code={code} setCode={setCode} onEvaluate={onEvaluate} /></Route><Route path="/how-it-works"><InfoPage kind="how" /></Route><Route path="/features"><InfoPage kind="features" /></Route><Route path="/about"><InfoPage kind="about" /></Route><Route path="/login"><AuthPage setRole={setRole} setUser={setUser} /></Route><Route path="/register"><AuthPage register setRole={setRole} setUser={setUser} /></Route><Route path="/review-results"><ReviewResults /></Route><Route path="/admin"><>{admin(<AdminDashboard />)}</></Route><Route path="/admin/questions/create"><>{admin(<QuestionEditor questions={questions} setQuestions={setQuestions} />)}</></Route><Route path="/admin/questions/:id/edit"><>{admin(<QuestionEditor questions={questions} setQuestions={setQuestions} />)}</></Route><Route path="/admin/questions"><>{admin(<QuestionsPage questions={questions} setQuestions={setQuestions} />)}</Route><Route path="/admin/assessments/create"><>{admin(<AssessmentCreate />)}</></Route><Route path="/admin/assessments"><>{admin(<AdminListPage kind="assessments" />)}</Route><Route path="/admin/tests"><>{admin(<AdminListPage kind="tests" />)}</Route><Route path="/admin/submissions/:id"><>{admin(<StudentResult admin />)}</Route><Route path="/admin/submissions"><>{admin(<SubmissionsPage />)}</Route><Route path="/admin/results"><>{admin(<ResultsPage />)}</Route><Route path="/admin/students"><>{admin(<Page><SectionHeader eyebrow="People" title="Students" description="Students assigned to your assessment workspace." /><div className="glass overflow-hidden rounded-2xl"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400"><tr>{['Student', 'Student ID', 'Department', 'Year', 'Email', 'Status'].map(x => <th className="px-5 py-3" key={x}>{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{students.map(s => <tr className="table-row" key={s.id}><td className="px-5 py-4 font-semibold text-slate-800">{s.name}</td><td className="px-5 py-4 mono text-slate-500">{s.id}</td><td className="px-5 py-4 text-slate-500">{s.dept}</td><td className="px-5 py-4 text-slate-500">{s.year}</td><td className="px-5 py-4 text-slate-500">{s.email}</td><td className="px-5 py-4"><Badge tone={s.status === 'Assigned' ? 'green' : 'slate'}>{s.status}</Badge></td></tr>)}</tbody></table></div></div></Page>)}</Route><Route path="/admin/settings"><>{admin(<Page><SectionHeader eyebrow="Workspace" title="Settings" description="Local demo preferences for the CodeJudge AI workspace." /><div className="glass max-w-2xl rounded-2xl p-6 space-y-5">{['AI feedback enabled by default', 'Show confidence scores', 'Require explanation on hard questions', 'Email notifications for submissions'].map((x, i) => <label className="flex items-center justify-between border-b border-slate-100 pb-4 text-sm text-slate-700" key={x}>{x}<input type="checkbox" defaultChecked={i < 2} className="h-4 w-4 accent-sky-500" data-testid={`checkbox-setting-page-${i}`} /></label>)}</div></Page>)}</Route><Route path="/student"><>{student(<StudentDashboard />)}</Route><Route path="/student/assessments/:id"><>{student(<StudentAssessmentDetail />)}</Route><Route path="/student/assessments"><>{student(<StudentAssessments />)}</Route><Route path="/student/test/:testId/question/:questionId"><>{student(<TestWorkspace questionMode />)}</Route><Route path="/student/test/:id"><>{student(<TestWorkspace />)}</Route><Route path="/student/submission/:id"><>{student(<StudentResult />)}</Route><Route path="/student/results"><>{student(<StudentResults />)}</Route><Route path="/student/profile"><>{student(<Page><SectionHeader eyebrow="Your account" title="Profile" description="Local demo identity used for assigned assessment workflows." /><div className="glass max-w-xl rounded-2xl p-6"><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-100 text-lg font-bold text-sky-700">MC</span><div><div className="text-lg font-semibold text-slate-900">Maya Chen</div><div className="text-sm text-slate-500">maya.chen@northstar.edu</div></div></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Student ID</label><input defaultValue="STU-2048" className="field" data-testid="input-profile-student-id" /></div><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Department</label><input defaultValue="Computer Science" className="field" data-testid="input-profile-department" /></div></div><button className="btn-primary mt-6 rounded-lg px-4 py-2.5 text-xs font-semibold" data-testid="button-save-profile"><Check size={14} /> Save profile</button></div></Page>)}</Route><Route component={NotFound} /></Switch>;
}

}
*/

function Router({ role, setRole, user, setUser, code, setCode, questions, setQuestions }: { role: Role | null; setRole: (role: Role | null) => void; user: string; setUser: (name: string) => void; code: string; setCode: (code: string) => void; questions: Question[]; setQuestions: (questions: Question[]) => void }) {
  const [, setLocation] = useLocation();
  const admin = (content: React.ReactNode) => <Guard role={role} needed="ADMIN"><AppShell role="ADMIN" setRole={setRole} user={user}>{content}</AppShell></Guard>;
  const student = (content: React.ReactNode) => <Guard role={role} needed="STUDENT"><AppShell role="STUDENT" setRole={setRole} user={user}>{content}</AppShell></Guard>;

  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evalProgress, setEvalProgress] = useState(0);
  const [evalSlogan, setEvalSlogan] = useState('🔍 Initializing multi-agent evaluation network...');
  const [evalElapsedTime, setEvalElapsedTime] = useState(0);

  const initialAgents: AgentState[] = [
    { id: 'intent_detection_agent', name: 'Intent Detection', stage: '01', status: 'pending', icon: Compass, slogan: '🔍 Inferring problem context and structural intent...' },
    { id: 'logic_agent', name: 'Logic Evaluation', stage: '02', status: 'pending', icon: BrainCircuit, slogan: '🧠 Analyzing correctness, loop invariants, and logic bounds...' },
    { id: 'testcase_agent', name: 'Test Case Generation', stage: '03', status: 'pending', icon: Database, slogan: '🧪 Simulating edge cases and boundary parameters...' },
    { id: 'complexity_agent', name: 'Complexity Analysis', stage: '04', status: 'pending', icon: Gauge, slogan: '⚡ Calculating asymptotic time and space complexity O(N)...' },
    { id: 'hardcoding_agent', name: 'Hardcoding Detection', stage: '05', status: 'pending', icon: Search, slogan: '🕵️ Auditing for static return bypasses or cheat patterns...' },
    { id: 'security_agent', name: 'Security Audit', stage: '06', status: 'pending', icon: ShieldCheck, slogan: '🛡️ Scanning for unsafe system calls & memory vulnerabilities...' },
    { id: 'adversarial_agent', name: 'Adversarial Testing', stage: '07', status: 'pending', icon: Zap, slogan: '🎯 Executing adversarial stress testing against extreme inputs...' },
    { id: 'feedback_agent', name: 'Explanation Analysis', stage: '08', status: 'pending', icon: Lightbulb, slogan: '💡 Formulating personalized developer feedback & tips...' },
    { id: 'judge_agent', name: 'Master Judge Synthesis', stage: '09', status: 'pending', icon: Trophy, slogan: '🏆 Master Judge synthesizing final score and verdict...' },
  ];

  const [agentsList, setAgentsList] = useState<AgentState[]>(initialAgents);

  const startEvaluation = async (language: string) => {
    setIsEvalModalOpen(true);
    setEvalProgress(0);
    setEvalElapsedTime(0);
    setEvalSlogan('🔍 Initializing multi-agent evaluation network...');
    setAgentsList(initialAgents.map(a => ({ ...a, status: 'pending', summary_text: undefined })));

    const timer = setInterval(() => {
      setEvalElapsedTime(prev => prev + 1);
    }, 1000);

    try {
      await evaluateCodeWithBackendStream(code, language, (eventData) => {
        if (eventData.type === 'agent_start') {
          setAgentsList(prev => prev.map(a => 
            a.id === eventData.agent ? { ...a, status: 'active' } : a
          ));
          if (eventData.slogan) setEvalSlogan(eventData.slogan);
        } else if (eventData.type === 'agent_complete') {
          setAgentsList(prev => prev.map(a => 
            a.id === eventData.agent ? { ...a, status: 'completed', summary_text: eventData.summary_text } : a
          ));
          if (eventData.progress) setEvalProgress(eventData.progress);
          if (eventData.slogan) setEvalSlogan(eventData.slogan);
        } else if (eventData.type === 'final_result') {
          setEvalProgress(100);
          setAgentsList(prev => prev.map(a => ({ ...a, status: 'completed' })));
          setEvalSlogan('🎉 Evaluation complete! Opening detailed report...');
        }
      });
    } catch (err) {
      console.error('Streaming evaluation error:', err);
    } finally {
      clearInterval(timer);
      setTimeout(() => {
        setIsEvalModalOpen(false);
        setLocation('/review-results');
      }, 700);
    }
  };

  return (
    <>
      <LiveEvaluationModal
        isOpen={isEvalModalOpen}
        progress={evalProgress}
        currentSlogan={evalSlogan}
        agentsList={agentsList}
        elapsedTime={evalElapsedTime}
      />
      <Switch>
        <Route path="/"><PublicHome /></Route>
        <Route path="/compiler"><Compiler code={code} setCode={setCode} onEvaluate={startEvaluation} /></Route>
        <Route path="/how-it-works"><InfoPage kind="how" /></Route><Route path="/features"><InfoPage kind="features" /></Route><Route path="/about"><InfoPage kind="about" /></Route>
        <Route path="/login"><AuthPage setRole={setRole} setUser={setUser} /></Route><Route path="/register"><AuthPage register setRole={setRole} setUser={setUser} /></Route><Route path="/review-results"><ReviewResults /></Route>
        <Route path="/admin">{admin(<AdminDashboard />)}</Route>
        <Route path="/admin/questions/create">{admin(<QuestionEditor questions={questions} setQuestions={setQuestions} />)}</Route>
        <Route path="/admin/questions/:id/edit">{admin(<QuestionEditor questions={questions} setQuestions={setQuestions} />)}</Route>
        <Route path="/admin/questions">{admin(<QuestionsPage questions={questions} setQuestions={setQuestions} />)}</Route>
        <Route path="/admin/assessments/create">{admin(<AssessmentCreate />)}</Route><Route path="/admin/assessments">{admin(<AdminListPage kind="assessments" />)}</Route><Route path="/admin/tests">{admin(<AdminListPage kind="tests" />)}</Route>
        <Route path="/admin/submissions/:id">{admin(<StudentResult admin />)}</Route><Route path="/admin/submissions">{admin(<SubmissionsPage />)}</Route><Route path="/admin/results">{admin(<ResultsPage />)}</Route>
        <Route path="/admin/students">{admin(<Page><SectionHeader eyebrow="People" title="Students" description="Students assigned to your assessment workspace." /><div className="glass overflow-hidden rounded-2xl"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400"><tr>{['Student', 'Student ID', 'Department', 'Year', 'Email', 'Status'].map(x => <th className="px-5 py-3" key={x}>{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{students.map(s => <tr className="table-row" key={s.id}><td className="px-5 py-4 font-semibold text-slate-800">{s.name}</td><td className="px-5 py-4 mono text-slate-500">{s.id}</td><td className="px-5 py-4 text-slate-500">{s.dept}</td><td className="px-5 py-4 text-slate-500">{s.year}</td><td className="px-5 py-4 text-slate-500">{s.email}</td><td className="px-5 py-4"><Badge tone={s.status === 'Assigned' ? 'green' : 'slate'}>{s.status}</Badge></td></tr>)}</tbody></table></div></div></Page>)}</Route>
        <Route path="/admin/settings">{admin(<Page><SectionHeader eyebrow="Workspace" title="Settings" description="Local demo preferences for the CodeJudge AI workspace." /><div className="glass max-w-2xl rounded-2xl p-6 space-y-5">{['AI feedback enabled by default', 'Show confidence scores', 'Require explanation on hard questions', 'Email notifications for submissions'].map((x, i) => <label className="flex items-center justify-between border-b border-slate-100 pb-4 text-sm text-slate-700" key={x}>{x}<input type="checkbox" defaultChecked={i < 2} className="h-4 w-4 accent-sky-500" data-testid={`checkbox-setting-page-${i}`} /></label>)}</div></Page>)}</Route>
        <Route path="/student">{student(<StudentDashboard />)}</Route><Route path="/student/assessments/:id">{student(<StudentAssessmentDetail />)}</Route><Route path="/student/assessments">{student(<StudentAssessments />)}</Route>
        <Route path="/student/test/:testId/question/:questionId">{student(<TestWorkspace questionMode />)}</Route><Route path="/student/test/:id">{student(<TestWorkspace />)}</Route><Route path="/student/submission/:id">{student(<StudentResult />)}</Route><Route path="/student/results">{student(<StudentResults />)}</Route>
        <Route path="/student/profile">{student(<Page><SectionHeader eyebrow="Your account" title="Profile" description="Local demo identity used for assigned assessment workflows." /><div className="glass max-w-xl rounded-2xl p-6"><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-100 text-lg font-bold text-sky-700">MC</span><div><div className="text-lg font-semibold text-slate-900">Maya Chen</div><div className="text-sm text-slate-500">maya.chen@northstar.edu</div></div></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Student ID</label><input defaultValue="STU-2048" className="field" data-testid="input-profile-student-id" /></div><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Department</label><input defaultValue="Computer Science" className="field" data-testid="input-profile-department" /></div></div><button className="btn-primary mt-6 rounded-lg px-4 py-2.5 text-xs font-semibold" data-testid="button-save-profile"><Check size={14} /> Save profile</button></div></Page>)}</Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  const [role, setRole] = useState<Role | null>(() => (localStorage.getItem('cj-role') as Role | null) || null);
  const [user, setUser] = useState(() => localStorage.getItem('cj-user') || 'Maya Chen');
  const [code, setCode] = useState(defaultCode); const [questions, setQuestions] = useState<Question[]>(questionsSeed);
  useEffect(() => { if (role) localStorage.setItem('cj-role', role); else localStorage.removeItem('cj-role'); localStorage.setItem('cj-user', user); }, [role, user]);
  return <QueryClientProviderShim><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary resetKey={location.pathname}><Router role={role} setRole={setRole} user={user} setUser={setUser} code={code} setCode={setCode} questions={questions} setQuestions={setQuestions} /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProviderShim>;
}

function QueryClientProviderShim({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default App;