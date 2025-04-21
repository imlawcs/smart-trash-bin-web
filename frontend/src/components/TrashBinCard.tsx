import React from 'react';
import { TrashBin } from '../types';
import { Link } from 'react-router-dom';

interface TrashBinCardProps {
  trashBin: TrashBin;
}

const TrashBinCard: React.FC<TrashBinCardProps> = ({ trashBin }) => {
  return (
    <Link to={`/trash-bins/${trashBin._id}`} className="block">
      <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
        <div className="p-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{trashBin.name}</h3>
            <p className="text-gray-600 text-sm">Latitude: {trashBin.latitude?.toString() || 'N/A'}</p>
            <p className="text-gray-600 text-sm">Longitude: {trashBin.longitude?.toString() || 'N/A'}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TrashBinCard;