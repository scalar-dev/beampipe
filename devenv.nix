{ pkgs, ... }:

{
  # JDK 25 matches the server toolchain and the prod runtime image.
  # Gradle comes from ./gradlew, so it isn't installed here.
  languages.java = {
    enable = true;
    jdk.package = pkgs.jdk25;
    gradle.enable = false;
  };

  # Bun builds the UI, web and docs workspaces.
  languages.javascript = {
    enable = true;
    bun.enable = true;
  };
}
