import { useEffect, useState } from "react";

const TrashStatus = () => {
  const [bins, setBins] = useState<{ binId: string; level: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBins = async () => {
      if (loading || bins.length > 0) return;
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/trash");
        if (!res.ok) throw new Error("Failed to fetch bins");
        const data = await res.json();
        setBins(data);
        setError(null);
      } catch (err) {
        setError("Error fetching trash bins");
      } finally {
        setLoading(false);
      }
    };

    fetchBins();
  }, [loading, bins.length]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => setBins([])}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Trạng thái thùng rác</h2>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : bins.length === 0 ? (
        <p className="text-gray-600">No bins available</p>
      ) : (
        bins.map((bin) => (
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
        ))
      )}
    </div>
  );
};

export default TrashStatus;