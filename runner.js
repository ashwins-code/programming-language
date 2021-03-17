
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
    return ["[", "]", "+", "=", "/", "*", "(", ")", "-", "==", "::", "not", "and", "or", ":", "{", "}", ",", "^", "<", ">", "<=", ">=", "%", "!=", "!", "%", "."].indexOf(op) > -1
}


Array.prototype.toString = function () {
    var out = ""

    for (var i = 0; i < this.length; i++) {
        var el = this[i]
        out += el

        if (i < this.length - 1) out += "  "
    }

    return `[${out}]`
}

const Class = function () {
    this.runner = new Runner()
    this.functions = Object.assign({}, this.runner.functions)
    this.variables = Object.assign({}, this.runner.variables)
    this.functions.parent = this
    this.runner.functions = this.functions
    this.runner.variables = this.variables
    this.runner.inClass = this
}

Class.prototype.run = function (tree) {
    var returnThis = this.runner.run(tree)
    return returnThis
}

const Runner = function () {
    this.functions = {
        "println": this.println,
        "range": this.range,
        "length": this.length,
        "list": this.list
    }

    this.variables = {}
    this.inClass = "";
}

Runner.prototype.run = function (tree) {
    var lastIfResult;
     
    for (var node of tree) {
        if (node instanceof functionCall) {
            this.functions[node.name](this, node.args)
        } else if (node instanceof returnStmt) {
            return this.evalExpr(node.expr)
        } else if (node instanceof varDec) {
            this.variables[node.name] = this.evalExpr(node.val)
        } else if (node instanceof ifStmt) {
            lastIfResult = false
            if (this.evalExpr(node.expr)) {
                lastIfResult = true
                var result = this.run(node.body)

                if (result != undefined) {
                    return result
                }
            }
        } else if (node instanceof elifStmt) {
            if (!lastIfResult) {
                if (this.evalExpr(node.expr)) {
                    lastIfResult = true
                    var result = this.run(node.body)

                    if (result != undefined) {
                        return result
                    }
                }
            }
        } else if (node instanceof whileLoop) {
            while (this.evalExpr(node.expr)) {
                this.run(node.body)
            }
        } else if (node instanceof forLoop) {
            for (var el of this.evalExpr(node.iterable)) {
                this.variables[node.iterVar] = el
                this.run(node.body)
            }
        } else if (node instanceof funcDec) {
            let { args, body } = node
            //console.log(this.functions)
            this.functions[node.name] = function (runner, funcArgs) {
                var newScope = new Runner()
                newScope.variables = Object.assign({}, runner.variables)
                newScope.functions = Object.assign({}, runner.functions)
                //console.log(args, funcArgs)
                for (var i = 0; i < args.length; i++) {
                    var arg = args[i][0]
                    newScope.variables[arg] = runner.evalExpr(funcArgs[i])
                }

                return newScope.run(body)
            }
        } else if (node instanceof indexAssign) {
            this.variables[node.obj][this.evalExpr(node.index)] = this.evalExpr(node.val)
        } else if (node instanceof classDec) {
            this.variables[node.name] = new Class()
        } else if (node instanceof classMethodDec) {
            let { args, body } = node
            var obj = this.evalExpr([node.className])
            obj.functions[node.name] = function (runner, funcArgs) {
                obj.variables = Object.assign(obj.variables, runner.variables)
                obj.functions = Object.assign(obj.functions, runner.variables)

                for (var i = 0; i < args.length; i++) {
                    var arg = args[i]
                    obj.variables[arg[0]] = runner.evalExpr(funcArgs[i])
                }
                return obj.run(body)
            }
           
        } else if (node instanceof dot) {
            if (node.obj[0] != "this") {
                this.evalExpr(node.obj).run(node.action)
            } else {
                this.inClass.run(node.action)
            }
        }
    }
}


Runner.prototype.infixToPostfix = function (expr) {
    var postfix = []
    var stack = []
    var rank = {
        "^": 3,
        "*": 2,
        "/": 2,
        "+": 1,
        "-": 1,
        "<": 0,
        "<=": 0,
        ">": 0,
        ">=": 0,
        "%": 0,
        "==": -1,
        "!=": -1,
        "and": -2,
        "or": -3
    }
    for (var token of expr) {
        if (!isOperator(token)) {
            postfix.push(token)
        } else if (token != ")") {
            while (rank[stack[stack.length - 1]] > rank[token]) {
                if (stack[stack.length - 1] == "(") break
                postfix.push(stack.pop())
            }
            stack.push(token)
        } else {
            while (stack[stack.length - 1] != "(") {
                postfix.push(stack.pop())
            }
            stack.pop()
        }
    }

    while (stack.length > 0) {
        postfix.push(stack.pop())
    }


    return postfix
}

