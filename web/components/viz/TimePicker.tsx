import { useState } from "react";
import { Menu, MenuSection, MenuItem } from "../Menu";
import { Tick } from "../marketing/Tick";

const timePeriods = ["hour", "day", "week", "month"];

const displayTimePeriod = (timePeriod: string) => {
  if (timePeriod == "hour") return "Last hour";
  else if (timePeriod == "day") return "Last 24 hours";
  else if (timePeriod == "week") return "Last 7 days";
  else if (timePeriod == "month") return "Last 28 days";
};

export const TimePicker = ({
  timePeriod,
  setTimePeriod,
}: {
  timePeriod: string;
  setTimePeriod: (timePeriod: string) => void;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <Menu
      value={displayTimePeriod(timePeriod)}
      visible={visible}
      setVisible={setVisible}
      align="right"
      classNames="w-40 md:w-auto"
    >
      {/* <MenuSection>
        <MenuItem>
          <div className="w-8"></div>
          Real time
        </MenuItem>
        <MenuDivider />
      </MenuSection> */}
      <MenuSection>
        {timePeriods.map((tp) => (
          <MenuItem
            key={tp}
            onClick={() => {
              setTimePeriod(tp);
              setVisible(false);
            }}
          >
            <div className="w-8">{timePeriod === tp && <Tick />}</div>
            {displayTimePeriod(tp)}
          </MenuItem>
        ))}
      </MenuSection>
    </Menu>
  );
};