import { Card, Badge, Table, PageHead } from '../../components/Ui.js';
import { clientInvoices } from '../../data/Mock.js';

export default function ClientBilling() {
  const rows = clientInvoices.map((r) => [r[0], r[1], r[2], <Badge status={r[3]} />]);

  return (
    <>
      <PageHead title="Billing" sub="Invoices and account balance." />
      <div className="grid-2">
        <Card title="Invoice history">
          <Table cols={['Invoice', 'Period', 'Amount', 'Status']} rows={rows} />
        </Card>
        <Card title="Current balance">
          <div style={{ fontSize: 30, fontWeight: 600, paddingTop: 10 }}>$0.00</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>Paid in full · next invoice Oct 1</div>
        </Card>
      </div>
    </>
  );
}