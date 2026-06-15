"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReusableSheet } from '@/components/sections/sheets/sheet-component'
import { Plus, Mail, Phone, Building2, User, ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import {Employee, initial_employee} from "@/data/employee-data";

export default function DepartmentChartPage() {
  const [employees, setEmployees] = useState<Employee[]>(initial_employee)
  const [draggedEmployeeId, setDraggedEmployeeId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    role: '',
    parentId: '',
    email: '',
    phone: '',
    department: ''
  })

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.role) return

    const id = (employees.length + 1).toString()
    const employee: Employee = {
      id,
      name: newEmployee.name,
      role: newEmployee.role,
      parentId: newEmployee.parentId || undefined,
      email: newEmployee.email,
      phone: newEmployee.phone,
      department: newEmployee.department,
      color: newEmployee.role === 'Team' ? 'border-slate-300' : 'border-blue-500',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newEmployee.name)}&background=random`,
      teamCount: 0
    }

    setEmployees([...employees, employee])
    setIsAddSheetOpen(false)
    setNewEmployee({ name: '', role: '', parentId: '', email: '', phone: '', department: '' })
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedEmployeeId(id)
    e.dataTransfer.effectAllowed = 'move'
    
    // Add visual ghosting
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '1'
    setDraggedEmployeeId(null)
    setDropTargetId(null)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggedEmployeeId === id) return
    setDropTargetId(id)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    setDropTargetId(null)
  }

  const isDescendant = useCallback((parentId: string, childId: string, allEmployees: Employee[]) => {
    let currentParent = allEmployees.find(e => e.id === childId)?.parentId
    while (currentParent) {
      if (currentParent === parentId) return true
      currentParent = allEmployees.find(e => e.id === currentParent)?.parentId
    }
    return false
  }, [])

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDropTargetId(null)

    if (!draggedEmployeeId || draggedEmployeeId === targetId) return

    // Prevent dragging parent into its own child or any descendant
    if (isDescendant(draggedEmployeeId, targetId, employees)) {
        alert("Cannot drag a parent into its own descendant")
        return
    }

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === draggedEmployeeId ? { ...emp, parentId: targetId } : emp
      )
    )
  }

  const renderCard = (employee: Employee) => (
    <div
      key={employee.id}
      draggable
      onDragStart={(e) => handleDragStart(e, employee.id)}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => handleDragOver(e, employee.id)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, employee.id)}
      className={`relative flex flex-col items-center transition-all duration-200 ${
        dropTargetId === employee.id ? 'scale-110' : ''
      }`}
    >
      <Card 
        onClick={() => setSelectedEmployee(employee)}
        className={`w-56 bg-white shadow-sm border-2 ${employee.color} rounded-2xl overflow-visible transition-all hover:shadow-md cursor-grab active:cursor-grabbing ${
          dropTargetId === employee.id ? 'ring-2 ring-emerald-400 ring-offset-2' : ''
        }`}
      >
        <CardContent className="p-4 relative">
          {employee.role !== 'Team' && (
            <Badge className="absolute -top-3 -right-2 bg-green-400 text-white text-[10px] px-2 py-0 h-5 font-bold uppercase tracking-wider">
              {employee.role}
            </Badge>
          )}
          <div className="flex items-center gap-4">
            {employee.role !== 'Team' ? (
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                    <AvatarImage src={employee.avatar} alt={employee.name} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 text-slate-500 font-semibold">{employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
            ) : (
                <div className="h-1 w-1" /> // Spacer for team home-cards
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-[14px] font-bold text-slate-700 truncate leading-tight">{employee.name}</p>
              {employee.role === 'Team' && <p className="text-[11px] text-slate-400 font-medium">Department Team</p>}
            </div>
          </div>
          {employee.teamCount !== undefined && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-100 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-full border-2 border-white font-bold shadow-sm">
              {employee.teamCount}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const getChildren = (parentId?: string) => employees.filter((emp) => emp.parentId === parentId)

  const renderTree = (parentId?: string) => {
    const children = getChildren(parentId)
    if (children.length === 0) return null

    return (
      <div className="flex justify-center gap-12 relative pt-16">
        {/* Horizontal line connecting children */}
        {children.length > 1 && (
          <div 
            className="absolute top-0 h-px border-t-2 border-dotted border-slate-300" 
            style={{
                left: `calc(${(100 / children.length) / 2}%)`,
                right: `calc(${(100 / children.length) / 2}%)`
            }}
          />
        )}
        
        {children.map((child, index) => (
          <div key={child.id} className="relative flex flex-col items-center flex-1 min-w-[224px]">
            {/* Vertical line from horizontal line to child */}
            <div className="absolute -top-16 h-16 w-px border-l-2 border-dotted border-slate-300" />
            
            {renderCard(child)}
            {renderTree(child.id)}
          </div>
        ))}
      </div>
    )
  }

  const rootEmployees = employees.filter((emp) => !emp.parentId)

  return (
    <div className="h-screen w-full bg-[#F8FAFC] overflow-hidden relative">
      {/* Zoom Controls */}
      <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-2">
        <Button 
          variant="secondary"
          size="icon"
          className="rounded-full shadow-md bg-white hover:bg-slate-50 border border-slate-200"
          onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
        >
          <ZoomIn className="h-5 w-5 text-slate-600" />
        </Button>
        <Button 
          variant="secondary"
          size="icon"
          className="rounded-full shadow-md bg-white hover:bg-slate-50 border border-slate-200"
          onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
        >
          <ZoomOut className="h-5 w-5 text-slate-600" />
        </Button>
        <Button 
          variant="secondary"
          size="icon"
          className="rounded-full shadow-md bg-white hover:bg-slate-50 border border-slate-200"
          onClick={() => setZoom(1)}
        >
          <Maximize className="h-5 w-5 text-slate-600" />
        </Button>
      </div>

      <div className="fixed top-8 right-8 z-50">
        <Button 
          onClick={() => setIsAddSheetOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Main viewport with panning and zooming */}
      <div className="h-full w-full overflow-auto p-16 cursor-grab active:cursor-grabbing scrollbar-hide">
        <div 
          className="min-w-max min-h-max transition-transform duration-200 ease-out flex gap-24 items-start origin-top pt-12"
          style={{ transform: `scale(${zoom})` }}
        >
          {rootEmployees.map((root) => (
            <div key={root.id} className="flex flex-col items-center">
              {renderCard(root)}
              
              {/* Vertical line from root to children */}
              {getChildren(root.id).length > 0 && (
                <div className="h-16 w-px border-l-2 border-dotted border-slate-300" />
              )}
              
              {renderTree(root.id)}
            </div>
          ))}
        </div>
      </div>

      {/* Employee Details Sheet */}
      <ReusableSheet 
        open={!!selectedEmployee} 
        onOpenChange={(open) => !open && setSelectedEmployee(null)}
        title="Employee Details"
        description="Detailed information about the employee and their role."
        maxWidth="sm:max-w-md"
      >
        {selectedEmployee && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                <AvatarImage src={selectedEmployee.avatar} />
                <AvatarFallback>{selectedEmployee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedEmployee.name}</h3>
                <Badge className="bg-purple-100 text-green-400 hover:bg-purple-100 border-none">
                  {selectedEmployee.role}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Email Address</p>
                  <p className="text-sm font-semibold">{selectedEmployee.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Phone Number</p>
                  <p className="text-sm font-semibold">{selectedEmployee.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center text-green-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Department</p>
                  <p className="text-sm font-semibold">{selectedEmployee.department || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center text-blue-500">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Reporting To</p>
                  <p className="text-sm font-semibold">
                    {employees.find(e => e.id === selectedEmployee.parentId)?.name || 'None (CEO)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Direct Reports</h4>
              <div className="space-y-2">
                {getChildren(selectedEmployee.id).length > 0 ? (
                  getChildren(selectedEmployee.id).map(report => (
                    <div key={report.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer" onClick={() => setSelectedEmployee(report)}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={report.avatar} />
                        <AvatarFallback>{report.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{report.name}</p>
                        <p className="text-xs text-slate-400">{report.role}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No direct reports</p>
                )}
              </div>
            </div>
          </div>
        )}
      </ReusableSheet>

      {/* Add Employee Sheet */}
      <ReusableSheet 
        open={isAddSheetOpen} 
        onOpenChange={setIsAddSheetOpen}
        title="Add New Employee"
        description="Enter employee details and assign them to a parent in the organization."
        maxWidth="sm:max-w-sm"
      >
        <div className="space-y-4 p-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. John Doe" 
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role / Position</Label>
            <Input 
              id="role" 
              placeholder="e.g. Senior Developer" 
              value={newEmployee.role}
              onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent">Reporting To</Label>
            <Select 
              value={newEmployee.parentId} 
              onValueChange={(value) => setNewEmployee({...newEmployee, parentId: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Root)</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.role})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="john.doe@company.com" 
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              placeholder="+1 (555) 000-0000" 
              value={newEmployee.phone}
              onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept">Department</Label>
            <Input 
              id="dept" 
              placeholder="e.g. Engineering" 
              value={newEmployee.department}
              onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
            />
          </div>
          <Button 
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleAddEmployee}
            disabled={!newEmployee.name || !newEmployee.role}
          >
            Add to Chart
          </Button>
        </div>
      </ReusableSheet>
    </div>
  )
}
