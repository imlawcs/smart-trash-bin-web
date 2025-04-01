import React from 'react';
import { TrashBin } from '../types';
import { Link } from 'react-router-dom';
import { format, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

interface TrashBinCardProps {
  trashBin: TrashBin;
}

// Hàm tự tạo để hiển thị thời gian tương đối
const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const seconds = differenceInSeconds(now, date);
  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);

  if (seconds < 60) {
    return `${seconds} giây trước`;
  } else if (minutes < 60) {
    return `${minutes} phút trước`;
  } else if (hours < 24) {
    return `${hours} giờ trước`;
  } else if (days < 30) {
    return `${days} ngày trước`;
  } else {
    return format(date, 'dd/MM/yyyy');
  }
};

const TrashBinCard: React.FC<TrashBinCardProps> = ({ trashBin }) => {
  const fillPercentage = (trashBin.currentLevel / trashBin.capacity) * 100;
  const fillColor = trashBin.isFull ? 'bg-red-500' : 'bg-green-500';
  const formattedDate = getRelativeTimeString(new Date(trashBin.lastUpdated));

  return (
    <Link to={`/trash-bins/${trashBin._id}`} className="block">
      <div className={`bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition ${trashBin.isFull ? 'border-2 border-red-500' : ''}`}>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{trashBin.name}</h3>
              <p className="text-gray-600 text-sm">{trashBin.location}</p>
            </div>
            <span 
              className={`px-2 py-1 rounded text-xs text-white ${trashBin.isFull ? 'bg-red-500' : 'bg-green-500'}`}
            >
              {trashBin.isFull ? 'Full' : 'Available'}
            </span>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center text-sm mb-1">
              <span>Fill Level</span>
              <span>{Math.round(fillPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`${fillColor} h-2.5 rounded-full`} 
                style={{ width: `${fillPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            Last updated: {formattedDate}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TrashBinCard;