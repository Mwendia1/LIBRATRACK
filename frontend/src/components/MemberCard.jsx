import { useState, useEffect } from "react";

const BACKEND = "http://localhost:8000/api";  // CHANGED

export default function MemberCard({ member }) {
  const [borrows, setBorrows] = useState([]);
  const [loadingBorrows, setLoadingBorrows] = useState(false);
  const [showBorrows, setShowBorrows] = useState(false);

  useEffect(() => {
    if (showBorrows && member.id) {
      fetchMemberBorrows();
    }
  }, [showBorrows, member.id]);

  const fetchMemberBorrows = async () => {
    setLoadingBorrows(true);
    try {
      const response = await fetch(`${BACKEND}/members/${member.id}/borrows`);
      if (response.ok) {
        const data = await response.json();
        setBorrows(data);
      }
    } catch (error) {
      console.error("Error fetching borrows:", error);
    } finally {
      setLoadingBorrows(false);
    }
  };

  const activeBorrows = borrows.filter(b => !b.returned);
  const overdueBorrows = activeBorrows.filter(b => new Date(b.due_date) < new Date());

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 text-sm rounded-full ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-600">
                    Member ID: #{member.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {member.email && (
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89-5.26a2 2 0 012.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{member.email}</span>
                </div>
              )}
              
              {member.phone && (
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{member.phone}</span>
                </div>
              )}
              
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Joined: {new Date(member.join_date).toLocaleDateString()}</span>
              </div>
            </div>

            {member.address && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Address:</p>
                <p className="text-gray-700">{member.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Borrowing Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-medium text-gray-900">Borrowing Activity</h4>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Active: {activeBorrows.length}
                </span>
                <span className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Overdue: {overdueBorrows.length}
                </span>
                <span className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                  Total: {borrows.length}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setShowBorrows(!showBorrows)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
            >
              {showBorrows ? 'Hide Details' : 'Show Details'}
              <svg 
                className={`w-4 h-4 ml-2 transition-transform ${showBorrows ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Borrows Details */}
          {showBorrows && (
            <div className="mt-4">
              {loadingBorrows ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading borrowing history...</p>
                </div>
              ) : borrows.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No borrowing history found for this member.
                </div>
              ) : (
                <div className="space-y-3">
                  {borrows.map(borrow => {
                    const isOverdue = !borrow.returned && new Date(borrow.due_date) < new Date();
                    return (
                      <div 
                        key={borrow.id} 
                        className={`p-3 rounded-lg border ${isOverdue ? 'border-red-200 bg-red-50' : borrow.returned ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{borrow.book?.title || 'Unknown Book'}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span>Borrowed: {new Date(borrow.borrow_date).toLocaleDateString()}</span>
                              <span>Due: {new Date(borrow.due_date).toLocaleDateString()}</span>
                              {borrow.return_date && (
                                <span>Returned: {new Date(borrow.return_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${isOverdue ? 'bg-red-100 text-red-800' : borrow.returned ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {isOverdue ? 'Overdue' : borrow.returned ? 'Returned' : 'Active'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <a
              href={`/borrow?member=${member.id}`}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition text-center"
            >
              Borrow Book
            </a>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition">
              Edit Details
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${member.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            >
              {member.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}