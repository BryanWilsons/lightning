import { Card, Badge, PageHead } from '../../components/Ui.js';

export default function ClientPickups() {
  return (
    <>
      <PageHead
        title="Pickups"
        sub="Manage scheduled carrier pickups."
        action={<button className="btn accent">Schedule a pickup</button>}
      />
      <Card title="Upcoming">
        <div className="list-item">
          <div>
            <div className="t">Sep 27 · 10:00 AM – 12:00 PM</div>
            <div className="s">214 Palmwood Ave, Pinellas Park</div>
          </div>
          <Badge status="Scheduled" />
        </div>
        <div className="list-item">
          <div>
            <div className="t">Sep 30 · 1:00 PM – 3:00 PM</div>
            <div className="s">900 Bayline Dr Suite 4, Tampa</div>
          </div>
          <Badge status="Pending" />
        </div>
      </Card>
    </>
  );
}