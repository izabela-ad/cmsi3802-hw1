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
            return tokens[current++] //gives current token, and then increments it after
          } else {
            throw new SyntaxError(`Expected: ${expected}`)
          }
    }

    //parse it
    let op

    if (at(Operator)) {
        op = match()
    }
    while (at(Operator)) {
        // ...
    }
}

function differentiate(terms) {
    // check for zeroes, bigger and less than zeroes
}

