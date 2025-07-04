import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface ClaimsIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export const ClaimsIcon: React.FC<ClaimsIconProps> = ({ 
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
      {/* Trophy base */}
      <Path 
        d="M6 20H18V22H6V20Z" 
        fill={color}
      />
      
      {/* Trophy stem */}
      <Path 
        d="M10 16H14V20H10V16Z" 
        fill={color}
      />
      
      {/* Trophy cup body */}
      <Path 
        d="M8 2V12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12V2H8Z" 
        fill={color}
      />
      
      {/* Trophy handles - left */}
      <Path 
        d="M6 6V10C6 11.1 6.9 12 8 12V6H6Z" 
        fill={color}
        fillOpacity="0.8"
      />
      
      {/* Trophy handles - right */}
      <Path 
        d="M18 6V10C18 11.1 17.1 12 16 12V6H18Z" 
        fill={color}
        fillOpacity="0.8"
      />
      
      {/* Trophy center decoration */}
      <Circle 
        cx="12" 
        cy="8" 
        r="2" 
        fill="white"
        fillOpacity="0.3"
      />
    </Svg>
  );
}; 