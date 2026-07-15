"use client";

import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileTabProps {
  employee: any;
  onEditClick: () => void;
}

export default function ProfileTab({ employee, onEditClick }: ProfileTabProps) {
  return (
    <div className="space-y-6 pb-6">
      {/* Employee Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{employee.name}</h2>
                <p className="text-sm text-gray-600">{employee.title}</p>
                <p className="text-sm text-gray-600">{employee.department}</p>
              </div>
            </div>
            <button
              onClick={onEditClick}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit profile"
            >
              <Edit2 size={20} />
            </button>
          </div>

          {/* Employee Details Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Emp ID
              </p>
              <p className="text-sm font-medium text-gray-900">{employee.id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Status
              </p>
              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                {employee.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Hire Date
              </p>
              <p className="text-sm font-medium text-gray-900">{employee.hireDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Work Phone
              </p>
              <p className="text-sm font-medium text-gray-900">{employee.workPhone}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Work Email
              </p>
              <p className="text-sm font-medium text-gray-900 truncate">{employee.workEmail}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Office Location
              </p>
              <p className="text-sm font-medium text-gray-900">{employee.officeLocation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          {[
            "Personal",
            "ViewEmployeeContents",
            "Payslots",
            "Emergency",
            "Leave",
            "Performance",
          ].map((tab) => (
            <button
              key={tab}
              className="px-1 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Personal Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Personal Info Card */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Personal Information
            </p>
            <p className="text-sm text-gray-600 line-clamp-3">
              This section contains personal details and emergency contact information for the
              employee.
            </p>
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-3 inline-block"
            >
              View Details
            </a>
          </div>

          {/* Job Profile Card */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Job Profile
            </p>
            <p className="text-sm text-gray-600 line-clamp-3">
              Current job role, responsibilities, and career progression information is maintained
              here.
            </p>
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-3 inline-block"
            >
              View Details
            </a>
          </div>

          {/* Payslots Card */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Compensation
            </p>
            <p className="text-sm text-gray-600 line-clamp-3">
              Salary details, benefits, and compensation information managed securely.
            </p>
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-3 inline-block"
            >
              View Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
