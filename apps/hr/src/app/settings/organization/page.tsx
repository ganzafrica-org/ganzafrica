'use client';

import { SettingsSection } from '@/components/sections/settings/settings-section';
import { DataRow } from '@/components/sections/settings/data-row';
import { Button } from '@/components/ui/button';

export default function OrganizationPage() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="w-[80%]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organization settings</h1>
          <p className="text-gray-600 mt-1">Manage your organization information and preferences</p>
        </div>

        <SettingsSection
          title="Organization information"
          onEdit={() => alert('Edit clicked')}
        >
          <div className="space-y-2">
            <DataRow label="Organization name" value="GanzAfrica" />
            <DataRow label="Registration number" value="REG-2024-001" variant="muted" />
            <DataRow label="Industry" value="Technology" />
            <DataRow label="Headquarters" value="Nairobi, Kenya" />
            <DataRow label="Employee count" value="250-500" />
            <DataRow label="Founded" value="2020" variant="muted" />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Contact information"
          onEdit={() => alert('Edit clicked')}
        >
          <div className="space-y-2">
            <DataRow label="Primary email" value="contact@ganzafrica.org" />
            <DataRow label="Support email" value="support@ganzafrica.org" />
            <DataRow label="Phone number" value="+254 (0) 123 456 789" variant="muted" />
            <DataRow label="Website" value="www.ganzafrica.org" />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Subscription"
          onEdit={() => alert('Edit clicked')}
        >
          <div className="space-y-2">
            <DataRow label="Plan" value="Enterprise" />
            <DataRow label="Status" value="Active" />
            <DataRow label="Billing cycle" value="Monthly" variant="muted" />
            <DataRow label="Next billing date" value="Feb 1, 2024" />
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
