package io.beampipe.server.auth

import java.security.spec.KeySpec
import java.util.Base64
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

fun hashPassword(password: String, salt: ByteArray): String {
    val enc: Base64.Encoder = Base64.getEncoder()
    val spec: KeySpec = PBEKeySpec(password.toCharArray(), salt, 65536, 128)
    val f = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1")
    return enc.encodeToString(f.generateSecret(spec).encoded)
}