Runner.prototype.doOperation = function (stack, token) {
    if (token == "+") {
        var rhs = stack.pop()
        var lhs = stack.pop()

        if (Array.isArray(lhs)) {
            if (Array.isArray(rhs)) {
                lhs.push([...rhs])
            } else {
                lhs.push(rhs)
            }
            stack.push(lhs)
            
        } else {
            stack.push(lhs + rhs)
        }   
    } else if (token == "-") {
        var rhs = stack.pop()
        var lhs = stack.pop()

        stack.push(lhs - rhs)
    } else if (token == "*") {
        var rhs = stack.pop()
        var lhs = stack.pop()

        stack.push(lhs * rhs)
    } else if (token == "/") {
        var rhs = stack.pop()
        var lhs = stack.pop()

        stack.push(lhs / rhs)
    } else if (token == "and") {
        var rhs = stack.pop()
        var lhs = stack.pop()

        stack.push(lhs && rhs)
    } else if (token == "or") {
        var rhs = stack.pop()
        var lhs = stack.pop()

        stack.push(lhs || rhs)
    } else if (token == "==") {
        var rhs = stack.pop()
        var lhs = stack.pop()

        stack.push(lhs === rhs)
    } else if (token == "!=") {
        var rhs = stack.pop()
        var lhs = stack.pop()

        stack.push(lhs !== rhs)
    } else if (token == "not") {
        var bool = stack.pop()

        stack.push(!bool)
    } else if (token == ">") {
        var rhs = stack.pop()
        var lhs = stack.pop()

        stack.push(lhs > rhs)
    } else if (token == "<") {
        var rhs = stack.pop()
        var lhs = stack.pop()

        stack.push(lhs < rhs)
    } else if (token == ">=") {
        var rhs = stack.pop()
        var lhs = stack.pop()

        stack.push(lhs >= rhs)
    } else if (token == "<=") {
        var rhs = stack.pop()
        var lhs = stack.pop()

        stack.push(lhs <= rhs)
    } else if (token == "%") {
        var rhs = stack.pop()
        var lhs = stack.pop()
        stack.push(lhs % rhs)
    }
}

Runner.prototype.process = function (token) {
    if (token[0] == '"') {
        if (token[0] == token[token.length - 1]) {
            return token.slice(1, token.length - 1)
        }
    } else if (!isNaN(token)) {
        return Number(token)
    } else if (token instanceof getIndex) {
        var _obj = this.evalExpr(token.obj)
        return _obj[this.evalExpr(token.index)]
    } else if (token instanceof functionCall) {
        var functionsList = Object.keys(this.functions)
        if (functionsList.indexOf(token.name) > -1) {
            return this.functions[token.name](this, token.args)
        } else {
            var instance = Object.assign({}, this.variables[token.name])
            instance.functions.init(this, token.args)
            return instance
        }
    } else if (token instanceof dot) {
        if (token.obj[0] != "this") {
            var instance = this.evalExpr(token.obj)
            return instance.runner.evalExpr(token.action)
        } else {
            return this.inClass.runner.evalExpr(token.action)
        }
    } else if (!isOperator(token)) {
        return this.variables[token]
    }

    return token
}

Runner.prototype.evalExpr = function (expr) {
    var postfix = this.infixToPostfix(expr)
    var stack = []

    for (var token of postfix) {
        if (!isOperator(token)) {
            stack.push(this.process(token))
        } else {
            this.doOperation(stack, token)
        }
    }

    if (stack.length == 0) return stack
    else if (stack.length == 1) return stack[0]

    return stack.reduce(function (acc, curr) {
        return acc + curr
    })
}

Runner.prototype.println = function (runner, args) {
    var out = ""

    for (var arg of args) {
        out += runner.evalExpr(arg) + " "
    }

    console.log(out)
}

Runner.prototype.range = function (runner, args) {
    var arr = []
    var start = runner.evalExpr(args[0])
    var end = runner.evalExpr(args[1])
    var step = runner.evalExpr(args[2])

    if (step > 0) {
        while (start <= end) {
            arr.push(start)
            start += step
        }
    } else {
        while (start >= end) {
            arr.push(start)
            start += step
        }
    }
    return arr
}

Runner.prototype.length = function (runner, args) {
    var arg = runner.evalExpr(args[0])
    return arg.length
}

Runner.prototype.list = function (runner, args) {
    var arr = []

    for (var el of args) {
        if (el.length > 0) arr.push(runner.evalExpr(el))
    }

    return arr
}

module.exports = {Runner}