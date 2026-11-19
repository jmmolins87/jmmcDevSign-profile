"use client";

import { useEffect, useState } from "react";

const initialLocalTime = "23:42:15";

function formatLocalTime(date: Date) {
  const locale = typeof navigator !== "undefined" && navigator.language ? navigator.language : "es-ES";

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function LandingUtcClock() {
  const [time, setTime] = useState(initialLocalTime);

  useEffect(() => {
    const updateTime = () => setTime(formatLocalTime(new Date()));

    updateTime();
    const intervalId = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return <>{`{ TIME: ${time} LOCAL }`}</>;
}
