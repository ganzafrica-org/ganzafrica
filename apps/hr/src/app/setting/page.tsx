'use client'

import { MainPanel } from '@/components/sections/settings/MainPanel'
import { Sidebar } from '@/components/sections/settings/Sidebar'
import { useState } from 'react'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('roles')

  return (
    <div className="flex h-screen dark:bg-neutral-950">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <MainPanel activeSection={activeSection} />
    </div>
  )
}
