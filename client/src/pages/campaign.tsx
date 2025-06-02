import { useQuery } from '@tanstack/react-query';
import { LineChart } from '@mui/x-charts/LineChart';
import { getFirestore, collection, query, where } from 'firebase/firestore';
import { useFirestoreCollectionData } from 'reactfire';

export default function CampaignPage() {
  const db = getFirestore();
  const campaignsRef = collection(db, 'campaigns');
  const { status, data } = useFirestoreCollectionData(campaignsRef);
  
  if (status === 'loading') return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Campaign Performance</h1>
      <LineChart
        xAxis={[{ data: data.map(d => new Date(d.timestamp?.seconds * 1000)) }]}
        series={[
          { data: data.map(d => d.metrics?.impressions || 0), label: 'Impressions' },
          { data: data.map(d => d.metrics?.clicks || 0), label: 'Clicks' },
        ]}
        height={400}
      />
    </div>
  );
}