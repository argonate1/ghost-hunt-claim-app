import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface MapIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export const MapIcon: React.FC<MapIconProps> = ({ 
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
      {/* Location pin */}
      <Path 
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z" 
        fill={color}
      />
      
      {/* Pin center hole */}
      <Circle 
        cx="12" 
        cy="9" 
        r="3" 
        fill="white"
      />
      
      {/* Map sections - left */}
      <Path 
        d="M2 14L8 12L8 20L2 22V14Z" 
        fill={color}
        fillOpacity="0.8"
      />
      
      {/* Map sections - center */}
      <Path 
        d="M8 12L16 14L16 22L8 20V12Z" 
        fill={color}
        fillOpacity="0.9"
      />
      
      {/* Map sections - right */}
      <Path 
        d="M16 14L22 12V20L16 22V14Z" 
        fill={color}
        fillOpacity="0.7"
      />
    </Svg>
  );
}; 