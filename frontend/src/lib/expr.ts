/** Preprost izračun izrazov s +, −, ·, : in oklepaji (za prikaz v sandboxu). */

function normalize(expression: string): string {
  return expression
    .replace(/[·×x]/g, '*')
    .replace(/[:÷]/g, '/')
    .replace(/−/g, '-')
    .replace(/,/g, '.')
    .replace(/\s+/g, '')
}

export function evaluate(expression: string): number | null {
  const text = normalize(expression)
  let pos = 0

  const parseExpr = (): number => {
    let value = parseTerm()
    while (text[pos] === '+' || text[pos] === '-') {
      const op = text[pos++]
      const right = parseTerm()
      value = op === '+' ? value + right : value - right
    }
    return value
  }

  const parseTerm = (): number => {
    let value = parseFactor()
    while (text[pos] === '*' || text[pos] === '/') {
      const op = text[pos++]
      const right = parseFactor()
      if (op === '/' && right === 0) throw new Error('deljenje z 0')
      value = op === '*' ? value * right : value / right
    }
    return value
  }

  const parseFactor = (): number => {
    if (text[pos] === '-') {
      pos++
      return -parseFactor()
    }
    if (text[pos] === '(') {
      pos++
      const value = parseExpr()
      if (text[pos++] !== ')') throw new Error('manjka zaklepaj')
      return value
    }
    const match = /^\d+(\.\d+)?/.exec(text.slice(pos))
    if (!match) throw new Error('pričakovano število')
    pos += match[0].length
    return Number(match[0])
  }

  try {
    if (!text) return null
    const value = parseExpr()
    return pos === text.length && Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

export function compareSign(left: string, right: string): '<' | '=' | '>' | null {
  const a = evaluate(left)
  const b = evaluate(right)
  if (a === null || b === null) return null
  if (Math.abs(a - b) < 1e-9) return '='
  return a < b ? '<' : '>'
}
