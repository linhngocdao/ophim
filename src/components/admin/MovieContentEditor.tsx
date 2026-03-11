'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { useEffect, type ReactNode } from 'react'
import { Bold, Italic, List, ListOrdered, Link2, Undo2, Redo2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MovieContentEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

interface ToolButtonProps {
  onClick: () => void
  active?: boolean
  children: ReactNode
}

function ToolBtn({ onClick, active, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md border text-zinc-300 transition-colors',
        active
          ? 'border-[#f31260] bg-[#f31260]/20 text-[#f31260]'
          : 'border-white/10 bg-white/5 hover:bg-white/10'
      )}
    >
      {children}
    </button>
  )
}

export function MovieContentEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung phim...',
  className,
}: MovieContentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-[220px] rounded-b-xl border-x border-b border-white/10 bg-[#0f0f16] px-4 py-3 text-sm text-zinc-100 outline-none prose prose-invert max-w-none',
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const currentHtml = editor.getHTML()
    if (value !== currentHtml) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Nhập URL:')
    if (!url) return
    editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className={cn('overflow-hidden rounded-xl', className)}>
      <div className="flex flex-wrap gap-2 rounded-t-xl border border-white/10 bg-[#171722] p-2">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={addLink} active={editor.isActive('link')}>
          <Link2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
