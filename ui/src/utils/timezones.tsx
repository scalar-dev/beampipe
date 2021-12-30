import * as moment from "moment-timezone";

export const getTimezones = () => {
  return moment.tz
    .names()
    .filter(
      (name) =>
        !(name.indexOf("/") < 0 && name !== "UTC") && !name.startsWith("Etc/")
    );
};

export const renderTimeZone = (name: string) =>
  `${name} (${moment.tz(name).format("Z")})`;
