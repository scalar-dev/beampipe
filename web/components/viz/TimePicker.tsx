import { useState, useEffect } from "react";
import { Menu, MenuSection, MenuItem, MenuDivider } from "../Menu";
import { Tick } from "../marketing/Tick";
import dynamic from "next/dynamic";
import moment from "moment";

type TimePeriodType = "hour" | "day" | "week" | "month" | "custom";

const timePeriods: TimePeriodType[] = ["hour", "day", "week", "month"];

const displayTimePeriod = (timePeriod: TimePeriod) => {
  if (timePeriod.type === "hour") return "Last hour";
  else if (timePeriod.type === "day") return "Last 24 hours";
  else if (timePeriod.type === "week") return "Last 7 days";
  else if (timePeriod.type === "month") return "Last 28 days";
  else
    return `Custom: ${moment(timePeriod.startTime).format("YYYY-MM-DD")} -> ${moment(
      timePeriod.endTime
    ).format("YYYY-MM-DD")}`;
};

export interface TimePeriod {
  type: TimePeriodType;
  startTime?: moment.Moment;
  endTime?: moment.Moment;
}

interface TimePickerProps {
  timePeriod: TimePeriod;
  setTimePeriod: (timePeriod: TimePeriod) => void;
}

const DateRangePicker = dynamic(() => import("./DateRangePicker"), {
  ssr: false,
});

export const TimePicker = ({ timePeriod, setTimePeriod }: TimePickerProps) => {
  const [visible, setVisible] = useState(false);
  const [dateRangePickerVisible, setDateRangePickerVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setDateRangePickerVisible(false);
    }
  }, [visible]);

  return (
    <Menu
      value={displayTimePeriod(timePeriod)}
      visible={visible}
      setVisible={setVisible}
      menuClassNames="right-0"
      classNames="w-40 md:w-auto"
    >
      <MenuSection>
        {timePeriods.map((tp) => (
          <MenuItem
            key={tp}
            onClick={() => {
              setTimePeriod({ type: tp });
              setVisible(false);
            }}
          >
            <div className="w-8">{timePeriod.type === tp && <Tick />}</div>
            {displayTimePeriod({ type: tp })}
          </MenuItem>
        ))}
      </MenuSection>
      <MenuDivider />
      <MenuSection>
        <MenuItem
          onClick={() => {
            setDateRangePickerVisible(true);
          }}
        >
          {dateRangePickerVisible ? (
            <DateRangePicker
              startTime={timePeriod.startTime}
              endTime={timePeriod.endTime}
              onSelect={(start, end) => {
                setTimePeriod({
                  type: "custom",
                  startTime: moment(start),
                  endTime: moment(end),
                });
                setVisible(false);
              }}
            />
          ) : (
            <>
              <div className="w-8">
                {timePeriod.type === "custom" && <Tick />}
              </div>
              {timePeriod.type === "custom" ? (
                displayTimePeriod(timePeriod)
              ) : (
                <>Custom</>
              )}
            </>
          )}
        </MenuItem>
      </MenuSection>
    </Menu>
  );
};
