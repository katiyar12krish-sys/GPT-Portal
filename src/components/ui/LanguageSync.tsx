'use client';

import { useEffect } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { EN_TO_HI, HI_TO_EN, PATTERNS } from '../../lib/i18n/dictionary';

// Kept for the whole session so switching language always starts from the original text.
const originals = new WeakMap<Node, string>();
const originalAttrs = new WeakMap<Element, Record<string, string>>();

const ATTRS = ['placeholder', 'title', 'aria-label'];
const HAS_HINDI = /[ऀ-ॿ]/;

function translate(text: string, lang: 'hi' | 'en'): string | null {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return null;
  if (lang === 'en') return HAS_HINDI.test(t) ? HI_TO_EN[t] ?? null : null;
  if (EN_TO_HI[t]) return EN_TO_HI[t];
  for (const [re, hi] of PATTERNS) if (re.test(t)) return t.replace(re, hi);
  return null;
}

/**
 * Keeps the whole interface in one language. Screens already handle much of their own
 * text; this covers the rest, on every page, including content that appears later.
 * Originals are remembered, so switching back restores the exact text.
 */
export function LanguageSync() {
  const { language } = useCollege();

  useEffect(() => {
    const lang = language as 'hi' | 'en';

    const fixText = (n: Text) => {
      const parent = n.parentElement;
      if (!parent || parent.closest('script,style,textarea,code,pre,[data-no-translate]')) return;
      const base = originals.get(n) ?? n.data;
      const next = translate(base, lang);
      if (next) {
        if (!originals.has(n)) originals.set(n, n.data);
        const lead = base.match(/^\s*/)?.[0] ?? '';
        const trail = base.match(/\s*$/)?.[0] ?? '';
        const value = lead + next + trail;
        if (n.data !== value) n.data = value;
      } else if (originals.has(n) && n.data !== base) {
        n.data = base;
      }
    };
    const fixAttrs = (el: Element) => {
      for (const a of ATTRS) {
        const v = el.getAttribute(a);
        if (!v) continue;
        const saved = originalAttrs.get(el) ?? {};
        const base = saved[a] ?? v;
        const next = translate(base, lang) ?? base;
        if (next !== v) {
          saved[a] = base;
          originalAttrs.set(el, saved);
          el.setAttribute(a, next);
        }
      }
    };
    const walk = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) return fixText(root as Text);
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const el = root as Element;
      fixAttrs(el);
      el.querySelectorAll('[placeholder],[title],[aria-label]').forEach(fixAttrs);
      const it = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = it.nextNode(); n; n = it.nextNode()) fixText(n as Text);
    };

    document.documentElement.lang = lang;
    walk(document.body);
    const obs = new MutationObserver(list => {
      obs.disconnect();
      for (const m of list) {
        if (m.type === 'characterData') {
          originals.delete(m.target);
          fixText(m.target as Text);
        } else m.addedNodes.forEach(walk);
      }
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, [language]);

  return null;
}
