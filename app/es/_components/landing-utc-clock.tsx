"use client";

import { useEffect, useState } from "react";

const initialUtcTime = "23:42:15";

function formatUtcTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function LandingUtcClock() {
  const [time, setTime] = useState(initialUtcTime);

  useEffect(() => {
    const updateTime = () => setTime(formatUtcTime(new Date()));

    updateTime();
    const intervalId = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return <>{`{ TIME: ${time} UTC }`}</>;
}
