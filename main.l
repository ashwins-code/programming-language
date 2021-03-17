class Person

func ::Person init(name, age) {
	this::age = age
	this::name = name
}

func ::Person getAge() {
	return this::age
}

func ::Person getAllMyAges() {
	return range(0, this::age, 1)
}

func ::Person myGreeting(to) {
	if to != "Sachin" { return "Hello " + to + "!" + "I am " + this::name + " and I am " + this::getAge() }

	return "Hello God"
}

virat = Person("Virat Kohli", 20)
another = Person("KL Rahul", 10)

println(virat::getAllMyAges())
println(virat::myGreeting("Dhoni"))


println(another::getAllMyAges())
println(another::myGreeting("Dhoni"))