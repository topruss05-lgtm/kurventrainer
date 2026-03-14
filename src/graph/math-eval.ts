/**
 * Safe math expression evaluator for polynomial functions.
 * Recursive descent parser — no eval() or new Function().
 * Supports: +, -, *, /, **, Math.pow(base, exp), x, numbers, parentheses.
 */

type Token =
  | { type: 'number'; value: number }
  | { type: 'var' }
  | { type: 'op'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'comma' }
  | { type: 'pow' };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = expr.length;

  while (i < len) {
    const ch = expr[i];

    if (ch === ' ' || ch === '\t') { i++; continue; }

    // Negative sign at start, after operator, after lparen, or after comma
    const isUnaryMinus = ch === '-' && (
      tokens.length === 0 ||
      tokens[tokens.length - 1].type === 'op' ||
      tokens[tokens.length - 1].type === 'lparen' ||
      tokens[tokens.length - 1].type === 'comma'
    );

    if (/\d/.test(ch) || ch === '.' || isUnaryMinus) {
      let num = '';
      if (isUnaryMinus) { num += '-'; i++; }
      while (i < len && (/\d/.test(expr[i]) || expr[i] === '.')) {
        num += expr[i++];
      }
      tokens.push({ type: 'number', value: Number(num) });
      continue;
    }

    if (ch === 'x') { tokens.push({ type: 'var' }); i++; continue; }
    if (ch === '(') { tokens.push({ type: 'lparen' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'rparen' }); i++; continue; }
    if (ch === ',') { tokens.push({ type: 'comma' }); i++; continue; }

    if (ch === '+' || ch === '-' || ch === '/') {
      tokens.push({ type: 'op', value: ch }); i++; continue;
    }

    if (ch === '*') {
      if (i + 1 < len && expr[i + 1] === '*') {
        tokens.push({ type: 'op', value: '**' }); i += 2;
      } else {
        tokens.push({ type: 'op', value: '*' }); i++;
      }
      continue;
    }

    if (i + 8 <= len && expr.slice(i, i + 8) === 'Math.pow') {
      tokens.push({ type: 'pow' }); i += 8; continue;
    }

    i++; // skip unknown chars
  }

  return tokens;
}

class Parser {
  private pos = 0;
  private tokens: Token[];
  private x: number;
  constructor(tokens: Token[], x: number) {
    this.tokens = tokens;
    this.x = x;
  }

  private peek(): Token | undefined { return this.tokens[this.pos]; }
  private consume(): Token { return this.tokens[this.pos++]; }

  parseExpr(): number {
    let result = this.parseTerm();
    let t = this.peek();
    while (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
      const op = (this.consume() as { type: 'op'; value: string }).value;
      const right = this.parseTerm();
      result = op === '+' ? result + right : result - right;
      t = this.peek();
    }
    return result;
  }

  private parseTerm(): number {
    let result = this.parsePower();
    let t = this.peek();
    while (t && t.type === 'op' && (t.value === '*' || t.value === '/')) {
      const op = (this.consume() as { type: 'op'; value: string }).value;
      const right = this.parsePower();
      result = op === '*' ? result * right : result / right;
      t = this.peek();
    }
    return result;
  }

  private parsePower(): number {
    let base = this.parseUnary();
    const t = this.peek();
    if (t && t.type === 'op' && t.value === '**') {
      this.consume();
      const exp = this.parseUnary();
      base = Math.pow(base, exp);
    }
    return base;
  }

  private parseUnary(): number {
    const t = this.peek();
    if (t && t.type === 'op' && t.value === '-') {
      this.consume();
      return -this.parseAtom();
    }
    return this.parseAtom();
  }

  private parseAtom(): number {
    const t = this.peek();
    if (!t) return 0;

    if (t.type === 'number') { this.consume(); return t.value; }
    if (t.type === 'var') { this.consume(); return this.x; }

    if (t.type === 'pow') {
      this.consume(); // Math.pow
      this.consume(); // (
      const base = this.parseExpr();
      this.consume(); // ,
      const exp = this.parseExpr();
      this.consume(); // )
      return Math.pow(base, exp);
    }

    if (t.type === 'lparen') {
      this.consume();
      const result = this.parseExpr();
      this.consume(); // )
      return result;
    }

    this.consume();
    return 0;
  }
}

export function evalMathExpr(expr: string, x: number): number {
  const tokens = tokenize(expr);
  const parser = new Parser(tokens, x);
  return parser.parseExpr();
}
