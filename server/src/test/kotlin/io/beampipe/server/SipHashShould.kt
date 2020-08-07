package io.beampipe.server

import io.whitfin.siphash.SipHasher
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class SipHashShould {
    @Test
    fun produce_sensible_values() {
        var key: ByteArray = "0123456789ABCDEF".toByteArray()

        val container = SipHasher.container(key)
        val foo = container.hash(("x".repeat(1024) + "a").toByteArray())
        val bar = container.hash(("x".repeat(1024) + "b").toByteArray())

        Assertions.assertNotEquals(foo, bar)

    }
}