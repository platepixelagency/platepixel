import React, { useEffect, useState } from 'react';

interface CountUpProps {
  value: string;
  className?: string;
}

export const CountUpNumber: React.FC<CountUpProps> = ({ value, className = '' }) => {
  const [displayValue, setDisplayValue] = useState<string>('0');

  useEffect(() => {
    // Extract numbers and non-numeric suffixes (e.g. "100+" -> 100, "+"; "99.9%" -> 99.9, "%")
    const numericMatch = value.match(/[\d.]+/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const targetNumber = parseFloat(numericMatch[0]);
    const isDecimal = numericMatch[0].includes('.');
    const decimalPlaces = isDecimal ? numericMatch[0].split('.')[1].length : 0;
    
    const prefix = value.substring(0, value.indexOf(numericMatch[0]));
    const suffix = value.substring(value.indexOf(numericMatch[0]) + numericMatch[0].length);

    const start = 0;
    const duration = 1600; // 1.6s smooth count-up animation
    const startTime = performance.now();

    const animateCount = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Ease out exponential curve
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentNumber = start + (targetNumber - start) * easedProgress;

      const formattedNumber = isDecimal 
        ? currentNumber.toFixed(decimalPlaces) 
        : Math.floor(currentNumber).toString();

      setDisplayValue(`${prefix}${formattedNumber}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [value]);

  return <span className={className}>{displayValue}</span>;
};
