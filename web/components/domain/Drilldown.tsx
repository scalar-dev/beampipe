import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Moment } from "moment-timezone";
import React from "react";

interface ReferrerDrilldown {
  isDirect: boolean;
  source: string | null;
  referrer: string | null;
}

interface PageDrilldown {
  path: string;
}

interface CountryDrilldown {
  isoCode: string | null;
}

interface TimeDrilldown {
  start: Moment;
  end: Moment;
}

interface DeviceDrilldown {
  device: string | null;
}

interface DeviceNameDrilldown {
  deviceName: string | null;
}

interface DeviceClassDrilldown {
  deviceClass: string | null;
}

interface OperatingSystemDrilldown {
  operatingSystem: string | null;
}

interface UserAgentDrilldown {
  userAgent: string | null;
}

export interface DrilldownState {
  referrer?: ReferrerDrilldown;
  page?: PageDrilldown;
  country?: CountryDrilldown;
  time?: TimeDrilldown;
  device?: DeviceDrilldown;
  deviceName?: DeviceNameDrilldown;
  deviceClass?: DeviceClassDrilldown;
  operatingSystem?: OperatingSystemDrilldown;
  userAgent?: UserAgentDrilldown;
}

export const sourceDrilldownText = (referrer: ReferrerDrilldown) => {
  if (referrer.isDirect) {
    return "source: Direct/None";
  } else if (referrer.source) {
    return `source: ${referrer.source}`;
  } else {
    return `referrer: ${referrer.referrer}`;
  }
};

export const DrilldownPill: React.FunctionComponent<{
  onClick: () => void;
}> = ({ onClick, children }) => (
  <button
    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-1 px-2 rounded-full mr-2 focus:outline-none"
    onClick={onClick}
  >
    {children}
    <FontAwesomeIcon className="fill-current w-4 h-4 ml-2" icon={faTimes} />
  </button>
);

export const DrilldownPills = ({
  drilldown,
  setDrilldown,
}: {
  drilldown: DrilldownState;
  setDrilldown: React.Dispatch<React.SetStateAction<DrilldownState>>;
}) => {
  const unsetDrilldown = (key: keyof DrilldownState) =>
    setDrilldown((prevState) => ({
      ...prevState,
      [key]: undefined,
    }));

  return (
    <>
      {drilldown.referrer && (
        <DrilldownPill
          key="referrer"
          onClick={() => unsetDrilldown("referrer")}
        >
          {sourceDrilldownText(drilldown.referrer)}
        </DrilldownPill>
      )}

      {drilldown.page && (
        <DrilldownPill onClick={() => unsetDrilldown("page")}>
          page: {drilldown.page.path}
        </DrilldownPill>
      )}

      {drilldown.country && (
        <DrilldownPill onClick={() => unsetDrilldown("country")}>
          country: {drilldown.country.isoCode || "none"}
        </DrilldownPill>
      )}

      {drilldown.time && (
        <DrilldownPill onClick={() => unsetDrilldown("time")}>
          time: {drilldown.time.start.format("YYYY-MM-DD HH:mm")} -{" "}
          {drilldown.time.end.format("YYYY-MM-DD HH:mm")}
        </DrilldownPill>
      )}

      {drilldown.device && (
        <DrilldownPill onClick={() => unsetDrilldown("device")}>
          screen size: {drilldown.device.device}
        </DrilldownPill>
      )}

      {drilldown.deviceName && (
        <DrilldownPill onClick={() => unsetDrilldown("deviceName")}>
          device name: {drilldown.deviceName.deviceName}
        </DrilldownPill>
      )}

      {drilldown.deviceClass && (
        <DrilldownPill onClick={() => unsetDrilldown("deviceClass")}>
          device class: {drilldown.deviceClass.deviceClass}
        </DrilldownPill>
      )}

      {drilldown.operatingSystem && (
        <DrilldownPill onClick={() => unsetDrilldown("operatingSystem")}>
          os: {drilldown.operatingSystem.operatingSystem}
        </DrilldownPill>
      )}

      {drilldown.userAgent && (
        <DrilldownPill onClick={() => unsetDrilldown("userAgent")}>
          user agent: {drilldown.userAgent.userAgent}
        </DrilldownPill>
      )}
    </>
  );
};
