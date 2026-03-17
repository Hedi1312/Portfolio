import * as React from 'react';
import {
  Html,
  Body,
  Head,
  Container,
  Preview,
  Section,
  Text,
  Link,
  Hr,
  Img,
} from '@react-email/components';

interface UserConfirmationProps {
  name: string;
}

export const UserConfirmation = ({ name }: UserConfirmationProps) => (
  <Html>
    <Head>
      <style>{`
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 16px !important; }
        }
      `}</style>
    </Head>
    <Preview>Merci pour ton message {name} ! Je te réponds vite 🚀</Preview>
    <Body style={body}>
      <Container style={card} className="container">
        {/* Gradient header */}
        <Section style={header}>
          <Img
            src="https://img.icons8.com/fluency/96/checkmark.png"
            width="48"
            height="48"
            alt=""
            style={{ margin: '0 auto 12px' }}
          />
          <Text style={headerTitle}>Message bien reçu !</Text>
          <Text style={headerSub}>Merci de m&apos;avoir contacté</Text>
        </Section>

        {/* Content */}
        <Section style={content}>
          <Text style={greeting}>Salut {name} 👋</Text>

          <Text style={text}>
            Ton message a bien été reçu ! Je le lis attentivement et je te répondrai dans les plus
            brefs délais.
          </Text>

          <Text style={text}>
            En attendant, n&apos;hésite pas à jeter un œil à mes derniers projets :
          </Text>

          {/* CTA */}
          <Section style={ctaSection}>
            <Link href="https://hedi-okba.fr" style={ctaButton}>
              Voir mes projets →
            </Link>
          </Section>

          <Hr style={divider} />

          <Text style={signoff}>À très vite,</Text>
          <Text style={signature}>Hëdi OKBA</Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>Cet email est une confirmation automatique de réception.</Text>
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
  color: '#1a202c',
  fontSize: '17px',
  fontWeight: '600' as const,
  margin: '0 0 16px',
};
const text = {
  color: '#4a5568',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 12px',
};
const ctaSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
};
const ctaButton = {
  backgroundColor: '#00bba7',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '14px 32px',
  borderRadius: '10px',
  textDecoration: 'none',
  display: 'inline-block' as const,
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

export default UserConfirmation;
