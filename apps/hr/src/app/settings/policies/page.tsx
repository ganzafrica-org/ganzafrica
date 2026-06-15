// ✅ Data integrated — uses usePolicies()
// Fake data removed: policies from @/data/policy-data
// Fields not in API response: description, feature, status, lastEdited (fallback "—"; supports snake_case API fields)

'use client'

import { useMemo, useState } from 'react'
import { Search, Plus, Maximize2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ReusableSheet } from '@/components/sections/sheets/sheet-component'
import AddNewPolicyForm from '@/components/sections/settings/add-new-policy'
import PolicyDetailView from '@/components/sections/settings/policy-detail-view'
import { usePolicies } from '@/hooks/usePolicies'
import type { Policy } from '@/types/api'

type PolicyRecord = Policy

type PolicyDetail = {
    id: number
    name: string
    description: string
    feature: string
    status: string
    lastEdited: string
}

const getPolicyName = (policy: PolicyRecord) =>
    policy.name ?? policy.policy_name ?? '—'

const getPolicyLastEdited = (policy: PolicyRecord) =>
    policy.lastEdited ?? policy.last_edited ?? '—'

const toPolicyDetail = (policy: PolicyRecord, index: number): PolicyDetail => ({
    id: Number.parseInt(policy.id, 10) || index + 1,
    name: getPolicyName(policy),
    description: policy.description ?? '—',
    feature: policy.feature ?? '—',
    status: policy.status ?? '—',
    lastEdited: getPolicyLastEdited(policy),
})

const getStatusBadgeClass = (status?: string) => {
    const normalized = (status ?? '').toLowerCase()
    if (normalized === 'active') return 'bg-green-100 text-green-800'
    if (normalized === 'inactive') return 'bg-gray-100 text-gray-800'
    return 'bg-green-100 text-green-800'
}

export default function PoliciesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFeature, setSelectedFeature] = useState('all')
    const [isAddNewOpen, setIsAddNewOpen] = useState(false)
    const [selectedPolicy, setSelectedPolicy] = useState<PolicyDetail | null>(null)

    const { data: policiesResponse, isLoading, isError } = usePolicies()

    const policyList = Array.isArray(policiesResponse)
        ? policiesResponse
        : Array.isArray(policiesResponse?.data)
            ? policiesResponse.data
            : []

    const features = useMemo(
        () =>
            Array.from(
                new Set(policyList.map((policy) => policy.feature).filter(Boolean))
            ).sort() as string[],
        [policyList]
    )

    const filteredPolicies = policyList.filter((policy) => {
        const name = getPolicyName(policy).toLowerCase()
        const description = (policy.description ?? '').toLowerCase()
        const query = searchTerm.toLowerCase()
        const matchesSearch =
            !query || name.includes(query) || description.includes(query)
        const matchesFeature =
            selectedFeature === 'all' || (policy.feature ?? '—') === selectedFeature
        return matchesSearch && matchesFeature
    })

    return (
        <div className="flex flex-col justify-center items-center w-full bg-gray-50">
            <div className="px-6 flex flex-col border-2 w-[80%]">
                <Tabs defaultValue="policies" className="w-full">
                    <TabsContent value="policies" className="py-6">
                        <div className="mb-6 flex items-center gap-4">
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-white border-gray-300"
                                />
                            </div>

                            <div className="rounded-md border border-gray-300 bg-white">
                                <select
                                    value={selectedFeature}
                                    onChange={(e) => setSelectedFeature(e.target.value)}
                                    className="h-10 px-3 text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
                                >
                                    <option value="all">All features</option>
                                    {features.map((feature) => (
                                        <option key={feature} value={feature}>
                                            {feature}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="ml-auto flex items-center gap-3">
                                <Button onClick={() => setIsAddNewOpen(true)} className="bg-black hover:bg-gray-900 text-white rounded-md px-4 py-2 flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add new
                                </Button>
                                <Button variant="outline" size="icon" className="border-gray-300">
                                    <Maximize2 className="h-4 w-4 text-gray-700" />
                                </Button>
                            </div>
                        </div>

                        <div className="mb-4 text-sm text-gray-600">
                            Total {filteredPolicies.length} items
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
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/3">
                                            Approval policy
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/4">
                                            Feature
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/4">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/4">
                                            Last edited
                                        </th>
                                        <th className="px-4 py-3 w-12"></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredPolicies.map((policy, index) => (
                                        <tr
                                            key={policy.id ?? index}
                                            className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedPolicy(toPolicyDetail(policy, index))}
                                        >
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-blue-600 hover:underline">
                                                        {getPolicyName(policy)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {policy.description ?? '—'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {policy.feature ?? '—'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge className={`${getStatusBadgeClass(policy.status)} border-0 rounded-full px-3 py-1`}>
                                                    <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                                                    {policy.status ?? '—'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {getPolicyLastEdited(policy)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-400 hover:text-gray-600"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem>Reset</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="delegations" className="py-6">
                        <p className="text-gray-600">Delegations content</p>
                    </TabsContent>
                    <TabsContent value="requests" className="py-6">
                        <p className="text-gray-600">All requests content</p>
                    </TabsContent>
                    <TabsContent value="configuration" className="py-6">
                        <p className="text-gray-600">Configuration content</p>
                    </TabsContent>
                </Tabs>
            </div>

            <ReusableSheet open={isAddNewOpen} onOpenChange={setIsAddNewOpen} title="Add New Policy">
                <AddNewPolicyForm onClose={() => setIsAddNewOpen(false)} />
            </ReusableSheet>

            {selectedPolicy && (
                <PolicyDetailView policy={selectedPolicy} onClose={() => setSelectedPolicy(null)} />
            )}
        </div>
    )
}
