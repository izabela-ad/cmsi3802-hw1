export function derivative(poly) {
    return differentiate([...parseFloat([...tokenize(poly)])])
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

function* tokenize(sourceCode) {

    const pattern = /\d+(?:\.\d+)?|[()x^+-]/g
    let tokens = [...sourceCode.matchAll(pattern)].flat()

    const tokenized = new Stream()

    for (const token of tokens) {
        if (token === Number) {
            let coefficient = token
            if (token.next === x) {
                if( token.next === "^" ) {
                    exponent = token.next
                } else {
                    exponent = 0
                }
            } else {
                exponent = 0
            }
            yield new Term(coefficient, exponent)
            
        }
        else if ( token === "x" ) {
            if (token.next === "^" ) {
                exponent = token.next
            } else {
                exponent = 0
            }
        }
        else if ( token === ("+" || "-")) {
            yield new Operator(token)
            //add to stream of tokens
        }
        else {
            throw new SyntaxError("Bad Expression")
        }
    }

    // let operators = tokens.filter( item => (item === "+") || (item === "-") )
    // let terms = tokens.filter( item => item === Number )


    // ... yield new Term(coefficient, exponent)
    // ... yield new Operator("+")

}

function* parse(tokens) {
    let current = 0
    function at(expected) {
        if ( expected === Number ) {
            return  /^\d+(\.\d+)?$/.test(tokens[current])
        }
        return tokens[current]?.constructor === expected
    }

    function match(expected) {
        if (expected === undefined || at(expected)) {
            return tokens[current++] //gives current token, and then increments it after (but we need to increment by 2)
          } else {
            throw new SyntaxError(`Expected: ${expected}`)
          }
    }


    while (at(Operator)) {
        let op = match()
        // add one to current and assign match to let term
        let term = match()
        //now current is at the next operator

         let coefficient = at(term.coefficent)
         let exponent = at(term.exponent)

        if (op === "-") {
            coefficient = coefficient * (-1)
            yield new Term(coefficent, exponent)
        } else if (op === "+") {
            yield new Term(coefficent, exponent)
        } else {
            throw new SyntaxError(`Expected: ${expected}`)
        }
    }
}

function differentiate(terms) {
    // check for zeroes, bigger and less than zeroes
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

