package io.beampipe.server

import io.micronaut.runtime.Micronaut.*

fun main(args: Array<String>) {
	build()
	    .args(*args)
		.packages("io.beampipe")
		.start()
}

