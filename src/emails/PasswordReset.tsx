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
  Link,
} from '@react-email/components';

interface PasswordResetProps {
  resetLink: string;
}

export const PasswordReset = ({ resetLink }: PasswordResetProps) => (
  <Html>
    <Head>
      <style>{`
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 16px !important; }
        }
      `}</style>
    </Head>
    <Preview>🔒 Réinitialisation de ton mot de passe admin</Preview>
    <Body style={body}>
      <Container style={card} className="container">
        {/* Gradient header */}
        <Section style={header}>
          <Img
            src="https://img.icons8.com/fluency/96/lock-2.png"
            width="48"
            height="48"
            alt=""
            style={{ margin: '0 auto 12px' }}
          />
          <Text style={headerTitle}>Réinitialisation du mot de passe</Text>
          <Text style={headerSub}>Une demande de réinitialisation a été effectuée</Text>
        </Section>

        {/* Content */}
        <Section style={content}>
          <Text style={messageText}>
            Tu as demandé à réinitialiser ton mot de passe admin. Clique sur le bouton ci-dessous
            pour en définir un nouveau.
          </Text>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link href={resetLink} style={button}>
              Réinitialiser mon mot de passe
            </Link>
          </Section>

          <Hr style={divider} />

          <Text style={hint}>
            Ce lien est valable pendant <strong>1 heure</strong>. Si tu n&apos;as pas demandé cette
            réinitialisation, tu peux ignorer cet email.
          </Text>

          <Text style={linkFallback}>
            Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :
          </Text>
          <Text style={linkUrl}>{resetLink}</Text>
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
const messageText = {
  color: '#2d3748',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};
const buttonContainer = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
};
const button = {
  display: 'inline-block',
  backgroundColor: '#00bba7',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  padding: '14px 32px',
  borderRadius: '12px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};
const divider = {
  borderColor: '#e2e8f0',
  margin: '20px 0',
};
const hint = {
  color: '#718096',
  fontSize: '13px',
  textAlign: 'center' as const,
  margin: '0 0 16px',
  lineHeight: '20px',
};
const linkFallback = {
  color: '#a0aec0',
  fontSize: '11px',
  textAlign: 'center' as const,
  margin: '0 0 4px',
};
const linkUrl = {
  color: '#0d9488',
  fontSize: '11px',
  textAlign: 'center' as const,
  margin: '0',
  wordBreak: 'break-all' as const,
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

export default PasswordReset;
