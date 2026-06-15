'use client'

import { X, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Policy {
  id: number
  name: string
  description: string
  feature: string
  status: string
  lastEdited: string
}

interface PolicyDetailViewProps {
  policy: Policy
  onClose: () => void
}

export default function PolicyDetailView({ policy, onClose }: PolicyDetailViewProps) {
  return (
    <div className="fixed inset-0 w-[40%] z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 inset-y-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{policy.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* General Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General information</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Work time approvals</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Approvals for all worker types, except contractors, appear under &quot;Time tracking submissions&quot; in the homepage. Contractor approvals appear in &quot;Contractors&apos; submissions&quot; and are configured in{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Contract settings
                    </a>
                    .
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created by</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">By system</p>
                  <p className="text-xs text-gray-600 mt-1">16:59, May 23rd 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Approver Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approver</h3>
            
            <div className="space-y-3">
              <div className="inline-block">
                <Badge className="bg-gray-100 text-gray-700 border-0 px-2 py-1 text-xs">
                  Required approvers: 1
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                    GA
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Group Admin</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                    OA
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Organization Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            className="flex-1 border-gray-300"
            onClick={onClose}
          >
            Reset
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={onClose}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  )
}
