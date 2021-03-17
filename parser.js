const {
    returnStmt,
    funcDec,
    forLoop,
    whileLoop,
    ifStmt,
    varDec,
    functionCall,
    dot,
    getIndex,
    indexAssign,
    elifStmt,
    classMethodDec,
    classDec
} = require("./nodeTypes")

function isOperator(op) {
    return ["+", "=", "/", "*", "(", ")", "-", "==", "::", "not", "and", "or", ":", "{", "}", ",", "^", "<", ">", "<=", ">=", "%", "!=", "!", "%"].indexOf(op) > -1
}


const Parser = function () {
    this.lineno = 1
}


Parser.prototype.parse = function (tokens) {
    var tree = []
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i]
        var next = tokens[i + 1]
        if (token == "\n" || token == "\r") {
            this.lineno++
        } else if (token == "if") {
            var expr = this.getExpr(tokens, i + 1)
            var ifStatement = new ifStmt(expr[0])

            i = expr[1]
            var body = this.getBody(tokens, i)
            ifStatement.body = body[0]
            i = body[1]
            tree.push(ifStatement)
        } else if (token == "elif") {
            var expr = this.getExpr(tokens, i + 1)
            var ifStatement = new elifStmt(expr[0])

            i = expr[1]
            var body = this.getBody(tokens, i)
            ifStatement.body = body[0]
            i = body[1]
            tree.push(ifStatement)
        } else if (token == "while") {
            var expr = this.getExpr(tokens, i + 1)
            var loop = new whileLoop(expr[0])

            i = expr[1]
            var body = this.getBody(tokens, i)
            loop.body = body[0]
            i = body[1]
            tree.push(loop)
        } else if (token == "for") {
            var iterVar = tokens[i + 1]
            var expr = this.getExpr(tokens, i + 2)
            var loop = new forLoop(iterVar, expr[0])
            i = expr[1]
            var body = this.getBody(tokens, i)
            loop.body = body[0]
            i = body[1]
            tree.push(loop)
        } else if (token == "func") {
            if (next != "::") {
                var funcName = tokens[i + 1]
                var args = this.getArgs(tokens, i + 3)
                i = args[1]
                var body = this.getBody(tokens, i + 1)
                i = body[1]
                var func = new funcDec(funcName, args[0])
                func.body = body[0]
                tree.push(func)
            } else {
                var className = tokens[i + 2]
                var funcName = tokens[i + 3]
                var args = this.getArgs(tokens, i + 5)
                i = args[1]
                var body = this.getBody(tokens, i + 1)
                i = body[1]
                var func = new classMethodDec(className, funcName, args[0])
                func.body = body[0]
                tree.push(func)
            }
        } else if (token == "return") {
            var expr = this.getExpr(tokens, i + 1)
            i = expr[1]
            var r = new returnStmt(expr[0])
            tree.push(r)
        } else if (token == "class") {
            var className = next
            var cd = new classDec(className)
            tree.push(cd)
        } else if (token == "[") {
            i++
            var indexExpr = []

            while (tokens[i] != "]") {
                indexExpr.push(tokens[i])
                i++
            }

            if (tokens[i + 1] == "=") {
                var expr = this.getExpr(tokens, i + 2)
                i = expr[1]
                tree[tree.length - 1] = new indexAssign(tree[tree.length - 1], indexExpr, expr[0])
            }
        } else if (next == "=") {
            var vd = new varDec(token)
            var expr = this.getExpr(tokens, i + 2)
            vd.val = expr[0]
            tree.push(vd)
            i = expr[1]
        } else if (next == "::") {
            var obj = token
            var parseThis = []

            i += 2

            while (tokens[i] && (tokens[i] != "\n" && tokens[i] != "\r")) {
                parseThis.push(tokens[i])
                i++
            }

            parseThis = this.parse(parseThis)
            tree.push(new dot([obj], parseThis))
        } else if (next == "(" && !isOperator(token)) {
            var fnCall = new functionCall(token)
            var args = this.getArgs(tokens, i + 2)
            fnCall.args = args[0]
            tree.push(fnCall)
            i = args[1]
        } else {
            tree.push(token)
        }
    }

    return tree
}

Parser.prototype.getBody = function (tokens, idx) {
    var body = []
    var balance = 0
    if (tokens[idx] == "{") {
        balance++
        idx++
    }
    for (var i = idx; i < tokens.length; i++) {
        var token = tokens[i]

        if (token == "{") balance++
        else if (token == "}") balance--
        body.push(token)
        if (balance == 0) break
    }

    return [this.parse(body), i]
}

Parser.prototype.getArgs = function (tokens, idx) {
    var balance = 1
    var args = []
    var currArg = []
    for (var i = idx; i < tokens.length; i++) {
        var token = tokens[i]

        if (token == "(") balance++
        else if (token == ")") {
            balance--
            if (balance == 0) {
                args.push(this.parseExpr(currArg))
                break
            }
        }

        if (token != ",") {
            currArg.push(token)
        } else if (balance == 1) {
            args.push(this.parseExpr(currArg))
            currArg = []
        } else {
            currArg.push(token)
        }
    }

    return [args, i]
}

Parser.prototype.getExpr = function (tokens, idx) {
    var expr = []
    for (var i = idx; i < tokens.length; i++) {
        var token = tokens[i]
        if (token == "\n" || token == "\r" || token == "{") break
        expr.push(token)
    }

    return [this.parseExpr(expr), i]
}

Parser.prototype.parseExpr = function (expr) {
    var parsedExpr = []
    for (var i = 0; i < expr.length; i++) {
        var token = expr[i]
        var next = expr[i + 1]
        if (next == "(" && !isOperator(token)) {
            var fnCall = new functionCall(token)
            var args = this.getArgs(expr, i + 2)
            fnCall.args = args[0]
            parsedExpr.push(fnCall)
            i = args[1]
        } else if (next == "::") {
            var obj = token
            var parseThis = []

            i += 2

            while (expr[i] && (expr[i] != "\n" && expr[i] != "\r")) {
                parseThis.push(expr[i])
                i++
            }

            parseThis = this.parse(parseThis)
            parsedExpr.push(new dot([obj], parseThis))
        } else if (next == "[") {
            i = i + 2
            var indexExpr = []

            while (expr[i] != "]") {
                indexExpr.push(expr[i])
                i++
            }

            var node = new getIndex([token], indexExpr)
            parsedExpr.push(node)
        } else if (token == "[") {
            i++
            var indexExpr = []

            while (expr[i] != "]") {
                indexExpr.push(expr[i])
                i++
            }

            parsedExpr[parsedExpr.length - 1] = new getIndex([parsedExpr[parsedExpr.length - 1]], indexExpr)
        } else if (isNaN(token)) {
            parsedExpr.push(token)
        } else {
            parsedExpr.push(Number(token))
        }
    }

    return parsedExpr
}

module.exports = {Parser}