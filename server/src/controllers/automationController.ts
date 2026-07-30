import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { automationLogs, sendAutomatedEmail } from '../services/automationService.js';

// Get automation logs
export const getLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json({ logs: automationLogs });
  } catch (error: any) {
    console.error('Error fetching automation logs:', error);
    res.status(500).json({ error: 'Failed to fetch automation logs' });
  }
};

// Scan clients and trigger automated renewal reminders (for renewals <= 30 days)
export const triggerRenewalCheck = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const clients = await prisma.client.findMany({
      include: { user: { select: { email: true, name: true } } },
    });

    const now = new Date().getTime();
    const alertDaysThreshold = 30;
    const triggered: any[] = [];

    for (const client of clients) {
      const renewalTime = new Date(client.renewalDate).getTime();
      const daysRemaining = Math.ceil((renewalTime - now) / (1000 * 3600 * 24));

      if (daysRemaining <= alertDaysThreshold) {
        const log = await sendAutomatedEmail({
          to: client.user.email,
          subject: `⚡ Renewal Alert: ${client.companyName} Website Maintenance & Hosting Renewal`,
          template: 'RENEWAL_WARNING',
          data: {
            companyName: client.companyName,
            renewalDate: client.renewalDate,
            daysRemaining,
          },
        });
        triggered.push({ client: client.companyName, daysRemaining, log });
      }
    }

    res.status(200).json({
      message: `Renewal audit completed. ${triggered.length} automated renewal notification(s) triggered.`,
      triggeredCount: triggered.length,
      triggeredDetails: triggered,
    });
  } catch (error: any) {
    console.error('Error triggering renewal audit:', error);
    res.status(500).json({ error: 'Failed to execute renewal automation scan' });
  }
};

// Send a test notification email
export const sendTestEmail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, type } = req.body;
    const recipient = email || 'client@platepixel.com';
    const template = type || 'WELCOME';

    const log = await sendAutomatedEmail({
      to: recipient,
      subject: `[Test Automation] ${template} Notification Trigger`,
      template,
      data: { test: true, timestamp: new Date().toISOString() },
    });

    res.status(200).json({ message: 'Test email automation dispatched', log });
  } catch (error: any) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
};
