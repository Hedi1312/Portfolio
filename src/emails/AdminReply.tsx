import * as React from 'react';
import { Html, Body, Head, Container, Preview, Text, Hr } from '@react-email/components';

interface AdminReplyProps {
  recipientName: string;
  replyMessage: string;
}

export const AdminReply = ({ recipientName, replyMessage }: AdminReplyProps) => (
  <Html>
    <Head />
    <Preview>Réponse de Hëdi OKBA à votre message</Preview>
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
                  <Text style={metaText}>PORTFOLIO</Text>
                  <Text style={h1}>Nouvelle réponse</Text>
                </div>

                <div style={content}>
                  <Text style={greeting}>Bonjour {recipientName},</Text>

                  <div style={replyCard}>
                    <Text style={replyText}>{replyMessage}</Text>
                  </div>
                </div>

                <Hr style={divider} />

                <div style={footer}>
                  <Text style={signature}>Hëdi OKBA</Text>
                  <Text style={footerText}>
                    Cette réponse a été envoyée depuis mon portfolio personnel.
                  </Text>
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

const content = { paddingTop: '0' };
const greeting = {
  fontSize: '15px',
  fontWeight: '500' as const,
  color: '#0f172a',
  margin: '0 0 24px',
  lineHeight: '22px',
};

const replyCard = {
  borderLeft: '3px solid #00d5be',
  padding: '16px 20px',
  backgroundColor: '#f8fafc',
  borderRadius: '4px',
  marginBottom: '32px',
};
const replyText = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
};

const divider = { borderColor: '#e2e8f0', margin: '0 0 24px' };
const footer = { paddingTop: '0' };
const signature = {
  fontSize: '15px',
  fontWeight: '600' as const,
  margin: '0 0 4px',
  color: '#0f172a',
};
const footerText = { fontSize: '13px', color: '#94a3b8', margin: '0' };

export default AdminReply;
