import React from 'react';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default function ApplyToOpportunityPage({ params }: PageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">No application yet</h1>
        <p className="text-gray-600 mb-6">This opportunity does not have an application form yet.</p>
        <Link
          href="/opportunities"
          className="inline-block px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
        >
          Go back to Opportunities
        </Link>
      </div>
    </div>
  );
}
