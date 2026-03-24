import * as React from 'react';
import { Html, Body, Head, Container, Preview, Text, Hr, Link } from '@react-email/components';

interface PasswordResetProps {
  resetLink: string;
}

export const PasswordReset = ({ resetLink }: PasswordResetProps) => (
  <Html>
    <Head>
      <style>{`
        @media only screen and (max-width: 600px) {
          .inner-table td { padding: 32px 24px !important; }
        }
      `}</style>
    </Head>
    <Preview>Demande de réinitialisation de mot de passe</Preview>
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
                  <Text style={metaTextWarning}>SÉCURITÉ</Text>
                  <Text style={h1}>Réinitialisation accès</Text>
                </div>

                <div style={content}>
                  <Text style={p}>
                    Bonjour,
                    <br />
                    <br />
                    Une demande de réinitialisation de mot de passe pour votre compte administrateur
                    a été effectuée. Si vous en êtes l&apos;auteur, veuillez cliquer sur le bouton
                    ci-dessous. Le lien expirera dans 10 minutes.
                  </Text>

                  <div style={ctaSection}>
                    <Link href={resetLink} style={button}>
                      Réinitialiser mon mot de passe
                    </Link>
                  </div>

                  <div style={fallbackBox}>
                    <Text style={metaTextLabel}>Lien direct :</Text>
                    <Text style={rawLink}>{resetLink}</Text>
                  </div>
                </div>

                <Hr style={divider} />

                <div style={footer}>
                  <Text style={footerText}>
                    Message généré par le système de sécurité portfolio.
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
const metaTextWarning = {
  fontSize: '13px',
  color: '#ef4444',
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
const p = { fontSize: '15px', lineHeight: '26px', margin: '0 0 32px', color: '#475569' };

const ctaSection = { margin: '0 0 36px 0', textAlign: 'center' as const };
const button = {
  backgroundColor: '#ef4444',
  color: '#ffffff',
  fontSize: '14px',
  padding: '14px 32px',
  borderRadius: '6px',
  display: 'inline-block',
  textDecoration: 'none',
  fontWeight: '500' as const,
  letterSpacing: '0.2px',
};

const fallbackBox = {
  backgroundColor: '#fafafa',
  border: '1px solid #f1f5f9',
  padding: '16px 20px',
  borderRadius: '6px',
  marginBottom: '32px',
};
const metaTextLabel = {
  fontSize: '12px',
  color: '#64748b',
  margin: '0 0 8px',
  fontWeight: '500' as const,
};
const rawLink = {
  fontSize: '12px',
  color: '#ef4444',
  wordBreak: 'break-all' as const,
  margin: '0',
  lineHeight: '18px',
};

const divider = { borderColor: '#e2e8f0', margin: '0 0 24px' };
const footer = { paddingTop: '0' };
const footerText = { fontSize: '13px', color: '#94a3b8', margin: '0' };

export default PasswordReset;
