import * as React from 'react';
import { Html, Body, Head, Container, Preview, Text, Hr } from '@react-email/components';

interface AdminNotificationProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const AdminNotification = ({ name, email, subject, message }: AdminNotificationProps) => (
  <Html>
    <Head>
      <style>{`
        @media only screen and (max-width: 600px) {
          .inner-table td { padding: 32px 24px !important; }
        }
      `}</style>
    </Head>
    <Preview>Nouveau message de {name}</Preview>
    <Body style={body}>
      <Container style={container}>
        <table
          width="100%"
          border={0}
          cellPadding="0"
          cellSpacing="0"
          role="presentation"
          className="inner-table"
        >
          <tbody>
            <tr>
              <td style={contentPadding}>
                <div style={header}>
                  <Text style={metaText}>NOTIFICATION</Text>
                  <Text style={h1}>Nouveau contact</Text>
                </div>

                <div style={metadataBox}>
                  {subject && (
                    <Text style={subjectTitle}>{subject}</Text>
                  )}
                  <Text style={dataRow}>
                    <strong style={label}>De :</strong> {name}
                  </Text>
                  <Text style={dataRow}>
                    <strong style={label}>Email :</strong> {email}
                  </Text>
                </div>

                <div style={messageBox}>
                  <Text style={metaTextAction}>Message :</Text>
                  <Text style={p}>{message}</Text>
                </div>

                <Hr style={divider} />

                <div style={footer}>
                  <Text style={footerText}>Message reçu depuis le formulaire du portfolio.</Text>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </Container>
    </Body>
  </Html>
);

const body = {
  backgroundColor: '#f6f9fc',
  color: '#334155',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: '0',
  padding: '60px 0',
};

const container = {
  margin: '0 auto',
  backgroundColor: '#ffffff',
  maxWidth: '560px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden' as const,
};

const contentPadding = {
  padding: '48px 40px',
};

const header = { paddingBottom: '24px', borderBottom: '1px solid #f1f5f9', marginBottom: '32px' };
const metaText = {
  fontSize: '13px',
  color: '#00d5be',
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
  fontWeight: '600' as const,
};
const h1 = {
  fontSize: '24px',
  fontWeight: '600' as const,
  margin: '0',
  color: '#0f172a',
  letterSpacing: '-0.5px',
};

const metadataBox = {
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  marginBottom: '32px',
};
const subjectTitle = {
  fontSize: '18px',
  fontWeight: '700' as const,
  color: '#0f172a',
  margin: '0 0 16px',
  lineHeight: '24px',
};
const dataRow = { fontSize: '14px', margin: '0 0 10px', color: '#0f172a', lineHeight: '20px' };
const label = {
  color: '#64748b',
  fontWeight: '500' as const,
  display: 'inline-block',
  width: '80px',
};

const messageBox = { marginBottom: '32px' };
const metaTextAction = {
  fontSize: '13px',
  color: '#64748b',
  fontWeight: '500' as const,
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};
const p = {
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0',
  color: '#334155',
  whiteSpace: 'pre-wrap' as const,
};

const divider = { borderColor: '#e2e8f0', margin: '0 0 24px' };
const footer = { paddingTop: '0' };
const footerText = { fontSize: '13px', color: '#94a3b8', margin: '0' };

export default AdminNotification;
