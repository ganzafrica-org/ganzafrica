"use client";

import React, { useState } from "react";
import { HelpCircle, Search, ChevronDown, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/page-layout";

export default function HelpPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "How do I create a new task?",
      answer: "To create a new task, click the 'Add Task' button in the navbar or use the '+' button on any board column. Fill in the task details including title, description, assignees, and due date, then click 'Create Task'."
    },
    {
      id: 2,
      question: "How do I assign tasks to team members?",
      answer: "When creating or editing a task, use the 'Assign Team' dropdown to select a team, then choose specific members from that team. You can also assign tasks directly to individual members in individual mode."
    },
    {
      id: 3,
      question: "What's the difference between Board View and Manage Tasks?",
      answer: "Board View shows tasks in a Kanban-style board with columns for different statuses. Manage Tasks shows tasks in a list format with filtering and sorting options. Both views allow you to create and edit tasks."
    },
    {
      id: 4,
      question: "How do I change task status?",
      answer: "In Board View, drag and drop tasks between columns to change their status. In Manage Tasks, use the status dropdown in the task details or edit the task directly."
    },
    {
      id: 5,
      question: "How do I set up team notifications?",
      answer: "Go to your Profile settings and navigate to the Notifications tab. You can customize which types of notifications you receive and how you receive them (email, push, desktop)."
    },
    {
      id: 6,
      question: "Can I export my tasks?",
      answer: "Yes, you can export tasks in various formats. Go to the Reports section and use the export options to download your task data as CSV, PDF, or other formats."
    },
    {
      id: 7,
      question: "How do I manage user permissions?",
      answer: "User permissions are managed by administrators. Contact your system administrator to request permission changes or role updates for team members."
    },
    {
      id: 8,
      question: "What happens when I archive a task?",
      answer: "Archived tasks are moved to a separate archive section and are no longer visible in active task lists. They can be restored later if needed by accessing the archive section."
    }
  ];


  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <PageLayout 
      members={[]} 
      tasks={[]} 
      title="Help Center"
      className="bg-gray-50"
    >
      <div className="w-full">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help articles, guides, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

            {/* FAQ Content */}
            <div className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Frequently Asked Questions
                  {searchQuery && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({filteredFAQs.length} results)
                    </span>
                  )}
                </h3>
                
                {filteredFAQs.length === 0 && searchQuery ? (
                  <div className="text-center py-12">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No results found</h4>
                    <p className="text-gray-600">Try searching with different keywords or browse all FAQs</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFAQs.map((faq) => (
                      <div key={faq.id} className="bg-white shadow-sm" style={{ borderRadius: '7px' }}>
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                          style={{ borderRadius: '7px' }}
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          {expandedFAQ === faq.id ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        {expandedFAQ === faq.id && (
                          <div className="px-6 pb-4">
                            <p className="text-gray-700 pt-4">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
      </div>
    </PageLayout>
  );
}
