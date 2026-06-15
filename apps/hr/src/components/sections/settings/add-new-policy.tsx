'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

interface AddNewPolicyFormProps {
  onClose: () => void
}

export default function AddNewPolicy({ onClose }: AddNewPolicyFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    feature: '',
    notifyUsers: false,
  })

  const steps = [
    { number: 1, label: 'Policy information' },
    { number: 2, label: 'Approvers' },
    { number: 3, label: 'Notification' },
  ]

  const isMissingDetails = !formData.name || !formData.feature

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotifyChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifyUsers: checked
    }))
  }

  const features = [
    'Data update',
    'Expenses',
    'Time tracking submissions',
    'Worker Resignation',
    "Contractors' submissions",
    'Time off',
    'Workforce planning'
  ]

  return (
    <div className="flex h-full w-[40%] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">New approval policy</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Form Content */}
          <div className="col-span-2">
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Policy Information */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Policy information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description <span className="text-gray-500">(optional)</span>
                      </label>
                      <textarea
                        name="description"
                        placeholder="Description (optional)"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="mt-2 text-right text-sm text-gray-500">
                        {formData.description.length} / 400
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Selection */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature selection</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Select a feature (like &apos;Time Off&apos;) to make this approval policy available for use there
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feature <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="feature"
                      value={formData.feature}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        feature: e.target.value
                      }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                        !formData.feature ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a feature</option>
                      {features.map((feature) => (
                        <option key={feature} value={feature}>
                          {feature}
                        </option>
                      ))}
                    </select>
                    {!formData.feature && (
                      <p className="mt-2 text-sm text-red-500">Please select a feature type</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approvers</h3>
                <p className="text-gray-600">Approvers configuration would go here</p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification</h3>
                
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Checkbox
                    id="notify-users"
                    checked={formData.notifyUsers}
                    onCheckedChange={(checked) => handleNotifyChange(checked as boolean)}
                    className="w-5 h-5"
                  />
                  <label htmlFor="notify-users" className="flex-1 cursor-pointer">
                    <p className="font-medium text-gray-900">Notify system users</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Enable this to notify all system users when this approval policy is created or updated
                    </p>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Steps Sidebar */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-6">
              {isMissingDetails && currentStep === 1 && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">MISSING DETAILS</p>
                    <p className="text-sm text-red-700 mt-1">Policy information</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          currentStep === step.number
                            ? 'bg-blue-600 text-white'
                            : step.number < currentStep
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {step.number}
                      </div>
                      {step.number < steps.length && (
                        <div className="w-0.5 h-8 bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p
                        className={`text-sm font-medium ${
                          currentStep === step.number
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex gap-3 justify-between border-t border-gray-200 pt-6 mt-6">
        <Button variant="outline" onClick={onClose} className="border-gray-300">
          Cancel
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="border-gray-300"
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (currentStep < 3) {
                setCurrentStep(currentStep + 1)
              } else {
                onClose()
              }
            }}
            disabled={currentStep === 1 && isMissingDetails}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {currentStep === 3 ? 'Create policy' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
