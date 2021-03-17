func fizzbuzz(start, end) {
	for num range(start, end, 1) {
		out = ""
		if num % 3 == 0 {
			out += "fizz"
		}
		if num % 5 == 0 {
			out += "buzz"
		}
		
		println(num, out)
	}
}

fizzbuzz(0, 100)
