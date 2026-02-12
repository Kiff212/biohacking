import { marked } from 'marked';
import { useEffect, useState } from 'react';

interface MarkdownProps {
    content: string;
}

export function Markdown({ content }: MarkdownProps) {
    const [html, setHtml] = useState('');

    useEffect(() => {
        const parseMarkdown = async () => {
            const parsed = await marked.parse(content);
            setHtml(parsed);
        };
        parseMarkdown();
    }, [content]);

    return (
        <div
            className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-blue-400"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
