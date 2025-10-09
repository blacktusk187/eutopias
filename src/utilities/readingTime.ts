import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

function extractPlainTextFromLexical(state: DefaultTypedEditorState): string {
  try {
    const root = (state as any)?.root
    if (!root) return ''

    const walk = (node: any): string => {
      if (!node) return ''
      const type = node.type
      if (type === 'text') return node.text || ''
      if (Array.isArray(node.children)) return node.children.map(walk).join(' ')
      return ''
    }

    return walk(root)
  } catch {
    return ''
  }
}

export function calculateReadingTimeFromRichText(state?: DefaultTypedEditorState | null): {
  minutes: number
  words: number
} {
  if (!state) return { minutes: 0, words: 0 }
  const text = extractPlainTextFromLexical(state)
  const words = (text.trim().match(/\S+/g) || []).length
  const wordsPerMinute = 225
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))
  return { minutes, words }
}
