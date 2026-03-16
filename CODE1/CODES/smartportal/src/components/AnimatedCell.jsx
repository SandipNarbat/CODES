import { useEffect, useRef, useState } from "react";

export default function AnimatedCell({ value }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return <td className={highlight ? "highlight" : ""}>{String(value)}</td>;
}
