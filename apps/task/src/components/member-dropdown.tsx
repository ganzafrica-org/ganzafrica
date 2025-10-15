"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { TeamMember } from '@/lib/types';

interface MemberDropdownProps {
  members: TeamMember[];
  onSelect: (memberId: string) => void;
  selectedMembers?: string[];
  trigger?: React.ReactNode;
  align?: 'left' | 'right';
}

/**
 * Reusable Member Dropdown Component
 * 
 * @example
 * <MemberDropdown
 *   members={availableMembers}
 *   onSelect={(memberId) => addAssignee(memberId)}
 *   selectedMembers={currentAssignees}
 *   trigger={<button>+ Add</button>}
 * />
 */
export function MemberDropdown({
  members,
  onSelect,
  selectedMembers = [],
  trigger,
  align = 'right',
}: MemberDropdownProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (memberId: string) => {
    onSelect(memberId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button
            className="flex items-center gap-1 text-sm font-medium transition px-2 py-1"
            style={{ 
              color: '#076297',
              backgroundColor: isOpen ? '#f0f8fc' : 'transparent',
              borderRadius: '7px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#054a73';
              if (!isOpen) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#076297';
              if (!isOpen) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Select a member
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 bg-white rounded-lg shadow-xl z-50 min-w-[280px] max-h-[400px] overflow-y-auto`}
          style={{ border: '1px solid #e5e7eb' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2">
            {members.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">No members available</p>
              </div>
            ) : (
              members.map((member) => {
                const isSelected = selectedMembers.includes(member.id);
                
                return (
                  <button
                    key={member.id}
                    onClick={() => handleSelect(member.id)}
                    className="w-full p-2 rounded-lg flex items-center gap-3 transition text-left"
                    style={{
                      backgroundColor: isSelected ? '#f0f8fc' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.initials}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                    {isSelected && (
                      <div style={{ color: '#076297' }} className="font-bold">✓</div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

