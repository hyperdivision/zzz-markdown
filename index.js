const z = require('zzz')
const markdown = require('marked')
const hljs = require('highlight.js')

module.exports = z(({ life }, [text]) => {
  life(function renderOnce (_, update) {
    let init = 0
    update(() => {
      return init++ === 0
    })
  })

  const tokens = markdown.lexer(text)

  return (attrs) => z``(attrs, walk(tokens))
})

const code = z`pre.hljs`
const codespan = z`code.hljs-inline`

function walk (token) {
  if (Array.isArray(token)) return token.map(walk)

  switch (token.type) {
    case 'space': return z`br`
    case 'text': return token.tokens ? walk(token.tokens) : token.raw
    case 'codespan': return codespan(highlight(token.text, token.lang))
    case 'code': return code(highlight(token.text, token.lang))
    case 'em': return z`em`(walk(token.tokens))
    case 'strong': return z`strong`(walk(token.tokens))
    case 'del': return z`del`(walk(token.tokens))
    case 'heading': return z`h${token.depth}`(walk(token.tokens))
    case 'blockquote': return z`blockquote`(walk(token.tokens))

    case 'paragraph': return z`p`(walk(token.tokens))
    case 'table': return z`table`([
      z`thead`(token.tokens.header.map((t, i) => z`th`({ align: token.align[i] }, walk(t)))),
      z`tbody`(token.tokens.cells.map((t, _) =>
        z`tr`(t.map((c, i) =>
          z`td`({ align: token.align[i] }, walk(c))
        ))
      ))
    ])
    case 'link': return z`a`({ href: token.href, title: token.title }, walk(token.tokens))
    case 'image': return z`img`({ title: token.title, src: token.href, alt: token.text })
    case 'list': return z`${token.ordered ? 'ol' : 'ul'}`(walk(token.items))
    case 'list_item': return z`li`(walk(token.tokens))
    default: return token
  }
}

function highlight (code, lang) {
  if (lang) return z.trust(hljs.highlight(lang, code).value)

  return z.trust(hljs.highlightAuto(code).value)
}
