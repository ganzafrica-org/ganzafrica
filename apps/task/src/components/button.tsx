"use client";
import React from 'react';
import { Plus, LucideIcon } from 'lucide-react';

/**
 * Reusable Button Component
 * 
 * @example
 * // Primary button with plus icon
 * <Button variant="primary" size="md" showPlusIcon>
 *   Add Task
 * </Button>
 * 
 * @example
 * // Secondary button with custom icon
 * <Button variant="secondary" icon={Save}>
 *   Save
 * </Button>
 * 
 * @example
 * // Outline button (for cancel actions)
 * <Button variant="outline">
 *   Cancel
 * </Button>
 */
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  showPlusIcon?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  showPlusIcon = false,
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps): React.JSX.Element {
  const [isHovered, setIsHovered] = React.useState(false);

  // Color variants
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isHovered ? '#054a73' : '#076297',
          color: '#ffffff',
          border: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: isHovered ? '#d99a0f' : '#F8B712',
          color: '#ffffff',
          border: 'none',
        };
      case 'outline':
        return {
          backgroundColor: isHovered ? '#f9fafb' : '#ffffff',
          color: '#374151',
          border: '1px solid #d1d5db',
        };
      default:
        return {};
    }
  };

  // Size variants
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const baseClasses = `
    ${getSizeClasses()}
    font-medium
    transition-all
    duration-200
    flex
    items-center
    justify-center
    gap-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
      style={{ ...getVariantStyles(), borderRadius: '7px' }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showPlusIcon && <Plus className="w-4 h-4" />}
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

// Icon-only button variant (for round buttons with just icons)
interface IconButtonProps {
  onClick?: () => void;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  title?: string;
}

export function IconButton({
  onClick,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  title,
}: IconButtonProps): React.JSX.Element {
  const [isHovered, setIsHovered] = React.useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isHovered ? '#054a73' : '#076297',
          color: '#ffffff',
        };
      case 'secondary':
        return {
          backgroundColor: isHovered ? '#d99a0f' : '#F8B712',
          color: '#ffffff',
        };
      case 'outline':
        return {
          backgroundColor: isHovered ? '#f9fafb' : '#ffffff',
          color: '#374151',
          border: '1px solid #d1d5db',
        };
      default:
        return {};
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6';
      case 'md':
        return 'w-8 h-8';
      case 'lg':
        return 'w-10 h-10';
      default:
        return 'w-8 h-8';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getSizeClasses()}
        rounded-full
        flex
        items-center
        justify-center
        transition-all
        duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={getVariantStyles()}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

