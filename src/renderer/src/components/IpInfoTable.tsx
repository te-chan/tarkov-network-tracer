import React from 'react';

const IpInfoTable: React.FC<{ ipInfo: { ip: string, location: string }[] }> = ({ ipInfo }) => {
  return (
    <table className="mt-4 w-full border-collapse">
      <thead>
        <tr>
          <th className="border px-4 py-2 text-left">番号</th>
          <th className="border px-4 py-2 text-left">IPアドレス</th>
          <th className="border px-4 py-2 text-left">所在地</th>
        </tr>
      </thead>
      <tbody>
        {ipInfo.length > 0 ? (
          ipInfo.map((info, index) => (
            <tr key={index} className="border-b">
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">{info.ip}</td>
              <td className="border px-4 py-2">{info.location}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3} className="border px-4 py-2 text-gray-500 text-center">所在地情報がありません</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default IpInfoTable;