'use client';

import { useState } from 'react';
import { SettingsSection } from '@/components/sections/settings/settings-section';
import { SettingsModal } from '@/components/sections/settings/settings-modal';
import { DataRow } from '@/components/sections/settings/data-row';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PolicyDetailsPage() {
  const router = useRouter();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col justify-center">
      <div className="w-[80%]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Policies
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">sick Leave.</h1>
          <Button variant="outline" size="sm">
            Delete policy
          </Button>
        </div>

        <SettingsSection
          title="Policy details"
          onEdit={() => setEditingSection('details')}
        >
          <div className="space-y-2">
            <DataRow label="Name" value="sick Leave." />
            <DataRow label="Description" value="Not specified" variant="muted" />
            <DataRow label="Policy type" value="Sick leave" />
            <DataRow label="Leave type" value="Short term" />
            <DataRow
              label="Created on"
              value="11:50, Jan 19th 2024"
              variant="muted"
            />
            <DataRow label="Created by" value="info@ganzafrica.org" variant="muted" />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Allowance"
          onEdit={() => setEditingSection('allowance')}
        >
          <div className="space-y-2">
            <DataRow label="Allowance time frame" value="Feb 1st - Jan 31st" />
            <DataRow label="Pay type" value="Paid" />
            <DataRow label="Annual allowance" value="15 business days" />
            <DataRow label="Accrual frequency" value="All at once" />
            <DataRow label="Negative balance" value="Unlimited" />
            <DataRow label="Carryover" value="Disabled" />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Proration of allowance"
          onEdit={() => setEditingSection('proration')}
        >
          <div className="space-y-2">
            <DataRow label="On hire" value="No proration" />
            <DataRow label="On termination" value="No proration" />
            <DataRow label="Part-time workers" value="Same as full-time workers" />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Requests"
          onEdit={() => setEditingSection('requests')}
        >
          <div className="space-y-3">
            <DataRow label="Allow estimated return date" value="Disabled" />
            <DataRow label="Allow workers to request time off" value="Enabled" />
            <DataRow label="Allow workers to modify approved used time off" value="Enabled" />
            <DataRow label="Partial requests" value="By specifying half days" />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Approval"
          onEdit={() => setEditingSection('approval')}
        >
          <div className="space-y-2">
            <DataRow label="Approval Status" value="Single policy required" />
            <DataRow label="Approval policy" value="Time off policy" />
          </div>
        </SettingsSection>
      </div>

      <SettingsModal
        isOpen={editingSection === 'details'}
        title="Edit policy details"
        subtitle="sick Leave. Policy"
        onClose={() => setEditingSection(null)}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <span className="text-blue-600">ⓘ</span>
            <p className="text-sm text-blue-700">
              Certain sections of this policy are restricted to preserve its structure and ensure compliance
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Policy name
            </label>
            <input
              type="text"
              defaultValue="sick Leave."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description (optional)
            </label>
            <textarea
              defaultValue=""
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24 resize-none"
            />
            <div className="text-right text-xs text-gray-500 mt-1">0/500</div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setEditingSection(null)}
            >
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Save changes
            </Button>
          </div>
        </div>
      </SettingsModal>
    </div>
  );
}
