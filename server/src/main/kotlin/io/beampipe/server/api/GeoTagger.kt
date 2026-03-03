package io.beampipe.server.api

import com.maxmind.geoip2.DatabaseReader
import com.maxmind.geoip2.model.CityResponse
import io.micronaut.context.annotation.Property
import io.micronaut.context.annotation.Requires
import java.io.File
import java.net.InetAddress
import java.util.*
import jakarta.inject.Singleton

interface  GeoTagger {
   fun tag(ipAddress: InetAddress): Optional<CityResponse>
}

@Singleton
@Requires(property = "geoip.db")
class GeoIpGeoTagger(@Property(name = "geoip.db") val geoIpDbPath: String): GeoTagger {
    var database = File(geoIpDbPath).also {
        require(it.exists()) { "GEOIP_DB is set to '$geoIpDbPath' but the file does not exist." }
    }
    var reader = DatabaseReader.Builder(database).build()

    override fun tag(ipAddress: InetAddress) = reader.tryCity(ipAddress)
}

@Singleton
@Requires(missingProperty = "geoip.db")
class NoGeoTagger: GeoTagger {
    override fun tag(ipAddress: InetAddress) = Optional.empty<CityResponse>()
}
