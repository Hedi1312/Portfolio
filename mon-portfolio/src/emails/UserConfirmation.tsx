import * as React from 'react';
import { Html, Body, Head, Heading, Container, Preview, Text, Link, Hr } from '@react-email/components';

interface UserConfirmationProps {
    name: string;
}

export const UserConfirmation = ({ name }: UserConfirmationProps) => (
    <Html>
        <Head />
        <Preview>Merci de m&apos;avoir contacté !</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Salut {name} ! 👋</Heading>
                <Text style={text}>
                    Merci d&apos;avoir visité mon portfolio et d&apos;avoir pris le temps de m&apos;écrire.
                </Text>
                <Text style={text}>
                    J&apos;ai bien reçu ton message et je reviendrai vers toi très rapidement.
                </Text>

                <Hr style={hr} />

                <Text style={footer}>
                    En attendant, tu peux revoir mes projets sur <Link href="https://hedi-okba.fr" style={link}>hedi-okba.fr</Link>.
                </Text>
                <Text style={footer}>Cordialement,<br/>Hëdi OKBA</Text>
            </Container>
        </Body>
    </Html>
);

const main = { backgroundColor: '#ffffff', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' };
const h1 = { color: '#1a1a1a', fontSize: '24px', fontWeight: 'bold', paddingTop: '32px' };
const text = { color: '#444', fontSize: '16px', lineHeight: '26px' };
const link = { color: '#2563eb', textDecoration: 'underline' };
const hr = { borderColor: '#dddddd', margin: '20px 0' };
const footer = { color: '#8898aa', fontSize: '14px', lineHeight: '22px' };

export default UserConfirmation;