package io.beampipe.server.api

import com.maxmind.geoip2.DatabaseReader
import com.maxmind.geoip2.model.CityResponse
import io.micronaut.context.annotation.Property
import io.micronaut.context.annotation.Requires
import java.io.File
import java.net.InetAddress
import java.util.*
import javax.inject.Singleton

interface  GeoTagger {
   fun tag(ipAddress: InetAddress): Optional<CityResponse>
}

@Singleton
@Requires(property = "geolite2.db")
class GeoLiteGeoTagger(@Property(name = "geolite2.db") val geoLite2DbPath: String): GeoTagger {
    var database = File(geoLite2DbPath)
    var reader = DatabaseReader.Builder(database).build()

    override fun tag(ipAddress: InetAddress) = reader.tryCity(ipAddress)
}

@Singleton
class NoGeoTagger: GeoTagger {
    override fun tag(ipAddress: InetAddress) = Optional.empty<CityResponse>()
}
