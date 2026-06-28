"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileDown, Mail, Settings, CheckCircle, Loader2, X, AlertCircle, Calendar, Shield, Clock,
  Sliders, UserPlus, Info, Copy, Eye, Send, Play, Bold, Italic, Underline, List, ListOrdered, Link, Globe
} from 'lucide-react';

export default function ReportNavbar({ activeOrg = 'officemate' }) {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('email'); // 'email' or 'schedule'
  const [toast, setToast] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [insertTagDropdownOpen, setInsertTagDropdownOpen] = useState(false);

  const handleOrgChange = (newOrg) => {
    document.cookie = `active_org=${newOrg}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    window.location.href = `/?org=${newOrg}`;
  };

  const handleLogoUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('org', activeOrg);
    formData.append('type', type);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Logo uploaded successfully! Refreshing page...`, 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      showToast(err.message || 'Failed to upload logo image.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Email Config State
  const [emailConfig, setEmailConfig] = useState({
    to: 'noreply@tracthai.com',
    cc: '',
    subject: '',
    body: ''
  });

  const [ccEmails, setCcEmails] = useState([]);

  const setCcEmailsWithConfig = (emails) => {
    setCcEmails(emails);
    setEmailConfig(prev => ({ ...prev, cc: emails.join(', ') }));
  };

  const subjectTemplatesList = [
    {
      id: 'english',
      title: 'NinjaOne Monthly Report (English)',
      template: 'NinjaOne Monthly Report - OfficeMate ({monthName} {year})',
      description: 'Standard English subject line containing report month and year.'
    },
    {
      id: 'thai',
      title: 'รายงานสรุประบบ NinjaOne (Thai)',
      template: 'รายงานสรุปผลการทำงาน NinjaOne ประจำเดือน {monthNameThai} {yearThai}',
      description: 'รายงานระบบประจำเดือนภาษาไทย แสดงชื่อเดือนและปี พ.ศ.'
    }
  ];

  // PDF Filename Template State
  const [fileNameTemplate, setFileNameTemplate] = useState('report-{fromShort}-{untilShort}.pdf');

  // Schedule Config State
  const [scheduleConfig, setScheduleConfig] = useState({
    enabled: false,
    frequency: 'monthly', // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'
    dayVal: '1',          // Day of week (0-6) or Day of month (1-31)
    monthVal: '1',        // Month of year (1-12)
    timeVal: '08:00',     // HH:MM format
    timezone: 'Asia/Bangkok',
    customCron: '0 8 1 * *'
  });

  // Helper to parse cron string (e.g. "0 8 1 * *")
  const parseCron = (cronStr) => {
    const parts = (cronStr || '0 8 1 * *').trim().split(/\s+/);
    const minute = parts[0] || '0';
    const hour = parts[1] || '8';
    const dayOfMonth = parts[2] || '*';
    const month = parts[3] || '*';
    const dayOfWeek = parts[4] || '*';

    let frequency = 'monthly';
    let dayVal = '1';
    let monthVal = '1';
    let customCronVal = cronStr || '0 8 1 * *';

    if (dayOfMonth === '*' && dayOfWeek === '*' && month === '*') {
      frequency = 'daily';
    } else if (dayOfMonth === '*' && dayOfWeek !== '*' && month === '*') {
      frequency = 'weekly';
      dayVal = dayOfWeek;
    } else if (dayOfMonth !== '*' && dayOfWeek === '*' && month === '*') {
      frequency = 'monthly';
      dayVal = dayOfMonth;
    } else if (dayOfMonth !== '*' && dayOfWeek === '*' && month.includes(',')) {
      frequency = 'quarterly';
      dayVal = dayOfMonth;
      monthVal = month.split(',')[0];
    } else if (dayOfMonth !== '*' && dayOfWeek === '*' && month !== '*' && !month.includes(',')) {
      frequency = 'yearly';
      dayVal = dayOfMonth;
      monthVal = month;
    } else {
      frequency = 'custom';
    }

    const timeVal = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    return { frequency, dayVal, monthVal, timeVal, customCronVal };
  };

  // Helper to generate cron string from state
  const generateCron = (freq, day, month, time, customCron) => {
    if (freq === 'custom') {
      return customCron || '0 8 1 * *';
    }

    const [hour, minute] = (time || '08:00').split(':').map(v => parseInt(v, 10));
    const min = isNaN(minute) ? 0 : minute;
    const hr = isNaN(hour) ? 8 : hour;

    if (freq === 'daily') {
      return `${min} ${hr} * * *`;
    } else if (freq === 'weekly') {
      return `${min} ${hr} * * ${day}`;
    } else if (freq === 'monthly') {
      return `${min} ${hr} ${day} * *`;
    } else if (freq === 'quarterly') {
      const startMonth = parseInt(month, 10) || 1;
      const m1 = startMonth;
      const m2 = (startMonth + 3) % 12 || 12;
      const m3 = (startMonth + 6) % 12 || 12;
      const m4 = (startMonth + 9) % 12 || 12;
      const months = [m1, m2, m3, m4].sort((a, b) => a - b).join(',');
      return `${min} ${hr} ${day} ${months} *`;
    } else if (freq === 'yearly') {
      return `${min} ${hr} ${day} ${month} *`;
    }
    return '0 8 1 * *';
  };

  // Human-readable Cron Translator
  const getCronDescription = (freq, day, month, time, customCron) => {
    if (freq === 'custom') {
      return `Custom cron schedule: ${customCron}`;
    }
    const [hour, minute] = (time || '08:00').split(':').map(v => parseInt(v, 10));
    const isPm = hour >= 12;
    const hr12 = hour % 12 || 12;
    const minStr = String(minute).padStart(2, '0');
    const amPm = isPm ? 'PM' : 'AM';
    const timeStr = `${hr12}:${minStr} ${amPm}`;

    if (freq === 'daily') {
      return `At ${timeStr} every day`;
    }
    if (freq === 'weekly') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `At ${timeStr} on ${days[parseInt(day, 10) || 1]}`;
    }
    if (freq === 'monthly') {
      return `At ${timeStr} on day ${day} of every month`;
    }
    if (freq === 'quarterly') {
      const cycleMonths = {
        '1': 'Jan, Apr, Jul, Oct',
        '2': 'Feb, May, Aug, Nov',
        '3': 'Mar, Jun, Sep, Dec'
      };
      return `At ${timeStr} on day ${day} of ${cycleMonths[month] || 'Jan, Apr, Jul, Oct'} (every quarter)`;
    }
    if (freq === 'yearly') {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `At ${timeStr} on day ${day} of ${months[parseInt(month, 10) - 1] || 'January'}`;
    }
    return '';
  };

  // Load configuration from GET /api/pdf on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`/api/pdf?org=${activeOrg}`);
        if (res.ok) {
          const data = await res.json();
          const rawConfig = data.config || {};
          
          const toVal = Array.isArray(data.preview?.to) ? data.preview.to : (rawConfig.email?.to ? (Array.isArray(rawConfig.email.to) ? rawConfig.email.to : rawConfig.email.to.split(/[;,\s]+/)) : []);
          const ccVal = Array.isArray(data.preview?.cc) ? data.preview.cc : (rawConfig.email?.cc ? (Array.isArray(rawConfig.email.cc) ? rawConfig.email.cc : rawConfig.email.cc.split(/[;,\s]+/)) : []);
          const filteredTo = toVal.map(s => s.trim()).filter(Boolean);
          const filteredCc = ccVal.map(s => s.trim()).filter(Boolean);
          
          setCcEmails(filteredCc);

          // Populate Email
          setEmailConfig({
            to: 'noreply@tracthai.com',
            cc: filteredCc.join(', '),
            subject: rawConfig.email?.subjectTemplate || 'Monthly NinjaOne Asset Report',
            body: rawConfig.email?.bodyTemplate || 'Please find attached the Monthly Asset Summary Report.'
          });

          // Populate Filename Template
          setFileNameTemplate(rawConfig.fileNameTemplate || 'report-{fromShort}-{untilShort}.pdf');

          // Populate Schedule
          const parsed = parseCron(rawConfig.cron);
          setScheduleConfig({
            enabled: rawConfig.enabled !== undefined ? rawConfig.enabled : false,
            frequency: parsed.frequency,
            dayVal: parsed.dayVal,
            monthVal: parsed.monthVal,
            timeVal: parsed.timeVal,
            timezone: rawConfig.timezone || 'Asia/Bangkok',
            customCron: parsed.customCronVal
          });
        }
      } catch (err) {
        console.error('Failed to load schedule configurations:', err);
      }
    }
    loadConfig();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Trigger immediate ad-hoc report sending (POST)
  const handleSendEmailImmediate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pdf?org=${activeOrg}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org: activeOrg,
          email: {
            to: 'noreply@tracthai.com',
            cc: emailConfig.cc,
            subjectTemplate: emailConfig.subject,
            bodyTemplate: emailConfig.body
          },
          fileNameTemplate: fileNameTemplate
        })
      });

      let result;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      }

      if (res.ok && result?.success) {
        showToast(`Email sent successfully! File: ${result.fileName}`, 'success');
      } else {
        const errorMsg = result?.error || `Failed to send email (Status: ${res.status})`;
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error sending report email:', err);
      showToast(err.message || 'Failed to send email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save Config back to Disk (PUT)
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const cronStr = generateCron(
        scheduleConfig.frequency,
        scheduleConfig.dayVal,
        scheduleConfig.monthVal,
        scheduleConfig.timeVal,
        scheduleConfig.customCron
      );
      
      let computedRange = 'monthly';
      if (scheduleConfig.frequency === 'daily') computedRange = 'daily';
      else if (scheduleConfig.frequency === 'weekly') computedRange = 'weekly';
      else if (scheduleConfig.frequency === 'quarterly') computedRange = 'quarterly';
      else if (scheduleConfig.frequency === 'yearly') computedRange = 'yearly';

      const res = await fetch(`/api/pdf?org=${activeOrg}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org: activeOrg,
          enabled: scheduleConfig.enabled,
          cron: cronStr,
          dateRange: computedRange,
          timezone: scheduleConfig.timezone,
          fileNameTemplate: fileNameTemplate,
          email: {
            to: ['noreply@tracthai.com'],
            cc: ccEmails,
            subjectTemplate: emailConfig.subject,
            bodyTemplate: emailConfig.body
          }
        })
      });

      let result;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      }

      if (res.ok && result?.success) {
        showToast('Configuration saved successfully to server.', 'success');
        setModalOpen(false);
      } else {
        const errorMsg = result?.error || `Failed to save settings (Status: ${res.status})`;
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      showToast(err.message || 'Failed to save configurations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Text Selection Wrapping Helper
  const wrapText = (before, after) => {
    const textarea = document.getElementById('email-body-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = emailConfig.body;
    const selected = currentText.substring(start, end);
    const textToInsert = before + selected + after;
    const newText = currentText.substring(0, start) + textToInsert + currentText.substring(end);
    
    setEmailConfig({ ...emailConfig, body: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length + selected.length + after.length, start + before.length + selected.length + after.length);
    }, 0);
  };

  const insertTextAtCursor = (text) => {
    const textarea = document.getElementById('email-body-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = emailConfig.body;
    const newText = currentText.substring(0, start) + text + currentText.substring(end);
    
    setEmailConfig({ ...emailConfig, body: newText });
    setInsertTagDropdownOpen(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // Client-side date template rendering variables
  const getPreviewVariables = () => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (scheduleConfig.frequency === 'daily') {
      endDate.setDate(endDate.getDate() - 1);
      startDate = new Date(endDate);
    } else if (scheduleConfig.frequency === 'weekly') {
      endDate.setDate(endDate.getDate() - 1);
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
    } else if (scheduleConfig.frequency === 'quarterly') {
      const currentMonth = now.getMonth();
      const currentQuarter = Math.floor(currentMonth / 3);
      const prevQuarter = (currentQuarter - 1 + 4) % 4;
      const year = now.getFullYear() + (currentQuarter === 0 ? -1 : 0);
      startDate = new Date(Date.UTC(year, prevQuarter * 3, 1));
      endDate = new Date(Date.UTC(year, (prevQuarter + 1) * 3, 0));
    } else if (scheduleConfig.frequency === 'yearly') {
      const prevYear = now.getFullYear() - 1;
      startDate = new Date(Date.UTC(prevYear, 0, 1));
      endDate = new Date(Date.UTC(prevYear, 11, 31));
    } else {
      // monthly
      const year = now.getFullYear();
      const month = now.getMonth();
      startDate = new Date(Date.UTC(year, month - 1, 1));
      endDate = new Date(Date.UTC(year, month, 0));
    }

    const formatIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const formatLong = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const fromShort = formatIso(startDate).replace(/-/g, '');
    const untilShort = formatIso(endDate).replace(/-/g, '');
    const fromLong = formatLong(startDate);
    const untilLong = formatLong(endDate);

    const monthName = endDate.toLocaleDateString('en-US', { month: 'long' });
    const monthShort = endDate.toLocaleDateString('en-US', { month: 'short' });
    const yearVal = endDate.toLocaleDateString('en-US', { year: 'numeric' });
    const monthNumeric = String(endDate.getMonth() + 1).padStart(2, '0');
    
    const monthNameThai = endDate.toLocaleDateString('th-TH', { month: 'long' });
    const monthShortThai = endDate.toLocaleDateString('th-TH', { month: 'short' });
    const yearThai = String(endDate.getFullYear() + 543);

    const nowLocal = new Date();
    const currentMonthName = nowLocal.toLocaleDateString('en-US', { month: 'long' });
    const currentMonthNameThai = nowLocal.toLocaleDateString('th-TH', { month: 'long' });
    const currentYear = nowLocal.toLocaleDateString('en-US', { year: 'numeric' });
    const currentYearThai = String(nowLocal.getFullYear() + 543);
    const currentDate = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
    const currentDateThai = nowLocal.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const currentDateShort = `${String(nowLocal.getDate()).padStart(2, '0')}/${String(nowLocal.getMonth() + 1).padStart(2, '0')}/${nowLocal.getFullYear()}`;

    // Previous month parameters relative to current date
    const prevMonthDate = new Date(nowLocal);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonthName = prevMonthDate.toLocaleDateString('en-US', { month: 'long' });
    const prevMonthNameThai = prevMonthDate.toLocaleDateString('th-TH', { month: 'long' });
    const prevMonthYear = prevMonthDate.toLocaleDateString('en-US', { year: 'numeric' });
    const prevMonthYearThai = String(prevMonthDate.getFullYear() + 543);

    return {
      from: formatIso(startDate),
      until: formatIso(endDate),
      fromShort,
      untilShort,
      fromLong,
      untilLong,
      monthName,
      monthShort,
      year: yearVal,
      monthNumeric,
      monthNameThai,
      monthShortThai,
      yearThai,
      currentMonthName,
      currentMonthNameThai,
      currentYear,
      currentYearThai,
      currentDate,
      currentDateThai,
      currentDateShort,
      prevMonthName,
      prevMonthNameThai,
      prevMonthYear,
      prevMonthYearThai,
      prevMonthNameYear: `${prevMonthName} ${prevMonthYear}`,
      prevMonthNameYearThai: `${prevMonthNameThai} ${prevMonthYearThai}`,
      'Month Year': `${monthNameThai} ${yearThai}`,
      'MonthYear': `${monthName}${yearVal}`
    };
  };

  const previewVars = getPreviewVariables();

  const convertNewlinesToBrs = (text) => {
    if (!text) return '';
    let html = text.replace(/\r?\n/g, '<br />');
    html = html.replace(/(<(?:ul|ol|li|p|div|table|tr|td|thead|tbody)[^>]*>)<br\s*\/?>/gi, '$1');
    html = html.replace(/<br\s*\/?>((<\/(?:ul|ol|li|p|div|table|tr|td|thead|tbody)>))/gi, '$1');
    return html;
  };

  const renderClientTemplate = (template) => {
    const vars = getPreviewVariables();
    return String(template || '').replace(/\{([^}]+)\}/g, (_, key) => {
      return String(vars[key] ?? `{${key}}`);
    });
  };

  const handleCopyCron = () => {
    const cronStr = generateCron(
      scheduleConfig.frequency,
      scheduleConfig.dayVal,
      scheduleConfig.monthVal,
      scheduleConfig.timeVal,
      scheduleConfig.customCron
    );
    navigator.clipboard.writeText(cronStr);
    showToast('Cron expression copied to clipboard!', 'success');
  };

  return (
    <>
      {/* --- PREMIUM LIGHT NAVBAR --- */}
      <div className="no-print sticky top-0 left-0 right-0 z-40 w-full backdrop-blur-md bg-white border-b border-slate-200 shadow-sm px-8 py-3.5 flex items-center justify-between text-slate-800">
        
        {/* Brand/Identity */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-150 text-blue-600 shadow-sm">
            <Shield className="h-5.5 w-5.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">SYSTEM PORTAL</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm animate-ping"></span>
            </div>
            <h1 className="text-sm font-black text-slate-900 tracking-wide leading-none mt-1">
              NinjaOne Asset Summary
            </h1>
          </div>

          {/* Dynamic Org Switcher dropdown */}
          <div className="ml-4 flex items-center relative">
            <div className="h-6 w-px bg-slate-200 mr-4"></div>
            <select
              value={activeOrg}
              onChange={(e) => handleOrgChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:9px_9px] bg-[position:right_12px_center] bg-no-repeat"
            >
              <option value="officemate">🏢 OfficeMate</option>
              <option value="tracthai">🛡️ TracThai</option>
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Settings Button */}
          <button
            onClick={() => { setModalOpen(true); setActiveTab('email'); }}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-2 text-xs font-semibold"
            title="Configure Scheduler & Email"
          >
            <Settings className="h-4 w-4 text-slate-500" />
            <span>Configure</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handlePrint}
            className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FileDown className="h-4 w-4 text-slate-500" />
            <span>Export A4 PDF</span>
          </button>

          {/* Send Email Button */}
          <button
            onClick={handleSendEmailImmediate}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="h-4 w-4" />
            <span>Send Email Now</span>
          </button>

        </div>
      </div>

      {/* --- MOCKUP REDESIGNED SETTINGS MODAL --- */}
      {modalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-[620px] shadow-2xl text-slate-800 overflow-hidden flex flex-col animate-slide-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <Sliders className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Report Configurations</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Customize email parameters and automation cron triggers.</p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-slate-50/50 px-6 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`py-3.5 text-xs font-bold border-b-2 px-4 transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${activeTab === 'email' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <Mail className="h-4 w-4" />
                <span>Email Parameters</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`py-3.5 text-xs font-bold border-b-2 px-4 transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${activeTab === 'schedule' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <Calendar className="h-4 w-4" />
                <span>Automation Schedule</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('branding')}
                className={`py-3.5 text-xs font-bold border-b-2 px-4 transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${activeTab === 'branding' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                <Globe className="h-4 w-4" />
                <span>Branding & Logos</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSettings} className="flex-1 overflow-y-auto max-h-[60vh] bg-white">
              
              {activeTab === 'email' && (
                <div className="p-6 flex flex-col gap-5">
                  <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">Recipients</h4>
                  
                  {/* Recipient To */}
                  <div className="flex flex-col gap-1.5 animate-fade-in">
                    <label className="text-[11px] font-bold text-slate-700">To Recipient (Primary)</label>
                    <div className="relative flex items-center">
                      <input
                        type="email"
                        readOnly
                        disabled
                        value="noreply@tracthai.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-4 py-3 text-xs text-slate-500 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                    <span className="text-[9.5px] text-slate-400">This field is fixed to the system-designated email address</span>
                  </div>

                  {/* Recipient Cc */}
                  <EmailChipInput
                    emails={ccEmails}
                    setEmails={setCcEmailsWithConfig}
                    placeholder="manager@company.com"
                    label="Cc Recipients"
                  />

                  <hr className="border-slate-100" />

                  {/* PDF Filename Template */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <span>PDF Filename Template</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={fileNameTemplate}
                        onChange={(e) => setFileNameTemplate(e.target.value)}
                        placeholder="report-{fromShort}-{untilShort}.pdf"
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-4 pr-11 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder-slate-400 transition-all"
                      />
                      <Info className="absolute right-4 h-4.5 w-4.5 text-slate-400" title="Supports dynamic date range variables" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="text-[9.5px] text-slate-400 w-full mb-0.5">Dynamic tags (click to insert):</span>
                      {[
                        { key: '{monthNameThai}_{yearThai}', label: `เดือนรายงาน (ไทย) เช่น ${previewVars.monthNameThai}_${previewVars.yearThai}` },
                        { key: '{prevMonthNameThai}_{prevMonthYearThai}', label: `เดือนก่อนหน้า (ไทย) เช่น ${previewVars.prevMonthNameThai}_${previewVars.prevMonthYearThai}` },
                        { key: '{monthName}_{year}', label: `เดือนรายงาน (อังกฤษ) เช่น ${previewVars.monthName}_${previewVars.year}` },
                        { key: '{currentDateShort}', label: `วันที่ปัจจุบัน (สั้น) เช่น ${previewVars.currentDateShort?.replace(/\//g, '_')}` }
                      ].map(tag => (
                        <button
                          key={tag.key}
                          type="button"
                          onClick={() => setFileNameTemplate(fileNameTemplate + tag.key)}
                          className="px-2.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-semibold rounded-full border border-blue-100/50 cursor-pointer transition-colors"
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject Templates Option Selection */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-700">Select Subject Template</label>
                    <div className="grid grid-cols-2 gap-3">
                      {subjectTemplatesList.map((tpl) => {
                        const isSelected = emailConfig.subject === tpl.template;
                        return (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => setEmailConfig({ ...emailConfig, subject: tpl.template })}
                            className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10 font-bold'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`text-[11px] font-bold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                              {tpl.title}
                            </span>
                            <span className="text-[9.5px] text-slate-500 mt-1 leading-relaxed">
                              {tpl.template}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject Template Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-700">Subject Template Customization</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={emailConfig.subject}
                        onChange={(e) => setEmailConfig({ ...emailConfig, subject: e.target.value })}
                        placeholder="Monthly NinjaOne Asset Report"
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-4 pr-11 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder-slate-400 transition-all"
                      />
                      <Info className="absolute right-4 h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="text-[9.5px] text-slate-400 w-full mb-0.5">Dynamic tags (click to insert):</span>
                      {[
                        { key: '{monthNameThai} {yearThai}', label: `เดือนรายงาน (ไทย) - เช่น ${previewVars.monthNameThai} ${previewVars.yearThai}` },
                        { key: '{prevMonthNameThai} {prevMonthYearThai}', label: `เดือนก่อนหน้า (ไทย) - เช่น ${previewVars.prevMonthNameThai} ${previewVars.prevMonthYearThai}` },
                        { key: '{monthName} {year}', label: `เดือนรายงาน (อังกฤษ) - เช่น ${previewVars.monthName} ${previewVars.year}` },
                        { key: '{currentDateThai}', label: `วันที่ปัจจุบัน (ไทยยาว) - เช่น ${previewVars.currentDateThai}` },
                        { key: '{currentDateShort}', label: `วันที่ปัจจุบัน (สั้น) - เช่น ${previewVars.currentDateShort}` }
                      ].map(tag => (
                        <button
                          key={tag.key}
                          type="button"
                          onClick={() => setEmailConfig({ ...emailConfig, subject: emailConfig.subject + tag.key })}
                          className="px-2.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-semibold rounded-full border border-blue-100/50 cursor-pointer transition-colors"
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email Body Message (with rich formatting toolbar) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-700">Email Body Message</label>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-slate-50/20">
                      
                      {/* Editor Toolbar */}
                      <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
                        <button
                          type="button"
                          onClick={() => wrapText('<b>', '</b>')}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                          title="Bold"
                        >
                          <Bold className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => wrapText('<i>', '</i>')}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                          title="Italic"
                        >
                          <Italic className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => wrapText('<u>', '</u>')}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                          title="Underline"
                        >
                          <Underline className="h-4 w-4" />
                        </button>
                        <div className="h-5 w-px bg-slate-200 mx-1"></div>
                        <button
                          type="button"
                          onClick={() => wrapText('<ul>\n  <li>', '</li>\n</ul>')}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                          title="Bullet List"
                        >
                          <List className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => wrapText('<ol>\n  <li>', '</li>\n</ol>')}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                          title="Numbered List"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => wrapText('<a href="url">', '</a>')}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                          title="Insert Link"
                        >
                          <Link className="h-4 w-4" />
                        </button>
                        <div className="h-5 w-px bg-slate-200 mx-1"></div>
                        
                        {/* Dynamic Tag Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setInsertTagDropdownOpen(!insertTagDropdownOpen)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-950 flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <span>Insert Tag</span>
                            <span className="text-[8px]">▼</span>
                          </button>
                          {insertTagDropdownOpen && (
                            <div className="absolute left-0 mt-1 z-30 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs text-slate-700 max-h-56 overflow-y-auto">
                              {[
                                { tag: '{monthNameThai} {yearThai}', label: `เดือนรายงาน (ภาษาไทย) - เช่น ${previewVars.monthNameThai} ${previewVars.yearThai}` },
                                { tag: '{prevMonthNameThai} {prevMonthYearThai}', label: `เดือนก่อนหน้า (ภาษาไทย) - เช่น ${previewVars.prevMonthNameThai} ${previewVars.prevMonthYearThai}` },
                                { tag: '{monthName} {year}', label: `เดือนรายงาน (ภาษาอังกฤษ) - เช่น ${previewVars.monthName} ${previewVars.year}` },
                                { tag: '{currentMonthName}', label: `เดือนปัจจุบัน (ภาษาอังกฤษ) - เช่น ${previewVars.currentMonthName}` },
                                { tag: '{currentDateThai}', label: `วันที่ปัจจุบัน (ไทยยาว) - เช่น ${previewVars.currentDateThai}` },
                                { tag: '{currentDateShort}', label: `วันที่ปัจจุบัน (สั้น) - เช่น ${previewVars.currentDateShort}` }
                              ].map(item => (
                                <button
                                  key={item.tag}
                                  type="button"
                                  onClick={() => insertTextAtCursor(item.tag)}
                                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 cursor-pointer transition-colors font-medium text-slate-800"
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <textarea
                        id="email-body-textarea"
                        required
                        rows={6}
                        value={emailConfig.body}
                        onChange={(e) => setEmailConfig({ ...emailConfig, body: e.target.value })}
                        placeholder="Dear Team, please find attached..."
                        className="w-full bg-transparent px-4 py-3 text-xs text-slate-900 focus:outline-none placeholder-slate-400 resize-none min-h-[140px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="p-6 flex flex-col gap-5.5">
                  
                  {/* Enable Schedule Toggle Card */}
                  <div className="flex items-center justify-between bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-950">Enable Automation Scheduler</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Send report automatically via background cron runner.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={scheduleConfig.enabled} 
                        onChange={(e) => setScheduleConfig({ ...scheduleConfig, enabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  <div className={`flex flex-col gap-5.5 transition-all duration-300 ${scheduleConfig.enabled ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}>
                    
                    {/* Grid Inputs */}
                    <div className="grid grid-cols-2 gap-4.5">
                      
                      {/* Frequency */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-700">Frequency</label>
                        <div className="relative flex items-center">
                          <select
                            value={scheduleConfig.frequency}
                            onChange={(e) => setScheduleConfig({ ...scheduleConfig, frequency: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 appearance-none cursor-pointer"
                          >
                            <option value="daily">Daily (Every Day)</option>
                            <option value="weekly">Weekly (Once a Week)</option>
                            <option value="monthly">Monthly (Once a Month)</option>
                            <option value="quarterly">Quarterly (Once a Quarter)</option>
                            <option value="yearly">Yearly (Once a Year)</option>
                            <option value="custom">Custom Cron Expression</option>
                          </select>
                          <Calendar className="absolute left-4 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Day of Week Selector */}
                      {scheduleConfig.frequency === 'weekly' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-700">Day of Week</label>
                          <div className="relative flex items-center">
                            <select
                              value={scheduleConfig.dayVal}
                              onChange={(e) => setScheduleConfig({ ...scheduleConfig, dayVal: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 appearance-none cursor-pointer"
                            >
                              <option value="1">Monday</option>
                              <option value="2">Tuesday</option>
                              <option value="3">Wednesday</option>
                              <option value="4">Thursday</option>
                              <option value="5">Friday</option>
                              <option value="6">Saturday</option>
                              <option value="0">Sunday</option>
                            </select>
                            <Calendar className="absolute left-4 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      )}

                      {/* Day of Month Selector */}
                      {(scheduleConfig.frequency === 'monthly' || scheduleConfig.frequency === 'quarterly' || scheduleConfig.frequency === 'yearly') && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-700">Day of Month</label>
                          <div className="relative flex items-center">
                            <select
                              value={scheduleConfig.dayVal}
                              onChange={(e) => setScheduleConfig({ ...scheduleConfig, dayVal: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 appearance-none cursor-pointer"
                            >
                              {Array.from({ length: 31 }, (_, i) => (
                                <option key={i + 1} value={String(i + 1)}>{i + 1}{i === 0 ? 'st' : (i === 1 ? 'nd' : (i === 2 ? 'rd' : 'th'))} of Month</option>
                              ))}
                            </select>
                            <Calendar className="absolute left-4 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      )}

                      {/* Quarterly Months Cycle Selector */}
                      {scheduleConfig.frequency === 'quarterly' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-700">Quarterly Cycle</label>
                          <div className="relative flex items-center">
                            <select
                              value={scheduleConfig.monthVal}
                              onChange={(e) => setScheduleConfig({ ...scheduleConfig, monthVal: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 appearance-none cursor-pointer"
                            >
                              <option value="1">Cycle 1: Jan, Apr, Jul, Oct</option>
                              <option value="2">Cycle 2: Feb, May, Aug, Nov</option>
                              <option value="3">Cycle 3: Mar, Jun, Sep, Dec</option>
                            </select>
                            <Calendar className="absolute left-4 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      )}

                      {/* Yearly Month Selector */}
                      {scheduleConfig.frequency === 'yearly' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-700">Month of Year</label>
                          <div className="relative flex items-center">
                            <select
                              value={scheduleConfig.monthVal}
                              onChange={(e) => setScheduleConfig({ ...scheduleConfig, monthVal: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 appearance-none cursor-pointer"
                            >
                              <option value="1">January</option>
                              <option value="2">February</option>
                              <option value="3">March</option>
                              <option value="4">April</option>
                              <option value="5">May</option>
                              <option value="6">June</option>
                              <option value="7">July</option>
                              <option value="8">August</option>
                              <option value="9">September</option>
                              <option value="10">October</option>
                              <option value="11">November</option>
                              <option value="12">December</option>
                            </select>
                            <Calendar className="absolute left-4 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      )}

                      {/* Custom Cron Input */}
                      {scheduleConfig.frequency === 'custom' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-700">Custom Cron Expression</label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              required
                              value={scheduleConfig.customCron}
                              onChange={(e) => setScheduleConfig({ ...scheduleConfig, customCron: e.target.value })}
                              placeholder="e.g. 0 8 1 * *"
                              className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder-slate-400 transition-all"
                            />
                            <Sliders className="absolute left-4 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      )}

                      {/* Dispatch Time */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-700">Dispatch Time</label>
                        <div className="relative flex items-center">
                          <input
                            type="time"
                            required
                            disabled={scheduleConfig.frequency === 'custom'}
                            value={scheduleConfig.timeVal}
                            onChange={(e) => setScheduleConfig({ ...scheduleConfig, timeVal: e.target.value })}
                            className={`w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ${scheduleConfig.frequency === 'custom' ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'cursor-pointer'}`}
                          />
                          <Clock className="absolute left-4 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Timezone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-700">Timezone</label>
                        <div className="relative flex items-center">
                          <select
                            disabled
                            value={scheduleConfig.timezone}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-500 cursor-not-allowed appearance-none"
                          >
                            <option value="Asia/Bangkok">Asia/Bangkok</option>
                          </select>
                          <Globe className="absolute left-4 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                    </div>



                  </div>

                </div>
              )}

              {activeTab === 'branding' && (
                <div className="p-6 flex flex-col gap-6 animate-fade-in">
                  <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">Tenant Assets</h4>
                  <p className="text-[11px] text-slate-500 -mt-3.5">Upload PNG images to replace the logos for the current organization ({activeOrg === 'tracthai' ? 'TracThai' : 'OfficeMate'}).</p>
                  
                  {/* Header Logo Upload */}
                  <div className="flex flex-col gap-2 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl">
                    <label className="text-[11px] font-bold text-slate-700">Header Logo (A4 Top-Left)</label>
                    <div className="flex items-center gap-6 mt-1">
                      <div className="h-16 w-28 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-xs shrink-0 overflow-hidden">
                        <img 
                          src={`/org/${activeOrg}/header_logo.png?t=${Date.now()}`} 
                          alt="Header Logo Preview" 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <input 
                          type="file" 
                          accept="image/png"
                          onChange={(e) => handleLogoUpload(e, 'header_logo')}
                          className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        <span className="text-[9.5px] text-slate-400">Supports PNG format. Recommended size: 240x80px.</span>
                      </div>
                    </div>
                  </div>

                  {/* Cover Logo Upload */}
                  <div className="flex flex-col gap-2 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl">
                    <label className="text-[11px] font-bold text-slate-700">Cover Logo (Cover & Back-Cover)</label>
                    <div className="flex items-center gap-6 mt-1">
                      <div className="h-16 w-28 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-xs shrink-0 overflow-hidden">
                        <img 
                          src={`/org/${activeOrg}/cover_logo.png?t=${Date.now()}`} 
                          alt="Cover Logo Preview" 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <input 
                          type="file" 
                          accept="image/png"
                          onChange={(e) => handleLogoUpload(e, 'cover_logo')}
                          className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        <span className="text-[9.5px] text-slate-400">Supports PNG format. Recommended size: 300x120px.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4.5 bg-slate-50/50 mt-2">
                {activeTab === 'branding' ? (
                  <div className="flex-1 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-colors"
                    >
                      Done
                    </button>
                  </div>
                ) : activeTab === 'email' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="px-4.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Eye className="h-4 w-4 text-slate-500" />
                      <span>Preview Email</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save Changes
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSendEmailImmediate}
                      disabled={loading}
                      className="px-4.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 text-slate-500" />
                      <span>Test Schedule</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save Changes
                      </button>
                    </div>
                  </>
                )}
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- EMAIL PREVIEW DIALOG OVERLAY --- */}
      {previewOpen && (
        <div className="no-print fixed inset-0 z-55 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-[550px] shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <Eye className="h-5 w-5 text-blue-600" />
                <span className="font-extrabold text-sm text-slate-900">Email Presentation Preview</span>
              </div>
              <button 
                onClick={() => setPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4.5 text-xs text-slate-700 overflow-y-auto max-h-[50vh]">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">To Recipients:</span>
                <span className="text-slate-850 font-medium">{emailConfig.to}</span>
              </div>
              
              {emailConfig.cc && (
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                  <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Cc Recipients:</span>
                  <span className="text-slate-850 font-medium">{emailConfig.cc}</span>
                </div>
              )}

              <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Attachment PDF Name:</span>
                <span className="text-blue-650 font-mono font-bold">{renderClientTemplate(fileNameTemplate)}</span>
              </div>

              <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Email Subject:</span>
                <span className="text-slate-900 font-bold text-sm">{renderClientTemplate(emailConfig.subject)}</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Email HTML Content:</span>
                <div 
                  className="p-4 bg-slate-50 border border-slate-150 rounded-2xl max-h-[300px] overflow-y-auto font-sans leading-relaxed text-slate-850"
                  dangerouslySetInnerHTML={{ __html: convertNewlinesToBrs(renderClientTemplate(emailConfig.body)) }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FULL SCREEN LOADING OVERLAY --- */}
      {loading && (
        <div className="no-print fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md text-slate-900 select-none animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <div className="text-center">
              <h2 className="text-lg font-bold tracking-wide">Processing Report Request</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-[340px] leading-relaxed">
                We are generating the A4 report pages and executing the endpoint operations. This will take around 15-20 seconds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST NOTIFICATIONS --- */}
      {toast && (
        <div className="no-print fixed bottom-6 right-6 z-55 flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-2xl text-slate-800 animate-slide-in max-w-[360px]">
          {toast.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          )}
          <span className="text-xs font-semibold leading-normal">{toast.message}</span>
        </div>
      )}
    </>
  );
}

// Helper tag-input component
function EmailChipInput({ emails, setEmails, placeholder, label }) {
  const [inputVal, setInputVal] = useState('');

  const addEmails = (text) => {
    const parts = text.split(/[;,\s]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = parts.filter(email => emailRegex.test(email) && !emails.includes(email));

    if (validEmails.length > 0) {
      setEmails([...emails, ...validEmails]);
    }
    setInputVal('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      addEmails(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && emails.length > 0) {
      setEmails(emails.slice(0, -1));
    }
  };

  const handleBlur = () => {
    addEmails(inputVal);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    addEmails(pastedText);
  };

  const removeEmail = (indexToRemove) => {
    setEmails(emails.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-1.5 animate-fade-in">
      <label className="text-[11px] font-bold text-slate-700">{label}</label>
      <div className="flex flex-wrap gap-2 p-2 bg-white border border-slate-200 rounded-2xl min-h-[48px] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all items-center">
        {emails.map((email, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-xl shadow-xs font-semibold"
          >
            <span>{email}</span>
            <button
              type="button"
              onClick={() => removeEmail(idx)}
              className="text-blue-400 hover:text-blue-600 transition-colors p-0.5 rounded-full hover:bg-blue-100 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePaste}
          placeholder={emails.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[180px] bg-transparent text-xs text-slate-900 focus:outline-none placeholder-slate-400 py-1 px-1.5"
        />
      </div>
      <span className="text-[9.5px] text-slate-400">Press Enter, Comma, or Space to separate multiple email addresses</span>
    </div>
  );
}
