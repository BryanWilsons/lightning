import { Card, Badge, Table, PageHead } from '../../components/Ui.js';
import { clientTracking } from '../../data/Mock.js';

export default function ClientTrack() {
  const rows = clientTracking.map((r) => [r[0], r[1], <Badge status={r[2]} />, r[3], r[4]]);

  return (
    <>
      {/* <PageHead title="Track mail" sub="Look up a shipment by tracking number." />
      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', gap: 10, paddingTop: 16 }}>
            <input className="input mono" placeholder="Enter a tracking number" />
            <button className="btn accent">Track</button>
          </div>
        </div>
      </div>
      <Card title="Your recent shipments">
        <Table cols={['Tracking #', 'Service', 'Status', 'Location', 'Est. date']} rows={rows} />
      </Card> */}
    </>
  );
}