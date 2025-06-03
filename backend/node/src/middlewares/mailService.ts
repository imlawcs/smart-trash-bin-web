import nodemailer from 'nodemailer';

interface SendEmailOptions {
  emailFrom: string;
  emailTo: string;
  emailSubject: string;
  emailText: string;
}

const mailService = {
  async sendEmail({ emailFrom, emailTo, emailSubject, emailText }: SendEmailOptions): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    if(!emailTo) {
      emailTo = "daolehanhnguyen@gmail.com"
    }

    await transporter.sendMail({
      from: emailFrom,
      to: emailTo,
      subject: emailSubject,
      text: emailText,
    });
  },
};

Object.freeze(mailService);

export default mailService;
