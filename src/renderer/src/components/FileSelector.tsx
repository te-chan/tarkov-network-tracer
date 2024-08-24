import React from 'react';

const FileSelector: React.FC<{ files: { fname: string, date: Date }[], onFileClick: (filePath: string) => void }> = ({ files, onFileClick }) => {
  return (
    <div className="mt-6">
      <label className="text-3xl font-bold text-blue-700">🎮プレイ一覧</label>
      <select onChange={(e) => onFileClick(e.target.value)} className="w-full p-3 border border-blue-500 rounded-lg bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600">
        <option value="">ログを選択してください</option>
        {files.sort((a, b) => a.date.getTime() - b.date.getTime()).map((file, index) => (
          <option key={index} value={file.fname}>
            {file.date.toLocaleDateString()} {file.date.toLocaleTimeString()} ({Math.floor((new Date().getTime() - file.date.getTime()) / 60000)} 分前)
          </option>
        ))}
      </select>
    </div>
  );
};

export default FileSelector;