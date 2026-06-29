"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

/** Rendu Markdown enrichi : GFM (tableaux…), maths (KaTeX) et coloration de code. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-dhfc">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeHighlight]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
