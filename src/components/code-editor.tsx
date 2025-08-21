"use client";

import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark as syntaxOneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Language = "javascript" | "typescript" | "css" | "html" | "json" | "markdown" | "python" | "sql" | "text";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  filename?: string;
  readonly?: boolean;
  placeholder?: string;
  defaultPreview?: boolean;
}

const languageExtensions = {
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  css: css(),
  html: html(),
  json: json(),
  markdown: markdown(),
  python: python(),
  sql: sql(),
  text: [],
};

// Component for enhanced code blocks
function CodeBlock({ children, className, isDark }: { children: string; className?: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!language) {
    return (
      <code className="px-1 py-0.5 bg-muted rounded text-sm font-mono text-foreground">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-4">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between bg-muted/50 border-b border-border/30 px-4 py-2 rounded-t-lg">
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>
      
      {/* Code content */}
      <div className="relative">
        <SyntaxHighlighter
          style={isDark ? syntaxOneDark : oneLight}
          language={language}
          PreTag="div"
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#6b7280',
            borderRight: '1px solid #e5e7eb',
            marginRight: '1em',
            userSelect: 'none'
          }}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 0.5rem 0.5rem',
            background: isDark ? '#1e1e1e' : '#f8f9fa',
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            }
          }}
        >
          {children.replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export function CodeEditor({
  value,
  onChange,
  language,
  filename,
  readonly = false,
  placeholder = "Start typing...",
  defaultPreview = false,
}: CodeEditorProps) {
  const [isDark, setIsDark] = useState(true);
  const [showPreview, setShowPreview] = useState(defaultPreview);
  const [splitView, setSplitView] = useState(false);

  const extensions = [
    languageExtensions[language],
    EditorView.lineWrapping,
    ...(readonly ? [EditorState.readOnly.of(true)] : []),
  ].flat();

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-muted px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{filename || "untitled"}</span>
          <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {language === "markdown" && (
            <>
              <button
                onClick={() => {
                  setShowPreview(!showPreview);
                  if (showPreview) setSplitView(false);
                }}
                className={`text-xs px-3 py-1 rounded hover:bg-accent transition-colors ${
                  showPreview && !splitView ? "bg-primary text-primary-foreground" : "bg-background"
                }`}
              >
                {showPreview && !splitView ? "Edit" : "Preview"}
              </button>
              <button
                onClick={() => {
                  setSplitView(!splitView);
                  if (!splitView) setShowPreview(true);
                }}
                className={`text-xs px-3 py-1 rounded hover:bg-accent transition-colors ${
                  splitView ? "bg-primary text-primary-foreground" : "bg-background"
                }`}
              >
                Split
              </button>
            </>
          )}
          <button
            onClick={() => setIsDark(!isDark)}
            className="text-xs px-3 py-1 bg-background rounded hover:bg-accent transition-colors"
          >
            {isDark ? "Light" : "Dark"}
          </button>
        </div>
      </div>
      
      {showPreview && language === "markdown" && !splitView ? (
        <div className="min-h-[400px] max-h-[600px] overflow-y-auto bg-background">
          <div className="p-6 prose-custom">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ node, inline, className, children, ...props }: any) => {
                  return !inline && className ? (
                    <CodeBlock 
                      className={className} 
                      isDark={isDark}
                    >
                      {String(children)}
                    </CodeBlock>
                  ) : (
                    <code className="px-1 py-0.5 bg-muted rounded text-sm font-mono text-foreground" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {value || "*No content to preview*"}
            </ReactMarkdown>
          </div>
        </div>
      ) : splitView && language === "markdown" ? (
        <div className="flex min-h-[400px]">
          {/* Editor */}
          <div className="flex-1 border-r">
            <CodeMirror
              value={value}
              onChange={onChange}
              extensions={extensions}
              theme={isDark ? oneDark : undefined}
              placeholder={placeholder}
              editable={!readonly}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                dropCursor: false,
                allowMultipleSelections: false,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                highlightSelectionMatches: false,
              }}
              className="text-sm h-full"
            />
          </div>
          {/* Preview */}
          <div className="flex-1 overflow-y-auto bg-background">
            <div className="p-6 prose-custom">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ node, inline, className, children, ...props }: any) => {
                    return !inline && className ? (
                      <CodeBlock 
                        className={className} 
                        isDark={isDark}
                      >
                        {String(children)}
                      </CodeBlock>
                    ) : (
                      <code className="px-1 py-0.5 bg-muted rounded text-sm font-mono text-foreground" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {value || "*No content to preview*"}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ) : (
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          theme={isDark ? oneDark : undefined}
          placeholder={placeholder}
          editable={!readonly}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
          }}
          className="text-sm"
        />
      )}
    </div>
  );
}
