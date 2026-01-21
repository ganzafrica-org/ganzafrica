"use client";
import React from 'react';
import { X, Users } from 'lucide-react';
import { TeamMember } from '@/lib/types';
import { UserAvatar } from './user-avatar';

interface MemberSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (memberId: string) => void;
  members: TeamMember[];
  selectedMembers?: string[];
  title?: string;
  description?: string;
  multiSelect?: boolean;
  onMultiSelectConfirm?: (memberIds: string[]) => void;
}

/**
 * Reusable Member Selector Modal Component
 * 
 * @example
 * // Single select mode
 * <MemberSelectorModal
 *   open={showSelector}
 *   onOpenChange={setShowSelector}
 *   onSelect={(memberId) => addAssignee(memberId)}
 *   members={teamMembers}
 *   title="Select Team Member"
 * />
 * 
 * @example
 * // Multi-select mode
 * <MemberSelectorModal
 *   open={showSelector}
 *   onOpenChange={setShowSelector}
 *   members={teamMembers}
 *   selectedMembers={currentAssignees}
 *   multiSelect
 *   onMultiSelectConfirm={(memberIds) => setAssignees(memberIds)}
 *   title="Select Assignees"
 * />
 */
export function MemberSelectorModal({
  open,
  onOpenChange,
  onSelect,
  members,
  selectedMembers = [],
  title = 'Select Team Member',
  description,
  multiSelect = false,
  onMultiSelectConfirm,
}: MemberSelectorModalProps): React.JSX.Element | null {
  const [tempSelected, setTempSelected] = React.useState<string[]>(selectedMembers);

  React.useEffect(() => {
    if (open) {
      setTempSelected(selectedMembers);
    }
  }, [open, selectedMembers]);

  if (!open) return null;

  const handleMemberClick = (memberId: string) => {
    if (multiSelect) {
      // Toggle selection in multi-select mode
      setTempSelected(prev => 
        prev.includes(memberId) 
          ? prev.filter(id => id !== memberId)
          : [...prev, memberId]
      );
    } else {
      // Single select mode - immediately select and close
      onSelect(memberId);
      onOpenChange(false);
    }
  };

  const handleConfirm = () => {
    if (multiSelect && onMultiSelectConfirm) {
      onMultiSelectConfirm(tempSelected);
      onOpenChange(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
            {!description && members.length > 0 && (
              <p className="text-sm text-gray-500">{members.length} members available</p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No team members available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => {
              const isSelected = multiSelect 
                ? tempSelected.includes(member.id)
                : selectedMembers.includes(member.id);

              return (
                <button
                  key={member.id}
                  onClick={() => handleMemberClick(member.id)}
                  className="w-full p-3 rounded-lg flex items-center gap-3 transition"
                  style={{
                    backgroundColor: isSelected ? '#f0f8fc' : '#f9fafb',
                    border: isSelected ? '2px solid #076297' : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden" style={{ backgroundColor: member.color }}>
                    <UserAvatar 
                      userId={parseInt(member.id)} 
                      size="lg"
                      className="w-10 h-10"
                      fallbackColor={member.color}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.email}</div>
                  </div>
                  {isSelected && (
                    <div className="text-blue-500 font-bold">✓</div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {multiSelect && (
          <div className="flex gap-3 mt-4 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={handleConfirm}
              disabled={tempSelected.length === 0}
              className="flex-1 px-4 py-2 font-medium text-sm transition"
              style={{ 
                backgroundColor: tempSelected.length > 0 ? '#076297' : '#e5e7eb', 
                color: tempSelected.length > 0 ? '#ffffff' : '#9ca3af',
                borderRadius: '7px',
                cursor: tempSelected.length > 0 ? 'pointer' : 'not-allowed'
              }}
              onMouseEnter={(e) => {
                if (tempSelected.length > 0) {
                  e.currentTarget.style.backgroundColor = '#054a73';
                }
              }}
              onMouseLeave={(e) => {
                if (tempSelected.length > 0) {
                  e.currentTarget.style.backgroundColor = '#076297';
                }
              }}
            >
              Confirm ({tempSelected.length})
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2 font-medium text-sm transition"
              style={{ backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '7px' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

