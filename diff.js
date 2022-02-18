export function derivative(poly) {
  return differentiate(parse(tokenize(poly)))
}

class Term {
  constructor(coefficient, exponent) {
    this.coefficient = Number(coefficient)
    this.exponent = Number(exponent)
  }
}

class Operator {
  constructor(lexeme) {
    this.lexeme = lexeme
  }
}

function tokenize(s) {
  const INVALID_CHAR_PATTERN = /[a-wyzA-WYZ*%]|\^[-]?\d+(\.\d?)/g
  const TOKEN_PATTERN = /\d+(\.\d+)?(x(\^(-)?\d+)?)?|x(\^(-)?\d+)?|[-+]/g
  if (INVALID_CHAR_PATTERN.test(s)) {
    throw new SyntaxError("Unable to recognize polynomial.")
  }
  // returns list of operators, and (coefficients, x, ^, and exponent as one term) and will parse through term later
  return [...s.match(TOKEN_PATTERN)].flat()
}

function parse(tokens) {
  let current = 0

  function at(expected) {
    const PLUS_OR_MINUS = /[+-]/
    const TERM_PATTERN = /\d+(\.\d+)?(x(\^\d+)?)?|x(\^\d+)?/
    if (expected === Operator) {
      return PLUS_OR_MINUS.test(tokens[current])
    } else if (expected === Term) {
      return TERM_PATTERN.test(tokens[current])
    } else if (expected === "-") {
      return expected === tokens[current]
    }
    throw new SyntaxError("Unable to recognize polynomial.")
  }

  function match(expected) {
    if (expected === undefined || at(expected)) {
      return tokens[current++]
    } else {
      throw new SyntaxError(`Expected: ${expected}`)
    }
  }

  function recursiveParser(operator, term) {
    const X = "x"
    const XANDEXP = "x^"
    const EXP = "^"
    let coefficient = 1
    let exponent = 0
    if (!term.startsWith(X) && term.includes(XANDEXP)) {
      coefficient = term.substring(0, term.indexOf(X))
      exponent = term.substring(term.indexOf(X) + 2)
    }
    else if (!term.includes(X) && !term.includes(EXP)) {
      coefficient = term
    }
    else if (term[0] !== X && !term.includes(XANDEXP)) {
      coefficient = term.substring(0, term.indexOf(X)) 
      exponent = 1
    }
    else if (term.substring(0, 2) === XANDEXP) {
      exponent = term.substring(2)
    }
    else if (term === X) {
      exponent = 1
    }

    
    if (operator) {
        return new Term(-coefficient, exponent)
    }
    else {
        return new Term(coefficient, exponent)
    }
  }
  
  let operator = false

  if (at("-")) {
    match("-")
    operator = true
  }

  let term = match(Term)
  let list_of_terms = []
  list_of_terms.push(recursiveParser(operator, term))

  while (at(Operator)) {
    let op = match(Operator)
    term = match(Term)
    if (op === "-") {
      list_of_terms.push(recursiveParser(true, term))
    } else {
      list_of_terms.push(recursiveParser(false, term))
    }
  }
  return list_of_terms
}

function differentiate(t) {
  let expression = ""
  const terms = t.map(
    (t) => new Term(t.exponent * t.coefficient, t.exponent - 1)
  )
  if (terms.length === 1 && terms[0].coefficient === 0) {
    return "0"
  }

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i]
    if (i !== 0) {
      if (term.coefficient > 0 && expression.length > 0) {
        expression += "+"
      }
    }
    if (term.coefficient !== 0) {
      expression += term.coefficient
      if (term.exponent !== 0) {
        if (term.exponent === 1) {
          expression += "x"
        } else {
          expression += `x^${term.exponent}`
        }
      }
    }
  }

  return expression
}

