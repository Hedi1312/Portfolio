/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '@/app/sections/Contact';

// Mock next/navigation if needed
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock Server Action
jest.mock('@/actions/contact.action', () => ({
  submitContact: jest.fn(),
}));
import { submitContact } from '@/actions/contact.action';

jest.mock('framer-motion', () => {
  const React = require('react') as typeof import('react');

  const MockDiv = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { whileHover?: unknown; transition?: unknown }
  >(({ children, whileHover, transition, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  ));
  MockDiv.displayName = 'MockDiv';

  const MockSpan = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement> & { whileHover?: unknown; transition?: unknown }
  >(({ children, whileHover, transition, ...props }, ref) => (
    <span ref={ref} {...props}>
      {children}
    </span>
  ));
  MockSpan.displayName = 'MockSpan';

  return {
    m: {
      div: MockDiv,
      span: MockSpan,
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  };
});

// Mock umami global
beforeAll(() => {
  (global as unknown as { window: { umami: { track: jest.Mock } } }).window.umami = {
    track: jest.fn(),
  };
});

describe('Contact Component Frontend Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (submitContact as jest.Mock).mockResolvedValue({ success: true });
  });

  it('1. Renders the contact closed card initially', () => {
    render(<Contact />);

    // Check if the title is visible
    expect(screen.getByText('Discutons de ton projet')).toBeInTheDocument();

    // Check if the button to open exist
    expect(screen.getByRole('button', { name: /M'envoyer un message/i })).toBeInTheDocument();

    // The modal should NOT be open
    expect(screen.queryByText(/Contacte-moi/i)).not.toBeInTheDocument();
  });

  it('2. Opens the modal when clicking the button', async () => {
    render(<Contact />);

    const openButton = screen.getByRole('button', { name: /M'envoyer un message/i });
    fireEvent.click(openButton);

    expect(screen.getByText(/Contacte-moi/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Prénom NOM')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('exemple@exemple.com')).toBeInTheDocument();
  });

  it('3. Closes the modal on close button click', async () => {
    render(<Contact />);
    fireEvent.click(screen.getByRole('button', { name: /M'envoyer un message/i }));

    // Form is open
    expect(screen.getByText(/Contacte-moi/i)).toBeInTheDocument();

    // Find close icon button inside modal (not the button to open)
    const closeButtons = screen.getAllByRole('button');
    // The second button in the DOM is the modal's close X button (first is the trigger)
    fireEvent.click(closeButtons[1]);

    // Should remove modal from DOM (because of AnimatePresence mock rendering instantly)
    expect(screen.queryByText(/Contacte-moi/i)).not.toBeInTheDocument();
  });

  it('4. Rejects form submission if empty (client-side Zod validation)', async () => {
    render(<Contact />);
    fireEvent.click(screen.getByRole('button', { name: /M'envoyer un message/i }));

    const submitBtn = screen.getByRole('button', { name: 'Envoyer' });
    // Bypass HTML5 validation by triggering submit event directly on the form
    fireEvent.submit(submitBtn.closest('form')!);

    // Zod should trigger error. (Wait for state update)
    await waitFor(() => {
      expect(screen.getByText(/Le nom est requis/i)).toBeInTheDocument();
    });

    // Action should never be called
    expect(submitContact).not.toHaveBeenCalled();
  });

  it('5. Successfully submits form', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    fireEvent.click(screen.getByRole('button', { name: /M'envoyer un message/i }));

    // Fill the inputs
    await user.type(screen.getByPlaceholderText('Prénom NOM'), 'Test User');
    await user.type(screen.getByPlaceholderText('exemple@exemple.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Ex : Proposition de collaboration'), 'Sujet test');
    await user.type(screen.getByPlaceholderText('Ton message...'), 'Ceci est un message de test.');

    // Check if everything is filled
    expect(screen.getByPlaceholderText('Prénom NOM')).toHaveValue('Test User');

    // Mettre submit au bout de la promesse
    (submitContact as jest.Mock).mockResolvedValueOnce({ success: true });

    const submitBtn = screen.getByRole('button', { name: 'Envoyer' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitContact).toHaveBeenCalledTimes(1);
    });

    // Check payload details (it gets called with FormData object directly)
    const formDataArg = (submitContact as jest.Mock).mock.calls[0][1];
    expect(formDataArg.get('name')).toBe('Test User');
    expect(formDataArg.get('email')).toBe('test@example.com');
    expect(formDataArg.get('subject')).toBe('Sujet test');
    expect(formDataArg.get('message')).toBe('Ceci est un message de test.');
    expect(formDataArg.get('company')).toBe(''); // honeypot

    // Once success, it should show 'Message envoyé !'
    expect(screen.getByText('Message envoyé !')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Prénom NOM')).not.toBeInTheDocument();
  });

  it('6. Displays API error message if server returns error', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    fireEvent.click(screen.getByRole('button', { name: /M'envoyer un message/i }));

    await user.type(screen.getByPlaceholderText('Prénom NOM'), 'Test User');
    await user.type(screen.getByPlaceholderText('exemple@exemple.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Ex : Proposition de collaboration'), 'Sujet test');
    await user.type(screen.getByPlaceholderText('Ton message...'), 'Ceci est un message de test.');

    // Mock API error
    (submitContact as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'Erreur fictive serveur',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }));

    await waitFor(() => {
      expect(screen.getByText('Erreur fictive serveur')).toBeInTheDocument();
    });
  });

  it('7. Rejects files larger than 10MB', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    fireEvent.click(screen.getByRole('button', { name: /M'envoyer un message/i }));

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Create an 11MB file
    const largeFile = new File(['a'.repeat(11 * 1024 * 1024)], 'too-big.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    await user.upload(fileInput, largeFile);

    // the max size is 10 MB, should display error
    expect(screen.getByText(/Fichier\(s\) trop volumineux/i)).toBeInTheDocument();
    // the file should not be added to UI
    expect(screen.queryByText('too-big.pdf')).not.toBeInTheDocument();
  });

  it('8. Accepts valid files and displays their names', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    fireEvent.click(screen.getByRole('button', { name: /M'envoyer un message/i }));

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const validFile1 = new File(['hello'], 'cv.pdf', { type: 'application/pdf' });
    const validFile2 = new File(['hello'], 'avatar.png', { type: 'image/png' });

    await user.upload(fileInput, [validFile1, validFile2]);

    // Should display files
    expect(screen.getByText('cv.pdf')).toBeInTheDocument();
    expect(screen.getByText('avatar.png')).toBeInTheDocument();

    // Find remove icon (FiX) next to cv.pdf
    // Removing validFile1
    // The closest remove btn
    const cvElement = screen.getByText('cv.pdf');
    const removeIcon = cvElement.querySelector('button');
    fireEvent.click(removeIcon!);

    expect(screen.queryByText('cv.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('avatar.png')).toBeInTheDocument();
  });
});
