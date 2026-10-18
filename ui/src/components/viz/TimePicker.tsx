import { useState } from "react";
import moment from "moment";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TimePeriodType = "hour" | "day" | "week" | "month" | "custom";

const timePeriods: TimePeriodType[] = ["hour", "day", "week", "month"];

const displayTimePeriod = (timePeriod: TimePeriod) => {
  if (timePeriod.type === "hour") return "Last hour";
  else if (timePeriod.type === "day") return "Last 24 hours";
  else if (timePeriod.type === "week") return "Last 7 days";
  else if (timePeriod.type === "month") return "Last 28 days";
  else
    return `${moment(timePeriod.startTime).format("D MMM YYYY")} – ${moment(
      timePeriod.endTime
    ).format("D MMM YYYY")}`;
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

const CustomRangeDialog = ({
  open,
  onOpenChange,
  timePeriod,
  setTimePeriod,
}: TimePickerProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [range, setRange] = useState<DateRange | undefined>(
    timePeriod.type === "custom"
      ? { from: timePeriod.startTime?.toDate(), to: timePeriod.endTime?.toDate() }
      : undefined
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-fit">
        <DialogHeader>
          <DialogTitle>Custom date range</DialogTitle>
        </DialogHeader>
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={range}
          onSelect={setRange}
          defaultMonth={range?.from ?? moment().subtract(1, "month").toDate()}
          disabled={{ after: new Date() }}
          className="mx-auto"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!range?.from || !range?.to}
            onClick={() => {
              setTimePeriod({
                type: "custom",
                startTime: moment(range!.from).startOf("day"),
                endTime: moment(range!.to).endOf("day"),
              });
              onOpenChange(false);
            }}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const TimePicker = ({ timePeriod, setTimePeriod }: TimePickerProps) => {
  const [customOpen, setCustomOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <CalendarIcon className="text-muted-foreground" />
            {displayTimePeriod(timePeriod)}
            <ChevronDownIcon className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-48">
          <DropdownMenuRadioGroup
            value={timePeriod.type}
            onValueChange={(type) =>
              setTimePeriod({ type: type as TimePeriodType })
            }
          >
            {timePeriods.map((tp) => (
              <DropdownMenuRadioItem key={tp} value={tp}>
                {displayTimePeriod({ type: tp })}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setCustomOpen(true)}>
            Custom range…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {customOpen && (
        <CustomRangeDialog
          open={customOpen}
          onOpenChange={setCustomOpen}
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
        />
      )}
    </>
  );
};
