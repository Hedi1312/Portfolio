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

interface AdminReplyProps {
  recipientName: string;
  replyMessage: string;
}

export const AdminReply = ({ recipientName, replyMessage }: AdminReplyProps) => (
  <Html>
    <Head>
      <style>{`
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 16px !important; }
        }
      `}</style>
    </Head>
    <Preview>Réponse de Hëdi OKBA à votre message</Preview>
    <Body style={body}>
      <Container style={card} className="container">
        {/* Gradient header */}
        <Section style={header}>
          <Img
            src="https://img.icons8.com/fluency/96/reply-all-arrow.png"
            width="48"
            height="48"
            alt=""
            style={{ margin: '0 auto 12px' }}
          />
          <Text style={headerTitle}>Vous avez une réponse</Text>
          <Text style={headerSub}>Suite à votre message sur le portfolio</Text>
        </Section>

        {/* Content */}
        <Section style={content}>
          <Text style={greeting}>Bonjour {recipientName},</Text>

          {/* Reply box */}
          <Section style={replyCard}>
            <Text style={replyText}>{replyMessage}</Text>
          </Section>

          <Hr style={divider} />

          <Text style={signoff}>Cordialement,</Text>
          <Text style={signature}>Hëdi OKBA</Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Cette réponse a été envoyée depuis le portfolio de Hëdi OKBA.
          </Text>
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
const greeting = {
  color: '#4a5568',
  fontSize: '15px',
  margin: '0 0 16px',
  lineHeight: '22px',
};
const replyCard = {
  backgroundColor: '#f0fdfa',
  border: '1px solid #99f6e4',
  borderLeft: '4px solid #00bba7',
  borderRadius: '0 12px 12px 0',
  padding: '20px',
  marginBottom: '24px',
};
const replyText = {
  color: '#1a202c',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
};
const divider = {
  borderColor: '#e2e8f0',
  margin: '0 0 16px',
};
const signoff = {
  color: '#718096',
  fontSize: '14px',
  margin: '0',
  lineHeight: '20px',
};
const signature = {
  color: '#1a202c',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '4px 0 0',
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

export default AdminReply;
