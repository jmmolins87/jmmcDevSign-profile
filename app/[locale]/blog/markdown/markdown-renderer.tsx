import Image from "next/image";
import { Fragment, type ReactNode } from "react";

const INLINE_TOKEN_PATTERN = /(!?\[[^\]\n]*\]\([^\s)]+\)|\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*)/gu;
const HTML_BLOCK_PATTERN = /<\/?(?:script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/?(?:script|style|iframe|object|embed)\s*>/giu;
const HTML_TAG_PATTERN = /<!--[\s\S]*?-->|<\/?[a-z][^>]*>/giu;

function stripRawHtml(value: string): string {
  return value.replace(HTML_BLOCK_PATTERN, "").replace(HTML_TAG_PATTERN, "");
}

function getSafeUrl(value: string): string | null {
  const url = value.trim();
  if (/^(?:https?:|\/|#)/iu.test(url) && !/^(?:javascript|data|vbscript):/iu.test(url)) return url;
  return null;
}

function renderInline(value: string): ReactNode[] {
  const sanitizedValue = stripRawHtml(value);
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of sanitizedValue.matchAll(INLINE_TOKEN_PATTERN)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(sanitizedValue.slice(cursor, index));

    if (token.startsWith("![")) {
      const imageMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/u.exec(token);
      const source = imageMatch ? getSafeUrl(imageMatch[2]) : null;
      if (imageMatch && source?.startsWith("/")) {
        nodes.push(
          <Image
            alt={imageMatch[1]}
            className="h-auto w-full border border-border object-cover grayscale contrast-125"
            height={675}
            key={`image-${index}`}
            src={source}
            width={1200}
          />,
        );
      }
    } else if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/u.exec(token);
      const href = linkMatch ? getSafeUrl(linkMatch[2]) : null;
      nodes.push(
        linkMatch && href ? (
          <a className="underline decoration-accent underline-offset-4 hover:text-accent" href={href} key={`link-${index}`} rel={href.startsWith("http") ? "noreferrer" : undefined}>
            {renderInline(linkMatch[1])}
          </a>
        ) : linkMatch ? (
          renderInline(linkMatch[1])
        ) : (
          token
        ),
      );
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={`strong-${index}`}>{renderInline(token.slice(2, -2))}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={`em-${index}`}>{renderInline(token.slice(1, -1))}</em>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code className="border border-border bg-surface-container px-space-xs py-space-2xs font-mono text-mono-code" key={`code-${index}`}>
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(token);
    }

    cursor = index + token.length;
  }

  if (cursor < sanitizedValue.length) nodes.push(sanitizedValue.slice(cursor));
  return nodes;
}

function isBlockStart(line: string): boolean {
  return /^(?:\s{0,3}#{1,3}\s+|\s{0,3}>\s?|\s{0,3}```|\s{0,3}-{3,}\s*$)/u.test(line);
}

function renderBlocks(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n?/gu, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fenceMatch = /^\s*```(?:[a-z0-9_-]+)?\s*$/iu.exec(line);
    if (fenceMatch) {
      index += 1;
      const codeLines: string[] = [];
      while (index < lines.length && !/^\s*```\s*$/u.test(lines[index])) {
        codeLines.push(stripRawHtml(lines[index]));
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push(
        <pre className="overflow-x-auto border border-border bg-surface-container-lowest p-space-md font-mono text-body-sm leading-relaxed" key={`code-block-${index}`}>
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const headingMatch = /^\s{0,3}(#{1,3})\s+(.+?)\s*#*\s*$/u.exec(line);
    if (headingMatch) {
      const Heading = `h${headingMatch[1].length}` as "h1" | "h2" | "h3";
      blocks.push(
        <Heading className="font-headline text-headline-md uppercase text-primary" key={`heading-${index}`}>
          {renderInline(headingMatch[2])}
        </Heading>,
      );
      index += 1;
      continue;
    }

    if (/^\s{0,3}-{3,}\s*$/u.test(line)) {
      blocks.push(<hr className="border-0 border-t border-border" key={`divider-${index}`} />);
      index += 1;
      continue;
    }

    if (/^\s{0,3}>\s?/u.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^\s{0,3}>\s?/u.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s{0,3}>\s?/u, ""));
        index += 1;
      }
      blocks.push(
        <blockquote className="border-s-2 border-accent ps-space-md text-body-lg italic text-on-surface-variant" key={`quote-${index}`}>
          {renderInline(quoteLines.join(" "))}
        </blockquote>,
      );
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraphLines.push(lines[index]);
      index += 1;
    }
    blocks.push(
      <p className="text-body-lg leading-relaxed text-on-surface-variant" key={`paragraph-${index}`}>
        {renderInline(paragraphLines.join(" "))}
      </p>,
    );
  }

  return blocks;
}

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  return <div className="grid gap-space-md">{renderBlocks(markdown).map((block, index) => <Fragment key={index}>{block}</Fragment>)}</div>;
}

