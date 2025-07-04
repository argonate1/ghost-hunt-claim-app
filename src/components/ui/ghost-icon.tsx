import * as React from 'react';

export const GhostIcon = (props: React.SVGProps<SVGSVGElement>) => {
  const uniqueId = React.useId();
  
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path 
        d="M12 3C8.13 3 5 6.13 5 10V19C5 19.55 5.45 20 6 20C6.55 20 7 19.55 7 19C7 18.45 7.45 18 8 18C8.55 18 9 18.45 9 19C9 19.55 9.45 20 10 20C10.55 20 11 19.55 11 19C11 18.45 11.45 18 12 18C12.55 18 13 18.45 13 19C13 19.55 13.45 20 14 20C14.55 20 15 19.55 15 19C15 18.45 15.45 18 16 18C16.55 18 17 18.45 17 19C17 19.55 17.45 20 18 20C18.55 20 19 19.55 19 19V10C19 6.13 15.87 3 12 3Z" 
        fill="currentColor"
      />
      <circle cx="9.5" cy="10.5" r="1.5" fill="white" />
      <circle cx="14.5" cy="10.5" r="1.5" fill="white" />
    </svg>
  );
}; 