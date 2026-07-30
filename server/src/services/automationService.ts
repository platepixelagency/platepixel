import dotenv from 'dotenv';
dotenv.config();

export interface EmailPayload {
  to: string;
  subject: string;
  template: 'WELCOME' | 'INVOICE_REMINDER' | 'RENEWAL_WARNING' | 'PROJECT_COMPLETION' | 'TICKET_UPDATE';
  data: Record<string, any>;
}

export interface AutomationLog {
  id: string;
  recipient: string;
  type: string;
  subject: string;
  status: 'SENT' | 'FAILED' | 'MOCKED_DEV';
  timestamp: string;
}

// In-memory automation log store for dev & monitoring
export const automationLogs: AutomationLog[] = [
  {
    id: 'aut-001',
    recipient: 'alex@riversbistro.com',
    type: 'WELCOME',
    subject: 'Welcome to PlatePixel Agency Client Portal!',
    status: 'SENT',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'aut-002',
    recipient: 'alex@riversbistro.com',
    type: 'INVOICE_REMINDER',
    subject: 'Invoice INV-2026-1001 Payment Receipt Confirmation',
    status: 'SENT',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const sendAutomatedEmail = async (payload: EmailPayload): Promise<AutomationLog> => {
  console.log(`✉️  [AUTOMATION ENGINE] Firing ${payload.template} email to ${payload.to}`);
  console.log(`   Subject: ${payload.subject}`);
  console.log(`   Payload Data:`, JSON.stringify(payload.data));

  const log: AutomationLog = {
    id: `aut-${Math.floor(1000 + Math.random() * 9000)}`,
    recipient: payload.to,
    type: payload.template,
    subject: payload.subject,
    status: process.env.RESEND_API_KEY ? 'SENT' : 'MOCKED_DEV',
    timestamp: new Date().toISOString(),
  };

  automationLogs.unshift(log);
  return log;
};
