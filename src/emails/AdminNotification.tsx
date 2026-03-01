import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Hr,
  Container,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface AdminNotificationProps {
  name: string;
  email: string;
  message: string;
}

export const AdminNotification = ({ name, email, message }: AdminNotificationProps) => (
  <Html>
    <Head />
    <Preview>Nouveau message de {name} sur ton portfolio</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📩 Nouveau Contact</Heading>
        <Text style={text}>Tu as reçu un nouveau message depuis ton portfolio.</Text>

        <Section style={section}>
          <Text style={field}>
            <strong>Nom :</strong> {name}
          </Text>
          <Text style={field}>
            <strong>Email :</strong> {email}
          </Text>
        </Section>

        <Hr style={hr} />

        <Heading as="h3" style={h3}>
          Message :
        </Heading>
        <Text style={paragraph}>{message}</Text>
      </Container>
    </Body>
  </Html>
);

const main = { backgroundColor: '#ffffff', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' };
const h1 = { color: '#333', fontSize: '24px', fontWeight: 'bold', paddingTop: '32px' };
const h3 = { color: '#333', fontSize: '18px', fontWeight: 'bold' };
const text = { color: '#333', fontSize: '16px', lineHeight: '26px' };
const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  backgroundColor: '#f4f4f4',
  padding: '15px',
  borderRadius: '5px',
};
const section = {
  padding: '24px',
  border: 'solid 1px #dedede',
  borderRadius: '5px',
  textAlign: 'left' as const,
};
const field = { margin: '5px 0' };
const hr = { borderColor: '#dddddd', margin: '20px 0' };

export default AdminNotification;
