"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Clipboard
} from 'lucide-react';
import { useCallback } from 'react';

// Simplified paste handling - we'll use the Paste button and let Tiptap handle normal paste

// Function to clean pasted HTML and preserve useful formatting
function cleanPastedHtml(html: string): string {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove unwanted elements and attributes
  const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'blockquote', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const allowedAttributes = ['href', 'target'];

  function cleanNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return node;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Convert common formatting tags
      if (['b', 'strong'].includes(tagName)) {
        const strong = document.createElement('strong');
        Array.from(element.childNodes).forEach(child => {
          const cleanChild = cleanNode(child);
          if (cleanChild) strong.appendChild(cleanChild);
        });
        return strong;
      }

      if (['i', 'em'].includes(tagName)) {
        const em = document.createElement('em');
        Array.from(element.childNodes).forEach(child => {
          const cleanChild = cleanNode(child);
          if (cleanChild) em.appendChild(cleanChild);
        });
        return em;
      }

      // Convert headings to paragraphs with strong formatting
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        Array.from(element.childNodes).forEach(child => {
          const cleanChild = cleanNode(child);
          if (cleanChild) strong.appendChild(cleanChild);
        });
        p.appendChild(strong);
        return p;
      }

      if (allowedTags.includes(tagName)) {
        const newElement = document.createElement(tagName);

        // Copy allowed attributes
        Array.from(element.attributes).forEach(attr => {
          if (allowedAttributes.includes(attr.name.toLowerCase())) {
            newElement.setAttribute(attr.name, attr.value);
          }
        });

        // Process children
        Array.from(element.childNodes).forEach(child => {
          const cleanChild = cleanNode(child);
          if (cleanChild) newElement.appendChild(cleanChild);
        });

        return newElement;
      }

      // For disallowed tags, just process children
      const fragment = document.createDocumentFragment();
      Array.from(element.childNodes).forEach(child => {
        const cleanChild = cleanNode(child);
        if (cleanChild) fragment.appendChild(cleanChild);
      });
      return fragment;
    }

    return null;
  }

  const cleaned = cleanNode(tempDiv);
  return cleaned ? (cleaned as Element).innerHTML || cleaned.textContent || '' : '';
}

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className = ""
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),

    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4 text-gray-900',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const pasteFormatted = useCallback(async () => {
    if (!editor) return;

    try {
      const clipboardData = await navigator.clipboard.read();
      for (const item of clipboardData) {
        if (item.types.includes('text/html')) {
          const htmlBlob = await item.getType('text/html');
          const htmlText = await htmlBlob.text();
          const cleanHtml = cleanPastedHtml(htmlText);

          if (cleanHtml) {
            // Insert HTML content
            editor.commands.insertContent(cleanHtml);
            return;
          }
        }
      }

      // Fallback to plain text
      const text = await navigator.clipboard.readText();
      if (text) {
        editor.commands.insertContent(text);
      }
    } catch (error) {
      console.warn('Clipboard access failed, use Ctrl+V instead');
      // Fallback: focus editor so user can use Ctrl+V
      editor.commands.focus();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border-2 border-gray-200 rounded-xl focus-within:border-indigo-500 transition-all duration-200 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={pasteFormatted}
          className="h-8 px-2 text-xs"
          title="Paste Formatted Text"
        >
          <Clipboard className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Paste</span>
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          className="h-8 w-8 p-0"
          title="Remove Link"
        >
          <Unlink className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="h-8 w-8 p-0"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="h-8 w-8 p-0"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="min-h-[150px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
