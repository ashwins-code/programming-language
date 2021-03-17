const Lexer = function () { }

function isOperator(op) {
    return ["[", "]", "+", "=", "/", "*", "(", ")", "-", "==", "::", "not", "and", "or", ":", "{", "}", ",", "^", "<", ">", "<=", ">=", "%", "!=", "!", "%"].indexOf(op) > -1
}

Lexer.prototype.getTokens = function (source) {
    var token = ""
    var tokens = []
    var getString = false
    for (var i = 0; i < source.length; i++) {
        var char = source[i]
        var next = source[i + 1]
        token += char

        if (!getString) {
            if (token == '"') {
                getString = true
            }else if (token.trim() == "") {
                if (token == "\n" || token == "\r") {
                    tokens.push(token)
                }
                token = ""
            } else if (isOperator(token)) {

                var idx = i + 1
                var nextNonSpace = source[idx]
                while (nextNonSpace == " ") {
                    idx++
                    nextNonSpace = source[idx]
                }

                if (!(token == "-" && !isNaN(nextNonSpace))) {
                    if (!(isOperator(token + nextNonSpace))) {
                        tokens.push(token)
                        token = ""
                    }
                }
            } else if (next == " " || isOperator(next) || (next == "\n" || next == "\r")) {
                while (token.indexOf(" ") > -1) {
                    token = token.replace(" ", "")
                }
                tokens.push(token)
                token = ""
            }
        } else if (char == '"') {
            tokens.push(token)
            token = ""
            getString = false
        }
    }

    return tokens
}


module.exports = {Lexer}