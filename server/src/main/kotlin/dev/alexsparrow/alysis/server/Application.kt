package dev.alexsparrow.alysis.server

import io.micronaut.runtime.Micronaut.*

fun main(args: Array<String>) {
	build()
	    .args(*args)
		.packages("server")
		.start()
}

