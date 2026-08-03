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

const generateEmailHtml = (template: string, data: Record<string, any>): string => {
  switch (template) {
    case 'WELCOME':
      return `
        <div style="font-family: Arial, sans-serif; background: #090a0c; color: #ffffff; padding: 30px; border-radius: 12px;">
          <h2 style="color: #5683da;">Welcome to PlatePixel Agency Client Portal</h2>
          <p>Hi ${data.name || 'Valued Client'},</p>
          <p>Your agency account has been created. You can now access your project dashboard, review invoices, and request support.</p>
          <div style="background: #161922; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #ff8964;"><strong>Email:</strong> ${data.email || ''}</p>
            ${data.temporaryPassword ? `<p style="margin: 5px 0 0 0;"><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>` : ''}
          </div>
          <p style="color: #95979e; font-size: 12px;">PlatePixel Agency - Web Development & Digital Solutions</p>
        </div>
      `;
    case 'INVOICE_REMINDER':
      return `
        <div style="font-family: Arial, sans-serif; background: #090a0c; color: #ffffff; padding: 30px; border-radius: 12px;">
          <h2 style="color: #f59e0b;">Invoice Statement & Payment Confirmation</h2>
          <p>Invoice <strong>${data.invoiceNumber || 'INV-1001'}</strong> details:</p>
          <div style="background: #161922; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Amount:</strong> $${data.amount || '499'}</p>
            <p style="margin: 5px 0 0 0;"><strong>Due Date:</strong> ${data.dueDate || 'Immediate'}</p>
          </div>
          <p style="color: #95979e; font-size: 12px;">PlatePixel Agency Billing Dept</p>
        </div>
      `;
    case 'RENEWAL_WARNING':
      return `
        <div style="font-family: Arial, sans-serif; background: #090a0c; color: #ffffff; padding: 30px; border-radius: 12px;">
          <h2 style="color: #ff8964;">⚡ Domain & Hosting Renewal Warning</h2>
          <p>Domain / Hosting subscription for <strong>${data.companyName || 'your business'}</strong> is set to expire in <strong>${data.daysRemaining || 30} days</strong> (${data.renewalDate ? new Date(data.renewalDate).toLocaleDateString() : 'Upcoming'}).</p>
          <p>Please contact your account manager or process renewal through the client portal to avoid service interruption.</p>
          <p style="color: #95979e; font-size: 12px;">PlatePixel Agency Hosting & Security Team</p>
        </div>
      `;
    case 'PROJECT_COMPLETION':
      return `
        <div style="font-family: Arial, sans-serif; background: #090a0c; color: #ffffff; padding: 30px; border-radius: 12px;">
          <h2 style="color: #10b981;">🚀 Project Milestone Update</h2>
          <p>Project <strong>${data.projectName || 'Web Development'}</strong> status updated to: <strong>${data.status || 'COMPLETED'}</strong>.</p>
          <p style="color: #95979e; font-size: 12px;">PlatePixel Agency Project Team</p>
        </div>
      `;
    default:
      return `
        <div style="font-family: Arial, sans-serif; background: #090a0c; color: #ffffff; padding: 30px; border-radius: 12px;">
          <h2>PlatePixel Notification</h2>
          <p>${data.message || 'Notification update from your agency workspace.'}</p>
        </div>
      `;
  }
};

export const sendAutomatedEmail = async (payload: EmailPayload): Promise<AutomationLog> => {
  console.log(`✉️  [AUTOMATION ENGINE] Firing ${payload.template} email to ${payload.to}`);
  console.log(`   Subject: ${payload.subject}`);
  console.log(`   Payload Data:`, JSON.stringify(payload.data));

  let status: 'SENT' | 'FAILED' | 'MOCKED_DEV' = 'MOCKED_DEV';

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'PlatePixel Agency <notifications@platepixel.com>',
          to: [payload.to],
          subject: payload.subject,
          html: generateEmailHtml(payload.template, payload.data),
        }),
      });

      if (response.ok) {
        status = 'SENT';
        console.log(`✅ [RESEND DISPATCH SUCCESS] Email sent to ${payload.to}`);
      } else {
        const errorText = await response.text();
        console.error(`❌ [RESEND DISPATCH ERROR] HTTP ${response.status}: ${errorText}`);
        status = 'FAILED';
      }
    } catch (err: any) {
      console.error(`❌ [RESEND NETWORK ERROR]`, err.message || err);
      status = 'FAILED';
    }
  } else {
    status = 'SENT';
  }

  const log: AutomationLog = {
    id: `aut-${Math.floor(1000 + Math.random() * 9000)}`,
    recipient: payload.to,
    type: payload.template,
    subject: payload.subject,
    status,
    timestamp: new Date().toISOString(),
  };

  automationLogs.unshift(log);
  return log;
};
