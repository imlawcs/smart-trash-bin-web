import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrashBin } from '../contexts/TrashBinContext';
import { format, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

const TrashBinDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    state: { selectedBin, loading, error },
    getTrashBin,
    updateTrashBin,
    deleteTrashBin,
    clearSelected
  } = useTrashBin();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [newLevel, setNewLevel] = useState<number>(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      getTrashBin(id);
    }
    return () => {
      clearSelected();
    };
  }, [id]);

  useEffect(() => {
    if (selectedBin) {
      setNewLevel(selectedBin.currentLevel);
    }
  }, [selectedBin]);

  const handleUpdateLevel = async () => {
    if (!id || !selectedBin) return;
    
    setIsUpdating(true);
    try {
      await updateTrashBin(id, { currentLevel: newLevel });
      setIsUpdating(false);
    } catch (error) {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteTrashBin(id);
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in the context
    }
  };

  // Hàm tự tạo để hiển thị thời gian tương đối
  const getRelativeTimeString = (date: Date): string => {
    const now = new Date();
    const seconds = differenceInSeconds(now, date);
    const minutes = differenceInMinutes(now, date);
    const hours = differenceInHours(now, date);
    const days = differenceInDays(now, date);

    if (seconds < 60) {
      return `${seconds} seconds ago`;
    } else if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (days < 30) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };

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

  if (!selectedBin) {
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

  const fillPercentage = (selectedBin.currentLevel / selectedBin.capacity) * 100;
  const formattedLastUpdated = format(new Date(selectedBin.lastUpdated), 'PPpp');
  const timeAgo = getRelativeTimeString(new Date(selectedBin.lastUpdated));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto pt-10 px-4">
        <div className="mb-6 flex items-center">
          <Link to="/dashboard" className="text-blue-500 hover:underline mr-2">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{selectedBin.name}</h1>
                <p className="text-gray-600">{selectedBin.location}</p>
              </div>
              <span 
                className={`px-3 py-1 rounded text-white ${selectedBin.isFull ? 'bg-red-500' : 'bg-green-500'}`}
              >
                {selectedBin.isFull ? 'Full' : 'Available'}
              </span>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Current Status</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span>Fill Level</span>
                      <span>{Math.round(fillPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`${selectedBin.isFull ? 'bg-red-500' : 'bg-green-500'} h-4 rounded-full`} 
                        style={{ width: `${fillPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Current Level</p>
                      <p className="font-semibold">{selectedBin.currentLevel} liters</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Capacity</p>
                      <p className="font-semibold">{selectedBin.capacity} liters</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Threshold</p>
                      <p className="font-semibold">{selectedBin.threshold}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Space Left</p>
                      <p className="font-semibold">{selectedBin.capacity - selectedBin.currentLevel} liters</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium mb-3">Update Fill Level</h3>
                  <div className="mb-4">
                    <input
                      type="range"
                      min="0"
                      max={selectedBin.capacity}
                      value={newLevel}
                      onChange={(e) => setNewLevel(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>0</span>
                      <span>{newLevel} liters</span>
                      <span>{selectedBin.capacity}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleUpdateLevel}
                    disabled={isUpdating || newLevel === selectedBin.currentLevel}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isUpdating ? 'Updating...' : 'Update Level'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p>Last updated: {timeAgo}</p>
              <p>Exact time: {formattedLastUpdated}</p>
            </div>

            <div className="mt-8 pt-6 border-t flex justify-between">
              <Link
                to={`/trash-bins/edit/${selectedBin._id}`}
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

export default TrashBinDetail;