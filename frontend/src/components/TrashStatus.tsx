import { useEffect, useState } from "react";

const TrashStatus = () => {
    const [bins, setBins] = useState<{ binId: string, level: number }[]>([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/trash") // Gọi API lấy danh sách thùng rác
            .then(res => res.json())
            .then(data => setBins(data));
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Trạng thái thùng rác</h2>

            {bins.map(bin => (
                <div key={bin.binId} className="mb-4 p-4 bg-gray-100 rounded-lg shadow">
                    <p className="font-semibold text-gray-700 mb-2">
                        Thùng {bin.binId} - <span className="text-gray-600">{bin.level}%</span>
                    </p>

                    <div className="w-full h-5 bg-gray-300 rounded-lg relative overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 rounded-lg ${
                                bin.level >= 80 ? "bg-red-500" : bin.level >= 50 ? "bg-yellow-500" : "bg-green-500"
                            }`} 
                            style={{ width: `${bin.level}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrashStatus;
