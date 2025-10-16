import { FileText, Download, Calendar, User, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from '../navigation';
import Navigation from '../../components/Navigation';
import labResultsData from '../../mockData/labResultsData.json';
import patientsData from '../../mockData/patientsData.json';

export default function LabResultsPage() {
  const navigate = useNavigate();
  const currentPatient = patientsData[0];
  const patientLabResults = labResultsData.filter(lab => lab.patientId === currentPatient.patientId);
  const [expandedResults, setExpandedResults] = useState<string[]>([]);

  const toggleExpand = (resultId: string) => {
    setExpandedResults(prev =>
      prev.includes(resultId)
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const handleDownload = (result: any) => {
    console.log('Downloading result:', result.resultId);
    alert(`Downloading ${result.testName} report...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="lab-results" isAuthenticated={true} userName={currentPatient.name} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20 lg:ml-[280px]">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab Results</h1>
          <p className="text-gray-600">View and download your laboratory test results</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentPatient.name}</h2>
              <p className="text-gray-600">Patient ID: {currentPatient.patientId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Results</p>
              <p className="text-3xl font-bold text-green-600">{patientLabResults.length}</p>
            </div>
          </div>
        </div>

        {patientLabResults.length > 0 ? (
          <div className="space-y-4">
            {patientLabResults.map(result => {
              const isExpanded = expandedResults.includes(result.resultId);

              return (
                <div key={result.resultId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{result.testName}</h3>
                          <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-semibold">
                            {result.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Ordered by: {result.orderedBy}
                          </p>
                          <p className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Test Date: {result.testDate}
                          </p>
                          <p className="flex items-center">
                            <Activity className="h-4 w-4 mr-2" />
                            Result Date: {result.resultDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => toggleExpand(result.resultId)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-5 w-5" />
                            <span>Hide Details</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-5 w-5" />
                            <span>View Details</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDownload(result)}
                        className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="h-5 w-5" />
                        <span>Download</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4">Test Results</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {Object.entries(result.results).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-600 mb-1">{key}</p>
                              <p className="text-lg font-semibold text-gray-900">{value as string}</p>
                            </div>
                          ))}
                        </div>

                        {result.notes && (
                          <div className="mt-4 bg-blue-50 border-l-4 border-blue-600 p-4">
                            <p className="font-semibold text-blue-900 mb-1">Doctor's Notes</p>
                            <p className="text-blue-800">{result.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Lab Results</h3>
            <p className="text-gray-600 mb-6">You don't have any lab results yet.</p>
            <button
              onClick={() => navigate('appointments')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Book an Appointment
            </button>
          </div>
        )}

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Important Information</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Lab results are typically available within 24-48 hours after testing</li>
            <li>• You will receive an email notification when new results are available</li>
            <li>• If you have questions about your results, please contact your doctor</li>
            <li>• All results can be downloaded as PDF for your records</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
