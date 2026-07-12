import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useRef } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

interface Props { content: string; onChange: (html: string) => void; placeholder?: string }

export default function RichTextEditor({ content, onChange, placeholder }: Props) {
  // Only seed content into the editor once (on first non-empty value).
  // After that, the editor is uncontrolled — onChange is the source of truth.
  // Sections unmount/remount on collapse so reopening always reinitialises.
  const hasInitialized = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing…' }),
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (!editor || hasInitialized.current) return
    if (content) {
      hasInitialized.current = true
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  return (
    <div>
      {editor && (
        <div className="flex flex-wrap gap-1 mb-1 border border-ivory-300 border-b-0 rounded-t-sm bg-ivory-100 px-2 py-1.5">
          {[
            { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold' },
            { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic' },
            { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), title: 'Heading 2' },
            { label: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), title: 'Heading 3' },
            { label: '• List', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: 'Bullet list' },
            { label: '1. List', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: 'Ordered list' },
          ].map(({ label, action, active, title }) => (
            <button key={label} type="button" title={title} onClick={action}
              className={`px-2 py-0.5 text-xs rounded-sm border transition-colors ${active ? 'bg-burgundy-700 text-white border-burgundy-700' : 'bg-white text-burgundy-800 border-ivory-300 hover:border-burgundy-400'}`}>
              {label}
            </button>
          ))}
        </div>
      )}
      <EditorContent editor={editor} className="tiptap-editor rounded-t-none" />
    </div>
  )
}
