import React from 'react';

// Helper to parse bold (**bold**) and inline code (`code`)
const renderInlineMarkdown = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-medium text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="bg-secondary px-1.5 py-0.5 rounded text-[11px] font-mono border border-border text-foreground/90">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

// Render block content lines (paragraphs, bullets)
const renderContent = (content) => {
  if (!content) return null;
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} className="h-2" />;

    // Bullet list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.substring(2);
      return (
        <li key={idx} className="text-[13px] text-muted-foreground ml-4 list-disc pl-1 py-0.5 leading-relaxed font-body">
          {renderInlineMarkdown(bulletText)}
        </li>
      );
    }

    // Numbered list
    const numMatch = trimmed.match(/^\d+\.\s+(.*)/);
    if (numMatch) {
      return (
        <li key={idx} className="text-[13px] text-muted-foreground ml-4 list-decimal pl-1 py-0.5 leading-relaxed font-body">
          {renderInlineMarkdown(numMatch[1])}
        </li>
      );
    }

    // Paragraph
    return (
      <p key={idx} className="text-[13px] text-muted-foreground leading-relaxed py-1 font-body">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });
};

export default function Briefing({ briefingText }) {
  if (!briefingText) return null;

  // Split content by markdown ## headings
  const rawSections = briefingText.split(/(?=## )/);
  const sections = rawSections
    .map((section) => {
      const lines = section.split('\n');
      const titleLine = lines[0] || '';
      const title = titleLine.replace('## ', '').trim();
      const content = lines.slice(1).join('\n').trim();
      return { title, content };
    })
    .filter((s) => s.title);

  return (
    <div className="space-y-8 mt-2 animate-in fade-in duration-300">
      {sections.map((sec, idx) => (
        <div key={idx} className="text-left border-l-2 border-accent pl-4 py-0.5">
          <h3 className="text-sm font-medium tracking-tight text-foreground font-body mb-2 uppercase tracking-wider text-[11px] opacity-75">
            {sec.title}
          </h3>
          <div className="space-y-1.5">
            {renderContent(sec.content)}
          </div>
        </div>
      ))}
    </div>
  );
}
