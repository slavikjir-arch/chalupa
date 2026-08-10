declare module 'nodemailer' {
  interface TransportOptions {
    service?: string;
    auth?: {
      user?: string;
      pass?: string;
    };
  }

  interface SendMailOptions {
    from?: string;
    to?: string;
    subject?: string;
    html?: string;
  }

  interface Transporter {
    sendMail(mailOptions: SendMailOptions): Promise<unknown>;
  }

  interface NodemailerModule {
    createTransport(options: TransportOptions): Transporter;
  }

  const nodemailer: NodemailerModule;
  export default nodemailer;
}
