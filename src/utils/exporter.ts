import { Conversation, Message } from '../types';

// SULY AI Advanced Export Center
// Generates luxury branded PDF reports, Word (.doc) documents, Markdown, and JSON backups

export function exportToPDF(conversation: Conversation) {
  // Create an isolated printable window or print current conversation view
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لطباعة المستند بتنسيق PDF');
    return;
  }

  const dateStr = new Date(conversation.createdAt).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const messagesHtml = conversation.messages
    .map((msg) => {
      const isUser = msg.role === 'user';
      return `
      <div style="margin-bottom: 24px; padding: 18px 22px; border-radius: 12px; border: 1px solid ${isUser ? '#e2e8f0' : '#d4af37'}; background: ${isUser ? '#f8fafc' : '#ffffff'};">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
          <span style="font-weight: 700; color: ${isUser ? '#334155' : '#aa7c11'}; font-size: 14px;">
            ${isUser ? 'المستخدم (User)' : '✦ SULY AI (التقرير التنفيذي)'}
          </span>
          <span style="font-size: 12px; color: #94a3b8;">
            ${new Date(msg.timestamp).toLocaleTimeString('ar-EG')}
          </span>
        </div>
        <div style="font-size: 14px; line-height: 1.8; color: #1e293b; white-space: pre-wrap; word-break: break-word;">
          ${escapeHtml(msg.content)}
        </div>
      </div>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(conversation.title)} - SULY AI Report</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Fira+Code&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Cairo', system-ui, sans-serif;
          margin: 0;
          padding: 40px;
          background: #ffffff;
          color: #1e293b;
        }
        .header {
          border-bottom: 3px solid #d4af37;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-title {
          font-size: 26px;
          font-weight: 800;
          color: #07080a;
          letter-spacing: -0.5px;
        }
        .logo-gold {
          color: #d4af37;
        }
        .subtitle {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }
        .meta-box {
          text-align: left;
          font-size: 12px;
          color: #64748b;
        }
        .footer {
          margin-top: 50px;
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo-title">SULY <span class="logo-gold">AI</span></div>
          <div class="subtitle">تقرير رسمي صادر من منصة SULY AI الفاخرة المعتمدة على جيميني 3.8 فلاش</div>
        </div>
        <div class="meta-box">
          <div><strong>التاريخ:</strong> ${dateStr}</div>
          <div><strong>معرف الجلسة:</strong> ${conversation.id.slice(0, 8)}</div>
          <div><strong>الموضوع:</strong> ${escapeHtml(conversation.title)}</div>
        </div>
      </div>

      <div class="content">
        ${messagesHtml}
      </div>

      <div class="footer">
        <div>تم إنشاؤه وتنسيقه بواسطة منصة SULY AI • الذكاء الاصطناعي الموثوق</div>
        <div>صفحة معتمدة • سرية ومحمية</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export function exportToWord(conversation: Conversation) {
  const content = conversation.messages
    .map((msg) => {
      const roleName = msg.role === 'user' ? 'المستخدم' : 'SULY AI';
      return `
      <h3 style="color: ${msg.role === 'user' ? '#1e293b' : '#b8860b'}; font-family: 'Segoe UI', Tahoma, sans-serif;">
        ${roleName} - <small style="color: #888; font-size: 11pt;">${new Date(msg.timestamp).toLocaleString('ar-EG')}</small>
      </h3>
      <div style="background-color: ${msg.role === 'user' ? '#f8f9fa' : '#fffdf5'}; padding: 12pt; border: 1pt solid ${msg.role === 'user' ? '#e9ecef' : '#f1c40f'}; border-radius: 6pt; margin-bottom: 16pt;">
        <p style="font-size: 12pt; line-height: 1.6; font-family: 'Segoe UI', Tahoma, sans-serif;">
          ${escapeHtml(msg.content).replace(/\n/g, '<br/>')}
        </p>
      </div>
      `;
    })
    .join('');

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${escapeHtml(conversation.title)}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; }
        h1 { color: #0a0a0a; border-bottom: 2pt solid #d4af37; padding-bottom: 6pt; }
      </style>
    </head>
    <body>
      <h1>SULY AI • ${escapeHtml(conversation.title)}</h1>
      <p style="color: #666; font-size: 10pt;">تاريخ الإنشاء: ${new Date(conversation.createdAt).toLocaleString('ar-EG')}</p>
      <hr style="border: 0.5pt solid #eee;" />
      ${content}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword',
  });
  triggerDownload(blob, `SULY_AI_${sanitizeFilename(conversation.title)}.doc`);
}

export function exportToMarkdown(conversation: Conversation) {
  let md = `# SULY AI • ${conversation.title}\n`;
  md += `**تاريخ الإنشاء:** ${new Date(conversation.createdAt).toISOString()}\n`;
  md += `**النموذج:** gemini-3.8-flash\n\n`;
  md += `---\n\n`;

  for (const msg of conversation.messages) {
    const role = msg.role === 'user' ? '👤 المستخدم' : '✦ SULY AI';
    md += `### ${role} (${new Date(msg.timestamp).toLocaleTimeString()})\n\n`;
    md += `${msg.content}\n\n`;
    md += `---\n\n`;
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, `SULY_AI_${sanitizeFilename(conversation.title)}.md`);
}

export function exportToJSON(data: unknown, filename = 'suly_ai_backup.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_').slice(0, 30);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
