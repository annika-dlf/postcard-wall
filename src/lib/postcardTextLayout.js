/**
 * Word wrap similar to normal CSS (spaces between words, break long tokens).
 * Keeps canvas export line breaks closer to the textarea / modal preview.
 */
export function wrapPostcardTextLines(ctx, text, maxWidth) {
  const result = []
  const paragraphs = String(text ?? '').split(/\r?\n/)

  for (const p of paragraphs) {
    if (p.length === 0) {
      result.push('')
      continue
    }
    const words = p.split(/\s+/).filter(Boolean)
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width <= maxWidth) {
        line = test
      } else {
        if (line) {
          result.push(line)
          line = ''
        }
        if (ctx.measureText(word).width <= maxWidth) {
          line = word
        } else {
          let part = ''
          for (const ch of word) {
            const t = part + ch
            if (ctx.measureText(t).width <= maxWidth || part === '') part = t
            else {
              result.push(part)
              part = ch
            }
          }
          line = part
        }
      }
    }
    if (line) result.push(line)
  }
  return result
}
