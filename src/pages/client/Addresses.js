import { Card, Table, PageHead } from '../../components/Ui.js';
import { clientAddresses } from '../../data/Mock.js';

export default function ClientAddresses() {
  return (
    <>
      <PageHead title="Address book" sub="Saved pickup and delivery addresses." />
      <Card title="Saved addresses">
        <Table cols={['Label', 'Address', 'Default']} rows={clientAddresses} />
      </Card>
    </>
  );
}