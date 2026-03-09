package io.beampipe.server

import io.micronaut.runtime.Micronaut
import io.netty.buffer.PooledByteBufAllocator
import org.slf4j.LoggerFactory

private val LOG = LoggerFactory.getLogger("io.beampipe.server.Application")

fun main(args: Array<String>) {
    val alloc = PooledByteBufAllocator.DEFAULT
    LOG.info("Netty direct arenas: {}, heap arenas: {}, chunk size: {}MB, available processors: {}",
        alloc.metric().numDirectArenas(),
        alloc.metric().numHeapArenas(),
        alloc.metric().chunkSize() / (1024 * 1024),
        Runtime.getRuntime().availableProcessors()
    )

    Micronaut.run(*args)
}
