import * as React from 'react';
import { Html, Body, Head, Container, Preview, Text, Link, Hr } from '@react-email/components';

interface UserConfirmationProps {
  name: string;
}

export const UserConfirmation = ({ name }: UserConfirmationProps) => (
  <Html>
    <Head>
      <style>{`
        @media only screen and (max-width: 600px) {
          .inner-table td { padding: 32px 24px !important; }
        }
      `}</style>
    </Head>
    <Preview>Message reçu, {name} - Hëdi OKBA</Preview>
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
                  <Text style={h1}>Message reçu</Text>
                </div>

                <div style={content}>
                  <Text style={p}>Bonjour {name},</Text>
                  <Text style={p}>
                    Je te confirme avoir bien reçu ton message. Je prends le temps de le lire avec
                    attention et je reviens vers toi dans les plus brefs délais avec une véritable
                    réponse.
                  </Text>

                  <div style={ctaSection}>
                    <Link href="https://hedi-okba.fr" style={button}>
                      Retourner sur le site
                    </Link>
                  </div>
                </div>

                <Hr style={divider} />

                <div style={footer}>
                  <Text style={signature}>Hëdi OKBA</Text>
                  <Text style={footerText}>Ceci est un accusé de réception automatique.</Text>
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
const p = { fontSize: '15px', lineHeight: '26px', margin: '0 0 20px', color: '#475569' };

const ctaSection = { marginTop: '36px', marginBottom: '36px', textAlign: 'center' as const };
const button = {
  backgroundColor: '#0f172a',
  color: '#ffffff',
  fontSize: '14px',
  padding: '14px 32px',
  borderRadius: '6px',
  display: 'inline-block',
  textDecoration: 'none',
  fontWeight: '500' as const,
  letterSpacing: '0.2px',
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

export default UserConfirmation;
