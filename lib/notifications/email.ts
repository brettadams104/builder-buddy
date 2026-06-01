import { Resend } from 'resend'

export async function sendTaskAssignedEmail({
  toEmail,
  toName,
  taskTitle,
  priority,
  projectName,
  dueDate,
  notes,
  assignedBy,
}: {
  toEmail: string
  toName: string
  taskTitle: string
  priority: string
  projectName: string | null
  dueDate: string | null
  notes: string | null
  assignedBy: string
}) {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1)
  const dueLine = dueDate
    ? `<p><strong>Due:</strong> ${new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>`
    : ''
  const projectLine = projectName ? `<p><strong>Project:</strong> ${projectName}</p>` : '<p><strong>Project:</strong> General task</p>'
  const notesLine = notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'BuilderBuddy <notifications@resend.dev>',
    to: toEmail,
    subject: `New task assigned: ${taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: #1e3a5f; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">BuilderBuddy</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; margin-top: 0;">Hi ${toName},</p>
          <p style="color: #374151;"><strong>${assignedBy}</strong> assigned you a task:</p>
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 16px;">${taskTitle}</h2>
            <p><strong>Priority:</strong> <span style="color: ${priority === 'urgent' ? '#dc2626' : priority === 'moderate' ? '#d97706' : '#6b7280'}">${priorityLabel}</span></p>
            ${projectLine}
            ${dueLine}
            ${notesLine}
          </div>
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 0;">Log in to BuilderBuddy to manage this task.</p>
        </div>
      </div>
    `,
  })
}
