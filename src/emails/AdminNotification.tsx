import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Container,
  Preview,
  Section,
  Text,
  Hr,
  Img,
} from '@react-email/components';

interface AdminNotificationProps {
  name: string;
  email: string;
  message: string;
}

export const AdminNotification = ({ name, email, message }: AdminNotificationProps) => (
  <Html>
    <Head>
      <style>{`
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 16px !important; }
        }
      `}</style>
    </Head>
    <Preview>💬 {name} t&apos;a écrit sur ton portfolio</Preview>
    <Body style={body}>
      <Container style={card} className="container">
        {/* Gradient header */}
        <Section style={header}>
          <Img
            src="https://img.icons8.com/fluency/96/new-message.png"
            width="48"
            height="48"
            alt=""
            style={{ margin: '0 auto 12px' }}
          />
          <Text style={headerTitle}>Nouveau message</Text>
          <Text style={headerSub}>Quelqu&apos;un t&apos;a contacté via ton portfolio</Text>
        </Section>

        {/* Content */}
        <Section style={content}>
          {/* Sender info */}
          <table style={senderTable}>
            <tbody>
              <tr>
                <td style={avatar}>{name.charAt(0).toUpperCase()}</td>
                <td style={{ paddingLeft: '14px' }}>
                  <Text style={senderName}>{name}</Text>
                  <Text style={senderEmail}>{email}</Text>
                </td>
              </tr>
            </tbody>
          </table>

          <Hr style={divider} />

          {/* Message */}
          <Section style={messageCard}>
            <Text style={messageText}>{message}</Text>
          </Section>

          {/* Action hint */}
          <Text style={hint}>
            Réponds directement depuis ton dashboard admin ou en répondant à cet email.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>Portfolio — Notification automatique</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const body = {
  backgroundColor: '#edf2f7',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 16px',
  margin: '0',
};
const card = {
  maxWidth: '520px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  overflow: 'hidden' as const,
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
};
const header = {
  background: 'linear-gradient(135deg, #0d9488 0%, #00bba7 50%, #06b6d4 100%)',
  padding: '36px 32px 28px',
  textAlign: 'center' as const,
};
const headerTitle = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '700' as const,
  margin: '0 0 4px',
  letterSpacing: '-0.3px',
};
const headerSub = {
  color: 'rgba(255,255,255,0.8)',
  fontSize: '13px',
  margin: '0',
};
const content = {
  padding: '28px 32px 20px',
};
const senderTable = {
  width: '100%' as const,
  borderCollapse: 'collapse' as const,
};
const avatar = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: '#00bba7',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '700' as const,
  textAlign: 'center' as const,
  verticalAlign: 'middle' as const,
  lineHeight: '44px',
};
const senderName = {
  color: '#1a202c',
  fontSize: '15px',
  fontWeight: '600' as const,
  margin: '0',
  lineHeight: '20px',
};
const senderEmail = {
  color: '#718096',
  fontSize: '13px',
  margin: '2px 0 0',
  lineHeight: '18px',
};
const divider = {
  borderColor: '#e2e8f0',
  margin: '20px 0',
};
const messageCard = {
  backgroundColor: '#f7fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '20px',
};
const messageText = {
  color: '#2d3748',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
};
const hint = {
  color: '#a0aec0',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
};
const footer = {
  backgroundColor: '#f7fafc',
  padding: '16px 32px',
  borderTop: '1px solid #e2e8f0',
};
const footerText = {
  color: '#a0aec0',
  fontSize: '11px',
  textAlign: 'center' as const,
  margin: '0',
};

export default AdminNotification;
