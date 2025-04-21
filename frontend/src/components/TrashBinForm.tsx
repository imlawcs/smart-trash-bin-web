import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrashBin } from '../contexts/TrashBinContext';

interface FormData {
  name: string;
  latitude: number;
  longitude: number;
}

const TrashBinForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { 
    state: { selectedBin, loading, error }, 
    getTrashBin, 
    createTrashBin, 
    updateTrashBin 
  } = useTrashBin();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (!isNew && id) {
      getTrashBin(id);
    }
  }, [id, isNew, getTrashBin]);

  useEffect(() => {
    if (selectedBin && !isNew) {
      setFormData({
        name: selectedBin.name,
        latitude: selectedBin.latitude || 0,
        longitude: selectedBin.longitude || 0,
      });
    }
  }, [selectedBin, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'name' ? value : Number(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isNew) {
        await createTrashBin(formData);
      } else if (id) {
        await updateTrashBin(id, formData);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">
          {isNew ? 'Thêm Thùng Rác Mới' : 'Chỉnh Sửa Thùng Rác'}
        </h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Tên Thùng Rác
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
            <label className="block text-gray-700 mb-2" htmlFor="latitude">
              Vĩ Độ
            </label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="any"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="longitude">
              Kinh Độ
            </label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="any"
              required
            />
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Đang Lưu...' : isNew ? 'Tạo Thùng Rác' : 'Cập Nhật Thùng Rác'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrashBinForm;