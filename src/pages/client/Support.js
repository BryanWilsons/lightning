import { Card, PageHead } from '../../components/Ui.js';

export default function ClientSupport() {
  return (
    <>
      <PageHead title="Support" sub="Answers and ways to reach us." />
      <div className="grid-2">
        <Card title="Common questions">
          <div className="list-item">
            <div className="t">How do I redirect a delayed package?</div>
          </div>
          <div className="list-item">
            <div className="t">Can I change a pickup window?</div>
          </div>
          <div className="list-item">
            <div className="t">Where do I dispute a charge?</div>
          </div>
        </Card>
        <Card title="Contact us">
          <div className="field">
            <label>Subject</label>
            <input className="input" />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea className="input" rows={4} />
          </div>
          <button className="btn accent">Send message</button>
        </Card>
      </div>
    </>
  );
}