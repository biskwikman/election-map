import MapView from './MapView';
import DataPanel from './DataPanel';
import ElectionExplorer from './ElectionExplorer';

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-row bg-white">
      <ElectionExplorer />
    </main>
  );
}
