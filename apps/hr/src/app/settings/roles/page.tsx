"use client";

import { useState } from "react";
import { SettingsTabs } from "@/components/sections/settings/settings-tabs";
import { SettingsModal } from "@/components/sections/settings/settings-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { role_data } from "@/data/role-data";

export default function RolesPage() {
  const [showModal, setShowModal] = useState(false);

  const peopleTab = (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3 flex-1 max-w-md">
          <Input placeholder="Search roles..." className="h-10" />
          <select className="px-4 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
            <option>Role</option>
          </select>
          <select className="px-4 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
            <option>Access scope</option>
          </select>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Download size={16} className="mr-2" /> Download CSV
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                Scope
              </th>
            </tr>
          </thead>
          <tbody>
            {role_data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-blue-600">{item.role}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{item.scope}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="w-[80%]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Roles and permissions</h1>
            <p className="text-muted-foreground mt-1">
              Manage roles, permissions, managers and admins for your organization
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus size={16} className="mr-2" /> Create role
          </Button>
        </div>

        <SettingsTabs
          tabs={[
            { id: "people", label: "People", content: peopleTab },
            { id: "roles", label: "Roles", content: <div>Roles content</div> },
          ]}
          defaultTab="people"
        />
      </div>

      <SettingsModal
        isOpen={showModal}
        title="Edit access"
        subtitle="For Adulation Ndiovu"
        onClose={() => setShowModal(false)}
      >
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg p-4 flex gap-3">
            <span className="text-blue-600">ⓘ</span>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Certain sections of this policy are restricted to preserve its structure and ensure
              compliance
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Organization access</h3>
            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <span className="font-medium text-foreground">GanzAfrica</span>
              <Button variant="outline" size="sm">
                Grant access
              </Button>
            </div>
          </div>
        </div>
      </SettingsModal>
    </div>
  );
}
