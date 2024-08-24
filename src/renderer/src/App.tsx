import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import FileSelector from './components/FileSelector'; // 新しいコンポーネント
import IpSelector from './components/IpSelector'; // 新しいコンポーネント
import TraceRouteButton from './components/TraceRouteButton'; // 新しいコンポーネント
import IpInfoTable from './components/IpInfoTable'; // 新しいコンポーネント

const App: React.FC = () => {
  const [files, setFiles] = useState<{ fname: string, date: Date }[]>([]);
  const [ipAddresses, setIpAddresses] = useState<string[]>([]);
  const [selectedIp, setSelectedIp] = useState<string>(''); // 選択されたIPアドレスを管理するステート
  const [loading, setLoading] = useState<boolean>(false); // ローディング状態を管理するステート
  const [tracertResults, setTracertResults] = useState<string[]>([]); // tracert結果を管理するステート
  const [ipInfo, setIpInfo] = useState<{ ip: string, location: string, loc: string }[]>([]); // IP情報を管理するステート
  const [locations, setLocations] = useState<{ lat: number, lng: number }[]>([]); // 緯度経度を管理するステート

  const dirPath = 'C:/Battlestate Games/Escape from Tarkov/Logs'; // ここに対象のディレクトリパスを指定

  useEffect(() => {
    const fetchFiles = async () => {
      const result = await window.electron.ipcRenderer.invoke('get-files', dirPath);
      console.log(result);
      setFiles(result);
    };

    fetchFiles();

    // tracertの出力を受信
    window.electron.ipcRenderer.on('tracert-ip', (_, data: string) => {
      console.log(data);
      setTracertResults((prevResults: string[]) => [...prevResults, data]); // リアルタイムで結果を追加
      // IPが見つかった場合にfetchIpInfoを呼び出す
      const match = data.match(/(\d+\.\d+\.\d+\.\d+)/);
      if (match) {
        fetchIpInfo(match[0]); // IP情報を取得
      }
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners('tracert-ip'); // クリーンアップ
    };
  }, []);

  const fetchIpInfo = async (ip: string) => {
    const info = await window.electron.ipcRenderer.invoke('get-ip-info', ip);
    setIpInfo((prevInfo) => [...prevInfo, info]); // IP情報を追加
    console.log(info);
    if (info.loc) {
      const [lat, lng] = info.loc.split(',').map(Number);
      console.log(locations);
      setLocations((prevLocations) => [...prevLocations, { lat, lng }]); // 緯度経度を追加
    }
  };

  const handleFileClick = async (filePath: string) => {
    const addresses = await window.electron.ipcRenderer.invoke('read-log', dirPath + '/' + filePath);
    console.log(addresses);
    setIpAddresses(addresses);
  };
  console.log(import.meta.env.VITE_GOOGLE_MAP_KEY)
  const execTraceRoute = async () => {
    if (selectedIp) { // 選択されたIPがある場合のみ実行
      setLoading(true); // ローディング開始
      setIpInfo([]); // 所在地情報リストを初期化
      setLocations([]); // 緯度経度リストを初期化
      await window.electron.ipcRenderer.invoke('tracert', selectedIp.split(':')[0]);
      setLoading(false); // ローディング終了
    } else {
      console.log("IP not selected");
    }
  };

  return (
    <div className="p-8 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-800">Tarkov network searcher</h1>
      <FileSelector files={files} onFileClick={handleFileClick} />
      <IpSelector ipAddresses={ipAddresses} onSelectIp={setSelectedIp} />
      <TraceRouteButton loading={loading} onClick={execTraceRoute} />
      
      <h2 className="text-3xl font-bold mt-6 text-blue-700 flex items-center">
        <div className={"h-8 w-8 bg-blue-300 rounded-xl mr-2" + (loading ? " animate-spin": "")}></div>IPと所在地情報
      </h2>

      <div className="mt-6">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_KEY}>
          <GoogleMap
            mapContainerStyle={{ height: "400px", width: "100%" }}
            center={locations.length > 0 ? locations[0] : { lat: 0, lng: 0 }}
            zoom={2}
          >
            {locations.map((location, index) => (
              <Marker key={index} position={location} />
            ))}
            {locations.length > 1 && locations.map((location, index) => {
              if (index < locations.length - 1) {
                return (
                  <Polyline
                    key={index}
                    path={[location, locations[index + 1]]}
                    options={{ strokeColor: "#FF0000", strokeOpacity: 0.8, strokeWeight: 2 }}
                  />
                );
              }
              return null;
            })}
          </GoogleMap>
        </LoadScript>
      </div>

      <IpInfoTable ipInfo={ipInfo} />
    </div>
  );
};

export default App;