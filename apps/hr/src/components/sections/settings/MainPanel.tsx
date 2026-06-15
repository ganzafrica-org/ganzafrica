'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SectionCard } from './SectionCard'
import { PillSelector } from './PillSelector'
import { ToggleRow } from './ToggleRow'

const SECTIONS = {
  roles: {
    title: 'Roles & Permissions',
    subtitle:
      'Define access roles and control what each role can view, edit, or manage across the platform.',
    cards: [
      {
        title: 'ACCESS LEVEL',
        type: 'pills',
        options: ['Admin', 'Manager', 'Employee', 'View Only'],
      },
      {
        title: 'PERMISSION SCOPE',
        type: 'pills',
        options: ['Global', 'Department', 'Individual'],
      },
      {
        title: 'VISIBILITY',
        type: 'toggles',
        toggles: [
          {
            label: 'Show org chart to all employees',
            description: 'Tint restricted sections to signal access',
          },
          {
            label: 'Show payroll to managers only',
            description: 'Managers see direct-report payroll data only',
          },
        ],
      },
    ],
  },
  entities: {
    title: 'Entities',
    subtitle:
      'Manage legal entities, branches, and organizational structure for compliance and reporting.',
    cards: [
      {
        title: 'ENTITY TYPE',
        type: 'pills',
        options: ['Subsidiary', 'Branch', 'Holding', 'Sole Trader'],
      },
      {
        title: 'JURISDICTION',
        type: 'pills',
        options: ['Single Country', 'Multi-Country', 'Federal'],
      },
      {
        title: 'COMPLIANCE',
        type: 'toggles',
        toggles: [
          {
            label: 'Auto-generate statutory reports',
            description: 'Includes PAYE, NI, and pension filings',
          },
          {
            label: 'Flag mismatched entity registrations',
            description: 'Surfaces conflicts in the audit log',
          },
        ],
      },
    ],
  },
  groups: {
    title: 'Groups',
    subtitle: 'Configure team groupings and reporting hierarchies across the organization.',
    cards: [
      {
        title: 'GROUP TYPE',
        type: 'pills',
        options: ['Department', 'Division', 'Project', 'Custom'],
      },
      {
        title: 'HIERARCHY DEPTH',
        type: 'pills',
        options: ['Flat', '2 Levels', '3 Levels', 'Unlimited'],
      },
      {
        title: 'DISPLAY',
        type: 'toggles',
        toggles: [
          {
            label: 'Show group headcount in sidebar',
            description: 'Live count next to each group name',
          },
          {
            label: 'Allow self-service group requests',
            description: 'Employees can request to join a group',
          },
        ],
      },
    ],
  },
  policies: {
    title: 'Policies',
    subtitle: 'Define and enforce company policies for attendance, leave, and compliance.',
    cards: [
      {
        title: 'POLICY CATEGORY',
        type: 'pills',
        options: ['Attendance', 'Leave', 'Overtime', 'Remote'],
      },
      {
        title: 'ENFORCEMENT',
        type: 'pills',
        options: ['Advisory', 'Soft Block', 'Hard Block'],
      },
      {
        title: 'NOTIFICATIONS',
        type: 'toggles',
        toggles: [
          {
            label: 'Notify managers on policy breach',
            description: 'Real-time alert to direct line manager',
          },
          {
            label: 'Escalate repeat violations',
            description: 'Auto-escalate after 3 breaches in 90 days',
          },
        ],
      },
    ],
  },
  timeoff: {
    title: 'Time Off',
    subtitle: 'Configure leave types, accrual rules, and balance management policies.',
    cards: [
      {
        title: 'LEAVE TYPES',
        type: 'pills',
        options: ['Annual', 'Sick', 'Parental', 'Unpaid', 'Public Holiday'],
      },
      {
        title: 'ACCRUAL FREQUENCY',
        type: 'pills',
        options: ['Daily', 'Weekly', 'Monthly', 'On Anniversary'],
      },
      {
        title: 'BALANCE RULES',
        type: 'toggles',
        toggles: [
          {
            label: 'Allow negative leave balance',
            description: 'Employees can go into deficit up to the cap',
          },
          {
            label: 'Roll over unused days',
            description: 'Carry forward unused balance at year-end',
          },
        ],
      },
    ],
  },
  onboarding: {
    title: 'Onboarding',
    subtitle: 'Manage new hire checklists, document collection, and automation workflows.',
    cards: [
      {
        title: 'CHECKLIST TRIGGER',
        type: 'pills',
        options: ['On Offer', 'On Contract', 'On Start Date'],
      },
      {
        title: 'DOCUMENT COLLECTION',
        type: 'pills',
        options: ['Manual', 'Auto-request', 'Integrated (e-sign)'],
      },
      {
        title: 'AUTOMATION',
        type: 'toggles',
        toggles: [
          {
            label: 'Auto-assign buddy on Day 1',
            description: 'Pairs new hire with a nominated peer buddy',
          },
          {
            label: 'Send welcome email sequence',
            description: '3-part drip over the first two weeks',
          },
        ],
      },
    ],
  },
}

interface MainPanelProps {
  activeSection: string
}

export function MainPanel({ activeSection }: MainPanelProps) {
  const section =
    SECTIONS[activeSection as keyof typeof SECTIONS] || SECTIONS.roles
  const [pillStates, setPillStates] = useState<Record<string, string>>({
    'ACCESS LEVEL': 'Admin',
    'PERMISSION SCOPE': 'Global',
    'ENTITY TYPE': 'Subsidiary',
    'JURISDICTION': 'Single Country',
    'GROUP TYPE': 'Department',
    'HIERARCHY DEPTH': 'Flat',
    'POLICY CATEGORY': 'Attendance',
    'ENFORCEMENT': 'Advisory',
    'LEAVE TYPES': 'Annual',
    'ACCRUAL FREQUENCY': 'Daily',
    'CHECKLIST TRIGGER': 'On Offer',
    'DOCUMENT COLLECTION': 'Manual',
  })

  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    'Show org chart to all employees': true,
    'Show payroll to managers only': true,
    'Auto-generate statutory reports': true,
    'Flag mismatched entity registrations': true,
    'Show group headcount in sidebar': true,
    'Allow self-service group requests': false,
    'Notify managers on policy breach': true,
    'Escalate repeat violations': false,
    'Allow negative leave balance': false,
    'Roll over unused days': true,
    'Auto-assign buddy on Day 1': true,
    'Send welcome email sequence': true,
  })

  const handleSave = () => {
    console.log('Settings saved')
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              {section.title}
            </h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {section.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {section.cards.map((card, index) => (
          <SectionCard key={index} title={card.title}>
            {card.type === 'pills' ? (
              <PillSelector
              options={card.options ?? []}
              selected={pillStates[card.title] || (card.options?.[0] ?? '')}
              onSelect={(value) =>
                setPillStates((prev) => ({ ...prev, [card.title]: value }))
              }
              />
            ) : (
              <div>
                {card.toggles?.map((toggle, toggleIndex) => (
                  <ToggleRow
                    key={toggleIndex}
                    label={toggle.label}
                    description={toggle.description}
                    enabled={toggleStates[toggle.label] || false}
                    onToggle={(enabled) =>
                      setToggleStates((prev) => ({
                        ...prev,
                        [toggle.label]: enabled,
                      }))
                    }
                    isLast={toggleIndex === card.toggles!.length - 1}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        ))}
      </div>
    </div>
  )
}
