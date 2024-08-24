import React from 'react';

const TraceRouteButton: React.FC<{ loading: boolean, onClick: () => void }> = ({ loading, onClick }) => {
  return (
    <div className="mt-4">
      <button
        onClick={onClick}
        className={`w-full p-3 ${loading ? 'bg-red-600' : 'bg-blue-600'} text-white rounded-lg hover:${loading ? 'bg-red-700' : 'bg-blue-700'} transition duration-200`}
      >
        {loading ? 'キャンセル' : '検索'}
      </button>
    </div>
  );
};

export default TraceRouteButton;