import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface GhostIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

export const GhostIcon: React.FC<GhostIconProps> = ({ 
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
      <Path 
        d="M12 3C8.13 3 5 6.13 5 10V19C5 19.55 5.45 20 6 20C6.55 20 7 19.55 7 19C7 18.45 7.45 18 8 18C8.55 18 9 18.45 9 19C9 19.55 9.45 20 10 20C10.55 20 11 19.55 11 19C11 18.45 11.45 18 12 18C12.55 18 13 18.45 13 19C13 19.55 13.45 20 14 20C14.55 20 15 19.55 15 19C15 18.45 15.45 18 16 18C16.55 18 17 18.45 17 19C17 19.55 17.45 20 18 20C18.55 20 19 19.55 19 19V10C19 6.13 15.87 3 12 3Z" 
        fill={color}
      />
      <Circle cx="9.5" cy="10.5" r="1.5" fill="#000" />
      <Circle cx="14.5" cy="10.5" r="1.5" fill="#000" />
    </Svg>
  );
}; 