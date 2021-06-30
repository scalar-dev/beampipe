import { useEffect, useRef } from "react";
import Litepicker from "litepicker";

export default ({
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
        startDate: startTime,
        endDate: endTime,
        onSelect,
      });

      return () => {
        if (picker.current) {
          picker.current.destroy();
        }
      };
    }
  }, [ref]);

  return <div ref={ref}></div>;
};
