export default function PayslipsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payslips</h1>
        <p className="text-gray-600 mt-2">View and download your payslips</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">No payslips available yet.</p>
      </div>
    </div>
  );
}
