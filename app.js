const { Lexer } = require("./lexer")
const { Parser } = require("./parser")
const { Runner } = require("./runner")
const fs = require("fs")
const readline = require("readline")
const interface = readline.createInterface(process.stdin, process.stdout) 

var l = new Lexer()
var p = new Parser()
var r = new Runner()


interface.question("[Enter name of file to run] ", function (fileName) {
    const src = fs.readFileSync(fileName).toString()

    const tokens = l.getTokens(src)
    const tree = p.parse(tokens)

    r.run(tree)

    interface.question("Press [Enter] to exit...", function () {
        process.exit();
    });
})

