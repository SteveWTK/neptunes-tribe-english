"use client";

import { useState, useEffect } from "react";

/**
 * AnimatedCounter - Animates a number counting up from 0 to target value
 *
 * @param {Object} props
 * @param {number} props.value - Target value to count to
 * @param {number} props.duration - Animation duration in milliseconds (default: 1000)
 * @param {string} props.prefix - Text to display before the number
 * @param {string} props.suffix - Text to display after the number
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.animationDelay - Delay before animation starts in ms (default: 0)
 * @param {boolean} props.formatNumber - Whether to format with locale (default: true)
 * @param {number} props.decimals - Number of decimal places (default: 0)
 */
export default function AnimatedCounter({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  className = "",
  animationDelay = 0,
  formatNumber = true,
  decimals = 0,
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const end = parseFloat(value);
      if (end === 0 || isNaN(end)) {
        setCount(0);
        return;
      }

      const increment = end / (duration / 50);
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(counter);
        } else {
          setCount(start);
        }
      }, 50);

      return () => clearInterval(counter);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [value, duration, animationDelay]);

  const displayValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.round(count);

  const formattedValue = formatNumber
    ? Number(displayValue).toLocaleString()
    : displayValue;

  return (
    <span className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
