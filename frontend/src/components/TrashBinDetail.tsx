import React, { useEffect, useCallback, useState, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrashBin } from '../contexts/TrashBinContext';
import { TrashBin, Compartment } from '../types';

const TrashBinDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    state: { selectedBin, binCache, loading, error, notification },
    getTrashBin,
    deleteTrashBin,
    clearSelected,
    clearNotification,
  } = useTrashBin();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      console.log('Fetching trash bin', { id });
      getTrashBin(id);
    }
  }, [id, getTrashBin]);

  useEffect(() => {
    return () => {
      console.log('Cleaning up, calling clearSelected');
      clearSelected();
    };
  }, [clearSelected]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    
    try {
      await deleteTrashBin(id);
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in the context
    }
  }, [id, deleteTrashBin, navigate]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRefresh = () => {
    if (id) {
      console.log('Manual refresh triggered', { id });
      getTrashBin(id);
    }
  };

  // Lấy bin hiện tại, ưu tiên selectedBin nếu có đúng ID
  const currentBin = id ? 
    (selectedBin && selectedBin._id === id) ? selectedBin : 
    (binCache[id] || undefined) : 
    undefined;

  console.log('Current bin:', currentBin);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="max-w-md bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!currentBin) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="max-w-md bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Bin Not Found</h2>
          <p className="text-gray-700 mb-4">The trash bin you're looking for doesn't exist.</p>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Xử lý an toàn với compartments - đảm bảo nó tồn tại và là một mảng
  const compartments = currentBin.compartments && Array.isArray(currentBin.compartments) 
    ? currentBin.compartments 
    : [];
    
  const defaultCompartments: Compartment[] = [
    { _id: "1", binId: currentBin._id, type: "plastic", sensorId: "", isFull: false },
    { _id: "2", binId: currentBin._id, type: "paper", sensorId: "", isFull: false },
    { _id: "3", binId: currentBin._id, type: "metal", sensorId: "", isFull: false },
    { _id: "4", binId: currentBin._id, type: "trash", sensorId: "", isFull: false }
  ];

  // Sử dụng compartments từ dữ liệu bin hoặc sử dụng mặc định nếu trống
  const compartmentsToShow = compartments.length > 0 ? compartments : defaultCompartments;

  console.log('Compartments to show:', compartmentsToShow);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4">
          <div>
            <p className="font-semibold">{notification.message}</p>
            <p>Compartment: {notification.compartmentType} (Bin ID: {notification.binId})</p>
          </div>
          <button
            onClick={clearNotification}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto pt-10 px-4">
        <div className="mb-6 flex items-center space-x-4">
          <button
            onClick={handleBackToDashboard}
            className="text-blue-500 hover:underline"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Data
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{currentBin.name}</h1>
                <p className="text-gray-600">{currentBin.location || 'No location'}</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Compartments</h2>
              <div className="grid grid-cols-2 gap-4">
                {compartmentsToShow.map((compartment) => (
                  <div
                    key={compartment._id}
                    className="p-4 bg-gray-50 rounded-lg shadow"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-medium capitalize">{compartment.type}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs text-white ${
                          compartment.isFull ? 'bg-red-500' : 'bg-green-500'
                        }`}
                      >
                        {compartment.isFull ? 'Full' : 'Available'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex justify-between">
              <Link
                to={`/trash-bins/edit/${currentBin._id}`}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Edit Details
              </Link>
              
              {showDeleteConfirm ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Confirm Delete
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  Delete Bin
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(TrashBinDetail);