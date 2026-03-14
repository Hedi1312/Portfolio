import * as React from 'react';
import { Html, Body, Head, Heading, Hr, Container, Preview, Text } from '@react-email/components';

interface AdminReplyProps {
  recipientName: string;
  replyMessage: string;
}

export const AdminReply = ({ recipientName, replyMessage }: AdminReplyProps) => (
  <Html>
    <Head />
    <Preview>Réponse de Hëdi OKBA</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📬 Réponse à votre message</Heading>
        <Text style={text}>Bonjour {recipientName},</Text>

        <Hr style={hr} />

        <Text style={paragraph}>{replyMessage}</Text>

        <Hr style={hr} />

        <Text style={footer}>— Hëdi OKBA</Text>
      </Container>
    </Body>
  </Html>
);

const main = { backgroundColor: '#ffffff', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' };
const h1 = { color: '#333', fontSize: '24px', fontWeight: 'bold' as const, paddingTop: '32px' };
const text = { color: '#333', fontSize: '16px', lineHeight: '26px' };
const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  backgroundColor: '#f4f4f4',
  padding: '15px',
  borderRadius: '5px',
  whiteSpace: 'pre-wrap' as const,
};
const footer = { color: '#999', fontSize: '14px', marginTop: '20px' };
const hr = { borderColor: '#dddddd', margin: '20px 0' };

export default AdminReply;
