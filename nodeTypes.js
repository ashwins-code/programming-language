const functionCall = function (name) {
    this.name = name
    this.args = []
}

const varDec = function (name) {
    this.name = name
    this.val = []
}

const ifStmt = function (expr) {
    this.expr = expr
    this.body = []
}

const elifStmt = function (expr) {
    this.expr = expr
    this.body = []
}

const whileLoop = function (expr) {
    this.expr = expr
    this.body = []
}

const forLoop = function (iterVar, iterable) {
    this.iterVar = iterVar
    this.iterable = iterable
    this.body = []
}

const funcDec = function (funcName, args) {
    this.name = funcName
    this.args = args
    this.body = []
}

const returnStmt = function (expr) {
    this.expr = expr
}

const dot = function (obj, action) {
    this.obj = obj
    this.action = action
}

const getIndex = function (obj, index) {
    this.obj = obj
    this.index = index
}

const indexAssign = function (obj, index, val) {
    this.obj = obj
    this.index = index
    this.val = val
}

const classMethodDec = function (className, funcName, args) {
    this.className = className
    this.name = funcName
    this.args = args
}

const classDec = function (className) {
    this.name = className
}

module.exports = {
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
}