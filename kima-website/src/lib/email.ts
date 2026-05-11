import nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_PASSWORD) return

  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"KIMA 한국이주민선교연합회" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  })
}

export function welcomeEmailHtml(name: string) {
  return `
    <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
      <div style="background: #1B3A6B; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">KIMA 한국이주민선교연합회</h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1B3A6B;">가입을 환영합니다, ${name}님!</h2>
        <p>KIMA 회원이 되신 것을 진심으로 환영합니다.</p>
        <p>정회원(연 5만원) 신청을 통해 자료실, 정회원 전용 커뮤니티 등 더 많은 기능을 이용하실 수 있습니다.</p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}" style="background: #C8922A; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            KIMA 방문하기
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">문의: ${process.env.ADMIN_EMAIL}</p>
      </div>
    </div>
  `
}
