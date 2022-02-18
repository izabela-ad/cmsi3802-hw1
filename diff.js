// regular expressions

const GENERAL_PATTERN = /\d+(\.\d+)?(x(\^(-)?\d+)?)?|x(\^(-)?\d+)?|[-+]/g
const TERM_PATTERN = /\d+(\.\d+)?(x(\^\d+)?)?|x(\^\d+)?/g
const PLUS_OR_MINUS = /[+-]/g
const PLUS = /\+/g
const MINUS = /\-/g
const COEFFICIENT_AND_X_AND_EXPONENT = /\d+(\.\d+)?\x\^\-?\d+/g
const X_AND_EXPONENT = /\x\^\-?\d+/g
const COEFFICIENT_AND_X = /\d+(?:\.\d+)?\x/g
const COEFFICIENT = /\d+(?:\.\d+)?/g
const X = /\x/g
const EXPONENT = /\^-?\d+/g

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
  let clean = /[a-wyzA-WYZ*%]|\^[-]?\d+(\.\d?)/g;
  if (clean.test(s)) {
    throw new SyntaxError("Cannot recognize polynomial.")
  }

  return [...s.match(GENERAL_PATTERN)].flat()
}

// console.log(tokenize(" - 3x^5 - 2x + 103- 2.5x^-22").next().value)
// console.log(tokenize("   2x^-4- 7x^20").next().value)

function parse(tokens) {
  let list_of_terms = []
  let current = 0
  let operator = false
  function at(expected) {
    if (expected === Operator) {
      return /[+-]/.test(tokens[current])
    } else if (expected === Term) {
      return /\d+(\.\d+)?(x(\^\d+)?)?|x(\^\d+)?/.test(tokens[current])
    } else if (expected === "-") {
      return expected === tokens[current]
    }
    throw new SyntaxError("Cannot recognize polynomial.")
  }

  function match(expected) {
    if (expected === undefined || at(expected)) {
      return tokens[current++] //gives current token, and then increments it after (but we need to increment by 2)
    } else {
      throw new SyntaxError(`Expected: ${expected}`)
    }
  }
  function recursiveParser(operator, term) {
    let coefficient = 1
    let exponent = 0

    // coefficient "x^" exponent
    if (!term.startsWith("x") && term.includes("x^")) {
      coefficient = term.substring(0, term.indexOf("x"))
      exponent = term.substring(term.indexOf("x") + 2)
    }
    // coefficient
    else if (!term.includes("x") && !term.includes("^")) {
      coefficient = term
    }
    // coefficient "x"
    else if (term[0] !== "x" && !term.includes("x^")) {
      coefficient = term.substring(0, term.indexOf("x")) // from start to x (non including)
      exponent = 1
    }
    // "x^" exponent
    else if (term.substring(0, 2) === "x^") {
      exponent = term.substring(2)
    }
    // "x"
    else if (term === "x") {
      exponent = 1
    }
    return operator ? new Term(-coefficient, exponent) : new Term(coefficient, exponent)
  }

  if (at("-")) {
    match("-")
    operator = true
  }
  let terms = match(Term)
  list_of_terms.push(recursiveParser(operator, terms))

  while (at(Operator)) {
    let op = match(Operator)
    terms = match(Term)
    if (op === "-") {
      list_of_terms.push(recursiveParser(true, terms))
    }
    list_of_terms.push(recursiveParser(false, terms))
  }
  return list_of_terms
}

function differentiate(terms) {
  // check for zeroes, bigger and less than zeroes
  let expression = []

  terms.forEach((term) => {
    // If term list is only one constant, give back a zero.
    // Otherwise, if the term list contains a constant, we
    // don't need to print the 0 out.
    if (term.coefficient * term.exponent === 0) {
      if (terms.length == 1) expression.push("0")
      return
    }
    // x only
    if (term.coefficient === 1 && term.exponent === 1) {
      expression.push("1")
      return
    }
    let newTerm = ""
    const addCoefficient = term.coefficient * term.exponent
    const addExponent = term.exponent - 1

    if (addCoefficient !== 1) newTerm += addCoefficient
    if (addExponent == 1) {
      newTerm += "x"
    } else if (addExponent !== 0) {
      newTerm += "x^" + addExponent
    }
    expression.push(newTerm)
  })

  for (let i = 0; i < expression.length - 1; i++) {
    if (!expression[i + 1].startsWith("-")) {
      expression[i] = expression[i].concat("+")
    }
  }

  return expression.join("")
}

/*

" - 3x^5 - 2x + 103- 2.5x^-22"

[
  Operator { lexeme: '-' },
  Term { coefficient: 3, exponent: 5 },
  Operator { lexeme: '-' },
  Term { coefficient: 2, exponent: 1 },
  Operator { lexeme: '+' },
  Term { coefficient: 103, exponent: 0 },
  Operator { lexeme: '-' },
  Term { coefficient: 2.5, exponent: -22 }
]

After parsing, we get a "AST"
[
  Term { coefficient: -3, exponent: 5 },
  Term { coefficient: -2, exponent: 1 },
  Term { coefficient: 103, exponent: 0 },
  Term { coefficient: -2.5, exponent: -22 }
]

Differentiating:
[
  Term { coefficient: -15, exponent: 4 },
  Term { coefficient: -2, exponent: 0 },
  Term { coefficient: 0, exponent: -1 },
  Term { coefficient: 55, exponent: -23 }
]

-15x^4-2+55x^-23

*/
