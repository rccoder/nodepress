/**
 * Helper Email service.
 * @file Helper Email 邮件服务
 * @module processors/helper/akismet.service
 * @author Surmon <https://github.com/surmon-china>
 */

import * as nodemailer from 'nodemailer';
import * as APP_CONFIG from '@app/app.config';
import { Injectable } from '@nestjs/common';

// todo -> 待优化
export interface IEmailOptions {
  from: string;
  to: string;
  text: string;
  content: string;
}

@Injectable()
export class EmailService {

  private transporter: nodemailer;
  private clientIsValid: boolean;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      secure: true,
      port: 465,
      auth: {
        user: APP_CONFIG.EMAIL.account,
        pass: APP_CONFIG.EMAIL.password,
      },
    });
    this.verifyClient();
  }

  // 验证有效性
  private verifyClient(): Promise<any> {
    return this.transporter.verify((error, success) => {
      if (error) {
        this.clientIsValid = false;
        console.warn('邮件客户端初始化连接失败，将在一小时后重试');
        setTimeout(this.verifyClient, 1000 * 60 * 60);
      } else {
        this.clientIsValid = true;
        console.info('邮件客户端初始化连接成功，随时可发送邮件');
      }
    });
  }

  // 发邮件
  public sendMail(mailOptions: IEmailOptions) {
    if (!this.clientIsValid) {
      console.warn('由于未初始化成功，邮件客户端发送被拒绝');
      return false;
    }
    mailOptions.from = APP_CONFIG.EMAIL.from;
    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.warn('邮件发送失败', error);
      } else {
        console.info('邮件发送成功', info.messageId, info.response);
      }
    });
  }
}