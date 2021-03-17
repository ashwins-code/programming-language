# DOCS

## How to run programs

You would need Node.js to run this project.

Run "app.js" in the command line and enter the filename you want to run.

## Ouput

```lex

println (<expression>)
Can take any amount of arguments
```

```lex
println("hello world") => hello world
println("a","b","c") => a b c
```
## Variable Declaration

```lex
variable = "hello"

println (variable) => hello

num = 10

println (num + num) => 20
```

## Lists

```lex
l = list(1, 2)

println (l) => [1 2]

l = l + 5

println (l) => [1 2 5]

l = l + l

println (l) => [1 2 5 [1 2 5]]
```
## For loops

```lex
for <variable name> <iterable>
```

```lex
arr = [1,2,3]

for num arr {
  println(num)
}

=> 1
=> 2
=> 3
```

## While Loops

```lex
while <expression>
```

```lex
n = 0
while n < 10 {
  println(n)
  n = n + 1
}
=> 0
=> 1
=> 2
=> 3
=> 4
=> 5
=> 6
=> 7
=> 8
=> 9
```

## Declaring Functions

```lex
func <func name> (<arguments>)
```

```lex
func add(a, b) {
  return a + b
}

println(add(100, 200)) => 300
```

## Built-in functions

```lex
range(start, end, step)
```

Returns array that goes from "start" to "end" increasing by "step"
```lex
range(0, 5, 1) => [0 1 2 3 4 5]
range(0, 5, 2) => [0 2 4]
range(5, 0, -1) => [5 4 3 2 1 0]
```

```lex
length(<expression>)
```

Returns length of given expression

```lex
length("abc") => 3
```
