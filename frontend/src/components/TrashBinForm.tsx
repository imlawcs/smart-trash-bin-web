import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrashBin } from '../contexts/TrashBinContext';

interface FormData {
  name: string;
  location: string;
  capacity: number;
  threshold: number;
  currentLevel?: number;
}

const TrashBinForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { 
    state: { selectedBin, loading, error }, 
    getTrashBin, 
    createTrashBin, 
    updateTrashBin, 
    clearSelected 
  } = useTrashBin();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    capacity: 100,
    threshold: 80,
    currentLevel: 0,
  });

  useEffect(() => {
    if (!isNew && id) {
      getTrashBin(id);
    }
    return () => {
      clearSelected();
    };
  }, [id, isNew]);

  useEffect(() => {
    if (selectedBin && !isNew) {
      setFormData({
        name: selectedBin.name,
        location: selectedBin.location,
        capacity: selectedBin.capacity,
        threshold: selectedBin.threshold,
        currentLevel: selectedBin.currentLevel,
      });
    }
  }, [selectedBin, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'name' || name === 'location' ? value : Number(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNew) {
      await createTrashBin(formData);
    } else if (id) {
      await updateTrashBin(id, formData);
    }
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">
          {isNew ? 'Add New Trash Bin' : 'Edit Trash Bin'}
        </h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Bin Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="location">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="capacity">
              Capacity (liters)
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="1"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="threshold">
              Full Threshold (%)
            </label>
            <input
              type="number"
              id="threshold"
              name="threshold"
              value={formData.threshold}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="1"
              max="100"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Percentage filled at which the bin is considered full
            </p>
          </div>
          
          {!isNew && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="currentLevel">
                Current Fill Level (liters)
              </label>
              <input
                type="number"
                id="currentLevel"
                name="currentLevel"
                value={formData.currentLevel}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="0"
                max={formData.capacity}
                required
              />
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Saving...' : isNew ? 'Create Bin' : 'Update Bin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrashBinForm;