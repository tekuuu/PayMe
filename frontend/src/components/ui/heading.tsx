import React from 'react';

interface HeadingProps {
  title: string;
  description: string;
}

export const Heading: React.FC<HeadingProps> = ({
  title,
  description
}) => {
  return (
    <div className='space-y-1'>
      <h2 className='text-sm font-bold uppercase tracking-[0.22em] text-foreground sm:text-base'>
        {title}
      </h2>
      {description ? <p className='text-sm text-muted-foreground'>{description}</p> : null}
    </div>
  );
};
