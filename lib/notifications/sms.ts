import twilio from 'twilio'

export async function sendUrgentTaskSMS(toPhone: string, projectName: string, taskTitle: string) {
  if (!toPhone || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) return
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  await client.messages.create({
    body: `BuilderBuddy — ${projectName}: Urgent task assigned to you: "${taskTitle}"`,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: toPhone,
  })
}
