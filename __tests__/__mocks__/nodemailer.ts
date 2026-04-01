/**
 * Nodemailer mock — prevents real emails from being sent during tests.
 *
 * The transporter.sendMail is a jest.fn() that resolves successfully by default.
 * Tests can override with mockRejectedValue to simulate email failures.
 */

const sendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });

const createTransport = jest.fn().mockReturnValue({
  sendMail,
});

const nodemailerMock = { createTransport };
export default nodemailerMock;
export { sendMail };
