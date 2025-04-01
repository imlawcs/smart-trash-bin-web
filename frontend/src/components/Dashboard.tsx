import React, { useEffect } from 'react';
import { useTrashBin } from '../contexts/TrashBinContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import TrashBinCard from './TrashBinCard';

const Dashboard: React.FC = () => {
  const { state: trashBinState, getTrashBins } = useTrashBin();
  const { state: authState, logout } = useAuth();
  const { trashBins, loading } = trashBinState;

  useEffect(() => {
    getTrashBins();
  }, []);

  const fullBins = trashBins.filter(bin => bin.isFull);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Trash Bin Monitoring</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {authState.user?.name}</span>
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Trash Bins</h2>
            {fullBins.length > 0 && (
              <p className="text-red-500 mt-1">
                {fullBins.length} bin{fullBins.length > 1 ? 's' : ''} need attention!
              </p>
            )}
          </div>
          <Link
            to="/trash-bins/new"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add New Bin
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : trashBins.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">You haven't added any trash bins yet.</p>
            <Link
              to="/trash-bins/new"
              className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Your First Bin
            </Link>
          </div> 
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trashBins.map((bin) => (
              <TrashBinCard key={bin._id} trashBin={bin} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;