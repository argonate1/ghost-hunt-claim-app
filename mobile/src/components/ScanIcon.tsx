import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface ScanIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export const ScanIcon: React.FC<ScanIconProps> = ({ 
  size = 24, 
  color = '#FFFFFF',
  focused = false 
}) => {
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      {/* Horizontal lines */}
      <Path 
        d="M2 6H8" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <Path 
        d="M2 12H10" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <Path 
        d="M2 18H8" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      
      {/* Dollar sign circle */}
      <Circle 
        cx="17" 
        cy="12" 
        r="6" 
        stroke={color} 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* Dollar sign */}
      <Path 
        d="M17 8V16M14.5 10.5C14.5 9.67 15.17 9 16 9H18C18.83 9 19.5 9.67 19.5 10.5S18.83 12 18 12H16C15.17 12 14.5 12.67 14.5 13.5S15.17 15 16 15H18C18.83 15 19.5 14.33 19.5 13.5" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
}; 