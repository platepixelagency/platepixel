import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../services/api';
import { 
  Zap, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Mail, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  ArrowRight,
  Bell,
  PhoneCall,
  MessageSquare
} from 'lucide-react';

interface AutomationLogItem {
  id: string;
  recipient: string;
  type: string;
  subject: string;
  status: 'SENT' | 'FAILED' | 'MOCKED_DEV';
  timestamp: string;
}

export const AutomationManagement: React.FC = () => {
  const [logs, setLogs] = useState<AutomationLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<string>('');

  // WhatsApp Test State
  const [waPhone, setWaPhone] = useState<string>('');
  const [waType, setWaType] = useState<string>('WELCOME');
  const [waSending, setWaSending] = useState<boolean>(false);

  const loadLogs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetchWithAuth<{ logs: AutomationLogItem[] }>('/automation/logs');
      setLogs(res.logs);
    } catch (err: any) {
      console.error('Failed to load automation logs:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const intervalId = setInterval(() => loadLogs(true), 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleTriggerRenewals = async () => {
    setScanning(true);
    setScanResult('');
    try {
      const res = await fetchWithAuth<any>('/automation/trigger-renewals', {
        method: 'POST',
      });
      setScanResult(res.message);
      loadLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to execute renewal scan');
    } finally {
      setScanning(false);
    }
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setWaSending(true);

    const phone = waPhone.trim().replace(/\D/g, '');
    const messages: Record<string, string> = {
      WELCOME:
        `🎉 Welcome to PlatePixel Agency!\n\nYour digital presence is now in expert hands. Our team will reach out shortly to kickstart your project.\n\nFor any queries, reply to this message.\n\n— PlatePixel Agency 🚀`,
      INVOICE_REMINDER:
        `📋 Invoice Reminder from PlatePixel Agency\n\nThis is a gentle reminder that your invoice is due. Please arrange payment at your earliest convenience.\n\nThank you for your prompt response!\n\n— PlatePixel Agency`,
      RENEWAL_WARNING:
        `⚠️ Domain / Hosting Renewal Alert!\n\nYour website hosting or domain renewal is coming up soon. Please renew to avoid any downtime.\n\nContact us if you need help.\n— PlatePixel Agency`,
      PROJECT_COMPLETION:
        `✅ Project Update from PlatePixel Agency\n\nGreat news! Your project milestone has been completed. Please review and share your feedback.\n\n— PlatePixel Agency 🎯`,
    };

    const msg = encodeURIComponent(messages[waType] || messages['WELCOME']);
    const url = phone.length >= 10
      ? `https://wa.me/${phone}?text=${msg}`
      : `https://wa.me/?text=${msg}`;

    window.open(url, '_blank');
    setTimeout(() => setWaSending(false), 1000);
  };

  const getTemplateBadge = (type: string) => {
    switch (type) {
      case 'WELCOME':
        return <span className="tag-pill bg-[#5683da]/20 text-[#5683da] border border-[#5683da]/30">WELCOME EMAIL</span>;
      case 'INVOICE_REMINDER':
        return <span className="tag-pill bg-amber-500/20 text-amber-400 border border-amber-500/30">INVOICE REMINDER</span>;
      case 'RENEWAL_WARNING':
        return <span className="tag-pill bg-[#ff8964]/20 text-[#ff8964] border border-[#ff8964]/30">RENEWAL ALERT</span>;
      case 'PROJECT_COMPLETION':
        return <span className="tag-pill bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PROJECT UPDATE</span>;
      default:
        return <span className="tag-pill bg-purple-500/20 text-purple-400">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Provider Status */}
        <div className="huly-card p-6 flex flex-col justify-between border-[#5683da]/40">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="tag-pill bg-[#5683da]/20 text-[#5683da] font-mono text-[10px]">Email Service Provider</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Mail className="w-5 h-5 text-[#5683da]" />
              <span>Resend Integration</span>
            </h3>
            <p className="text-xs text-[#95979e] mt-1">
              Automated transactional emails for onboarding welcome, invoice receipts, and renewal alerts.
            </p>
          </div>
          <div className="pt-4 text-xs font-mono text-emerald-400">
            ✓ Automation Triggers Operational
          </div>
        </div>

        {/* Card 2: 1-Click Renewal Audit Trigger */}
        <div className="huly-card p-6 flex flex-col justify-between border-[#ff8964]/40 bg-[#ff8964]/5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="tag-pill bg-[#ff8964]/20 text-[#ff8964] font-mono text-[10px]">Automated Cron Job</span>
              <Bell className="w-4 h-4 text-[#ff8964]" />
            </div>
            <h3 className="text-xl font-bold text-white">Renewal Notification Audit</h3>
            <p className="text-xs text-[#95979e] mt-1">
              Scans all active client domain & hosting renewal dates. Fires automated warning emails for accounts due in &lt;= 30 days.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleTriggerRenewals}
              disabled={scanning}
              className="btn-pill-primary w-full py-2.5 text-xs flex items-center justify-center space-x-2"
            >
              {scanning ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Run Renewal Audit Scan Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 3: WhatsApp Notification Sender */}
        <div className="huly-card p-6 flex flex-col justify-between border-green-500/30 bg-green-500/5">
          <div>
            <span className="tag-pill bg-green-500/20 text-green-400 font-mono text-[10px] uppercase">WhatsApp Notifier</span>
            <h3 className="text-xl font-bold text-white mt-2 flex items-center space-x-2">
              <PhoneCall className="w-5 h-5 text-green-400" />
              <span>Send WhatsApp Alert</span>
            </h3>
            <p className="text-xs text-[#95979e] mt-1">Send a pre-built notification message directly to a client's WhatsApp number.</p>
            <form onSubmit={handleSendWhatsApp} className="mt-3 space-y-3 text-xs">
              <input
                type="tel"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                placeholder="+91 98765 43210 (with country code)"
                className="huly-input"
              />
              <select
                value={waType}
                onChange={(e) => setWaType(e.target.value)}
                className="huly-input"
              >
                <option value="WELCOME">🎉 Welcome Message</option>
                <option value="INVOICE_REMINDER">📋 Invoice Reminder</option>
                <option value="RENEWAL_WARNING">⚠️ Renewal Warning</option>
                <option value="PROJECT_COMPLETION">✅ Project Completion</option>
              </select>
              <button
                type="submit"
                disabled={waSending}
                className="btn-pill-primary w-full py-2.5 text-xs flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{waSending ? 'Opening WhatsApp…' : 'Send via WhatsApp'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {scanResult && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-400 text-xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{scanResult}</span>
        </div>
      )}

      {/* Automation Dispatch Logs Data Table */}
      <div className="huly-card overflow-hidden">
        <div className="p-6 border-b border-[#4a4b50]/40 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white">Automated Notification Logs</h3>
            <p className="text-xs text-[#95979e]">Real-time history of dispatched email notifications and triggers.</p>
          </div>
          <span className="text-xs font-mono text-[#5683da]">{logs.length} Logged Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090a0c] text-[#95979e] uppercase font-mono border-b border-[#4a4b50]/60">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Template / Trigger</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Subject</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4a4b50]/40 font-mono">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-[#090a0c]/50 transition-colors">
                  <td className="p-4 text-[#95979e]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-sans">{getTemplateBadge(log.type)}</td>
                  <td className="p-4 text-[#5683da]">{log.recipient}</td>
                  <td className="p-4 text-white font-sans truncate max-w-xs">{log.subject}</td>
                  <td className="p-4 text-right">
                    <span className={`tag-pill text-[10px] ${
                      log.status === 'SENT'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
