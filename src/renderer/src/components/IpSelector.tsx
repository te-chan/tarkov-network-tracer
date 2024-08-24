import React from 'react';

const IpSelector: React.FC<{ ipAddresses: string[], onSelectIp: (ip: string) => void }> = ({ ipAddresses, onSelectIp }) => {
  return (
    <div className="mt-6">
      <label className="text-3xl font-bold text-blue-700">🗺️接続先一覧</label>
      <select
        className="mt-2 w-full p-3 border border-blue-500 rounded-lg bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        onChange={(e) => onSelectIp(e.target.value)}
      >
        <option value="">IPアドレスを選択してください</option>
        {ipAddresses.length > 0 ? (
          ipAddresses.map((ip, index) => (
            <option key={index} value={ip} className="text-gray-700">{ip}</option>
          ))
        ) : (
          <option className="text-gray-500" disabled>IPアドレスがありません</option>
        )}
      </select>
    </div>
  );
};

export default IpSelector;