"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  color?: 'primary-green' | 'yellow-400';
}

const CategoryCard = ({ 
  title, 
  description, 
  icon, 
  className,
  color = 'yellow-400'
}: CategoryCardProps) => {

  const colorClasses: Record<'primary-green' | 'yellow-400', string> = {
    'primary-green': "border-l-4 border-primary-green bg-white",
    'yellow-400': "border-l-4 border-yellow-400 bg-white"
  };

  const iconColorClasses: Record<'primary-green' | 'yellow-400', string> = {
    'primary-green': "bg-primary-green text-white",
    'yellow-400': "bg-yellow-400 text-white"
  };

  return (
    <div className={cn(
      "rounded-md shadow-sm p-6 transition-all duration-300 hover:shadow-md animate-fade-in",
      colorClasses[color],
      className
    )}>
      <div className="flex items-start">
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mr-4 mt-1",
            iconColorClasses[color]
          )}>
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
