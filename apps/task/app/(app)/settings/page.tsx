"use client";

import React, { useState } from "react";
import { Monitor, Moon, Sun, Save, RefreshCw } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/button";
import { logger } from "@/lib/logger";

export default function SettingsPage(): React.JSX.Element {
  const [settings, setSettings] = useState({
    theme: "light",
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12",
    autoSave: true,
    display: {
      density: "comfortable",
      sidebarCollapsed: false,
      showCompletedTasks: true,
      groupByPriority: false,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (path: string, value: any) => {
    const keys = path.split(".");
    setSettings((prev) => {
      const newSettings = { ...prev };
      let current: any = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!key) continue;

        if (current[key] === undefined || current[key] === null) {
          current[key] = {};
        } else {
          current[key] = { ...current[key] };
        }
        current = current[key];
      }

      const lastKey = keys[keys.length - 1];
      if (lastKey) {
        current[lastKey] = value;
      }
      return newSettings;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    // In real app, save to API/localStorage
    logger.info("Saving settings:", settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    // Reset to defaults
    setSettings({
      theme: "light",
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12",
      autoSave: true,
      display: {
        density: "comfortable",
        sidebarCollapsed: false,
        showCompletedTasks: true,
        groupByPriority: false,
      },
    });
    setHasChanges(false);
  };

  return (
    <PageLayout members={[]} tasks={[]} title="Settings" className="bg-gray-50">
      <div className="w-full">
        <div className="bg-white shadow-sm" style={{ borderRadius: "7px" }}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Settings</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange("language", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ borderRadius: "7px" }}
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange("timezone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ borderRadius: "7px" }}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">Greenwich Mean Time</option>
                  <option value="CET">Central European Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange("dateFormat", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ borderRadius: "7px" }}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="12"
                      checked={settings.timeFormat === "12"}
                      onChange={(e) => handleSettingChange("timeFormat", e.target.value)}
                      className="mr-2"
                    />
                    12-hour (AM/PM)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="24"
                      checked={settings.timeFormat === "24"}
                      onChange={(e) => handleSettingChange("timeFormat", e.target.value)}
                      className="mr-2"
                    />
                    24-hour
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: "light", name: "Light", icon: Sun },
                    { id: "dark", name: "Dark", icon: Moon },
                    { id: "system", name: "System", icon: Monitor },
                  ].map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => handleSettingChange("theme", theme.id)}
                        className={`p-4 border-2 transition-colors ${
                          settings.theme === theme.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ borderRadius: "7px" }}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">{theme.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Density
                </label>
                <select
                  value={settings.display.density}
                  onChange={(e) => handleSettingChange("display.density", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ borderRadius: "7px" }}
                >
                  <option value="compact">Compact</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900">Auto-save</h4>
                  <p className="text-sm text-gray-500">Automatically save changes as you work</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange("autoSave", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style={
                      {
                        "--tw-ring-color": "#076297",
                        backgroundColor: settings.autoSave ? "#076297" : "#e5e7eb",
                      } as React.CSSProperties
                    }
                  ></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900">Collapse Sidebar by Default</h4>
                  <p className="text-sm text-gray-500">Start with the sidebar collapsed</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.display.sidebarCollapsed}
                    onChange={(e) =>
                      handleSettingChange("display.sidebarCollapsed", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style={
                      {
                        "--tw-ring-color": "#076297",
                        backgroundColor: settings.display.sidebarCollapsed ? "#076297" : "#e5e7eb",
                      } as React.CSSProperties
                    }
                  ></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900">Show Completed Tasks</h4>
                  <p className="text-sm text-gray-500">Display completed tasks in task lists</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.display.showCompletedTasks}
                    onChange={(e) =>
                      handleSettingChange("display.showCompletedTasks", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style={
                      {
                        "--tw-ring-color": "#076297",
                        backgroundColor: settings.display.showCompletedTasks
                          ? "#076297"
                          : "#e5e7eb",
                      } as React.CSSProperties
                    }
                  ></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Save/Reset Buttons */}
        {hasChanges && (
          <div className="flex gap-3 mt-8">
            <Button onClick={handleSave} variant="primary" icon={Save}>
              Save Changes
            </Button>
            <Button onClick={handleReset} variant="outline" icon={RefreshCw}>
              Reset to Defaults
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
