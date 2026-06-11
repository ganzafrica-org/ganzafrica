// ✅ Data integrated — uses usePolicies()
// Fake data removed: inline POLICIES constant
// Fields not in API response: type, assigned, country, allowance, carryover (fallback "—"; supports snake_case API fields)

'use client';

import { useMemo, useState } from 'react';
import { SettingsTabs } from '@/components/sections/settings/settings-tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Download } from 'lucide-react';
import { usePolicies } from '@/hooks/usePolicies';
import type { Policy } from '@/types/api';

type PolicyRecord = Policy

const getPolicyName = (policy: PolicyRecord) =>
    policy.name ?? policy.policy_name ?? '—'

export default function TimeOffPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')

  const { data: policiesResponse, isLoading, isError } = usePolicies()

  const policyList = Array.isArray(policiesResponse)
    ? policiesResponse
    : Array.isArray(policiesResponse?.data)
      ? policiesResponse.data
      : []

  const types = useMemo(
    () =>
      Array.from(
        new Set(policyList.map((policy) => policy.type).filter(Boolean))
      ).sort() as string[],
    [policyList]
  )

  const countries = useMemo(
    () =>
      Array.from(
        new Set(policyList.map((policy) => policy.country).filter(Boolean))
      ).sort() as string[],
    [policyList]
  )

  const filteredPolicies = policyList.filter((policy) => {
    const query = searchTerm.toLowerCase()
    const name = getPolicyName(policy).toLowerCase()
    const type = (policy.type ?? '').toLowerCase()
    const country = (policy.country ?? '').toLowerCase()

    const matchesSearch = !query || name.includes(query) || type.includes(query)
    const matchesType = typeFilter === 'all' || (policy.type ?? '—') === typeFilter
    const matchesCountry = countryFilter === 'all' || (policy.country ?? '—') === countryFilter
    return matchesSearch && matchesType && matchesCountry
  })

  const policiesTab = (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3 flex-1 max-w-md">
          <Input
            placeholder="Search policies..."
            className="h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Policy type</option>
            {types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
          >
            <option value="all">Country</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Download size={16} className="mr-2" /> Download as CSV
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center py-12 text-red-500">
          Failed to load data. Please try again.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Policy name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Workers assigned</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Country</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Allowance</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Carryover</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((policy, index) => (
                <tr
                  key={policy.id ?? index}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-blue-600">{getPolicyName(policy)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{policy.type ?? '—'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {policy.workers_assigned ?? policy.assigned ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{policy.country ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{policy.allowance ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{policy.carryover ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">Total {filteredPolicies.length} items</div>
    </div>
  );

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="w-[80%]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time off</h1>
            <p className="text-gray-600 mt-1">Manage your organization&apos;s policies for holidays, illness and other time off</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus size={16} className="mr-2" /> Add policy
          </Button>
        </div>

        <SettingsTabs
          tabs={[
            { id: 'policies', label: 'Policies', content: policiesTab },
            { id: 'holidays', label: 'Public holidays', content: <div>Public holidays content</div> },
            { id: 'settings', label: 'Settings', content: <div>Settings content</div> },
          ]}
          defaultTab="policies"
        />
      </div>
    </div>
  );
}
