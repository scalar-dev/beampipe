import { useEffect, useRef } from "react";
import Litepicker from "litepicker";

export const DateRangePicker = ({
  startTime,
  endTime,
  onSelect,
}: {
  startTime?: moment.Moment;
  endTime?: moment.Moment;
  onSelect: (start: Date, end: Date) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const picker = useRef<any>(null);

  useEffect(() => {
    if (ref.current) {
      picker.current = new Litepicker({
        element: ref.current,
        inlineMode: true,
        singleMode: false,
        startDate: startTime?.toDate(),
        endDate: endTime?.toDate(),
        setup: (picker) => {
          picker.on("selected", onSelect);
        },
      });

      return () => {
        if (picker.current) {
          picker.current.destroy();
        }
      };
    }
  }, [ref, startTime, endTime, onSelect]);

  return <div ref={ref}></div>;
};
