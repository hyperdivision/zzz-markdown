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

  const tokens = markdown.Lexer.lex(text, markdown.defaults)

  return (attrs) => z``(attrs, tokens.map(parse))
})

const slugger = new markdown.Slugger()
const hr = z`hr`
const html = z.trust
const code = ({ lang, escaped }, text) => z`pre.hljs`(highlight(text, lang))
const codespan = text => z`code.hljs-inline`(highlight(text))
const blockquote = z`blockquote`
const paragraph = z`p`
const br = z`br`
const link = z`a`
const image = z`img`
const strong = z`strong`
const em = z`em`
const del = z`del`
const ol = z`ol`
const ul = z`ul`
const li = z`li`
const error = (token) => { throw token }

function parse (token, top = true) {
  switch (token.type) {
    case 'space': return ''
    case 'hr': return hr
    case 'heading': return z`h${token.depth}`({ id: slugger.slug(token.text) }, token.tokens.map(parseInline))
    case 'code': return code({ lang: token.lang, escaped: token.escaped }, token.text)
    case 'table': return table(token)
    case 'blockquote': return blockquote(token.tokens.map(parse))
    case 'list': return list(token)
    case 'html': return html(token.raw)
    case 'paragraph': return paragraph(token.tokens.map(parseInline))
    case 'text': {
      // TODO needs to keep parsing next text tokens and bundle into one paragraph
      const body = token.tokens ? token.tokens.map(parseInline) : token.raw
      return top ? paragraph(body) : body
    }
    default: return error(token)
  }
}

function table ({ align, tokens }) {
  return z`table`(
    z`thead`(tokens.header.map((th, i) =>
      z`th`({ align: align[i] }, parseInline(th))
    )),
    z`tbody`(
      tokens.cells.map((tr) =>
        z`tr`(tr.map((td, i) =>
          z`td`({ align: align[i] }, parseInline(td))
        ))
      )
    )
  )
}

function list ({ ordered, start, loose, items }) {
  return (ordered ? ol : ul)({ start }, items.map(item =>
    li(item.tokens.map(t =>
      parse(t, loose)
    ))
  ))
}

function highlight (code, lang) {
  if (lang) return z.trust(hljs.highlight(lang, code).value)

  return z.trust(hljs.highlightAuto(code).value)
}

function parseInline (token) {
  switch (token.type) {
    case 'escape': return token.raw
    case 'html': return html(token.raw)
    case 'codespan': return codespan(token.text)
    case 'br': return br
    case 'link': return link({ href: token.href, title: token.title }, token.tokens.map(parseInline))
    case 'image': return image({ src: token.href, title: token.title, alt: token.text })
    case 'strong': return strong(token.tokens.map(parseInline))
    case 'em': return em(token.tokens.map(parseInline))
    case 'del': return del(token.tokens.map(parseInline))
    case 'text': return token.raw
    default: return error(token)
  }
}
