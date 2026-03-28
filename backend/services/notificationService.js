import nodemailer from 'nodemailer';
import Notification from '../models/Notification.js';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'yahoo', // Based on existing .env settings
  auth: {
    user: process.env.YAHOO_EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.YAHOO_EMAIL_APP_PASSWORD || process.env.SMTP_PASS,
  },
});

export const notificationService = {
  /**
   * Create an in-app notification
   */
  createNotification: async (title, message, type = 'info', category = 'system') => {
    try {
      const notification = new Notification({ title, message, type, category });
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  },

  /**
   * Send a low stock email alert
   */
  sendLowStockEmail: async (product) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.YAHOO_EMAIL_USER;
    if (!adminEmail) return;

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Moreez Manager" <${process.env.YAHOO_EMAIL_USER}>`,
      to: adminEmail,
      subject: `LOW STOCK ALERT: ${product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #ef4444; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.1em;">Low Stock Alert</h1>
          </div>
          <div style="padding: 30px; background-color: white;">
            <p style="font-size: 16px; color: #1e293b; font-weight: bold;">Threshold breached for inventory item:</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #64748b;">Product Name</p>
              <p style="margin: 5px 0 15px; font-size: 18px; color: #0f172a; font-weight: 800; text-transform: uppercase;">${product.name}</p>
              
              <div style="display: flex; gap: 20px;">
                <div>
                  <p style="margin: 0; font-size: 14px; color: #64748b;">Current Stock</p>
                  <p style="margin: 5px 0 0; font-size: 24px; color: #ef4444; font-weight: 900;">${product.currentStock}</p>
                </div>
              </div>
            </div>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Please restock this item soon to avoid operational downtime.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/inventory" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 20px;">View Inventory Details</a>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Moreez Manager Automation System</p>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Low stock email sent for ${product.name}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  },

  /**
   * Send a login notification email
   */
  sendLoginEmail: async (user) => {
    const userEmail = user.email;
    if (!userEmail) return;

    const mailOptions = {
      from: `"Moreez Security" <${process.env.YAHOO_EMAIL_USER}>`,
      to: userEmail,
      subject: 'New Login Detected - Moreez Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.1em;">Security Alert</h1>
          </div>
          <div style="padding: 30px; background-color: white;">
            <p style="font-size: 16px; color: #1e293b; font-weight: bold;">Hello ${user.name},</p>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">A new login was detected for your account on <strong>${new Date().toLocaleString()}</strong>.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; font-size: 14px; color: #0f172a; font-weight: bold;">If this was you, you can safely ignore this email.</p>
            </div>
            
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">If you did not authorize this login, please contact the system administrator immediately to secure your account.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Moreez Manager Security Protocols</p>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Login notification email sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending login email:', error);
    }
  },

  /**
   * Send a password change confirmation email
   */
  sendPasswordChangeEmail: async (user) => {
    const userEmail = user.email;
    if (!userEmail) return;

    const mailOptions = {
      from: `"Moreez Security" <${process.env.YAHOO_EMAIL_USER}>`,
      to: userEmail,
      subject: 'Password Changed Successfully - Moreez Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.1em;">Security Update</h1>
          </div>
          <div style="padding: 30px; background-color: white;">
            <p style="font-size: 16px; color: #1e293b; font-weight: bold;">Hello ${user.name},</p>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Your password has been successfully updated on <strong>${new Date().toLocaleString()}</strong>.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-size: 14px; color: #0f172a; font-weight: bold;">Your account security is our priority.</p>
            </div>
            
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">If you did not make this change, please recover your account immediately or contact support.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Moreez Manager Security Protocols</p>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password change confirmation email sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending password change email:', error);
    }
  },

  /**
   * Send weekly driver payment reminders to users who have it enabled
   */
  sendWeeklyDriverReminders: async (customData) => {
    try {
      let manifestData = customData;
      
      if (!manifestData) {
        // Aggregate real data from the last 7 days
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const payments = await Payment.find({
          date: { $gte: lastWeek },
          status: 'Active'
        });
        
        const totalPayout = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
        const drivers = [...new Set(payments.map(p => p.driver))];
        
        manifestData = {
          driverCount: drivers.length,
          totalPayout: totalPayout,
          period: `${lastWeek.toLocaleDateString()} - ${new Date().toLocaleDateString()}`
        };
      }

      const users = await User.find({ 'settings.notifications.driverReminders': true });
      
      for (const user of users) {
        const mailOptions = {
          from: `"Moreez Reports" <${process.env.YAHOO_EMAIL_USER}>`,
          to: user.email,
          subject: 'Weekly Driver Settlement Manifest',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #0f172a; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.1em;">Weekly Manifest</h1>
              </div>
              <div style="padding: 30px; background-color: white;">
                <p style="font-size: 16px; color: #1e293b; font-weight: bold;">Hello ${user.name},</p>
                <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Your automated manifest for the period <strong>${manifestData.period || 'current week'}</strong> is ready.</p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
                  <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Weekly Collection Summary</p>
                  <p style="margin: 10px 0 0; font-size: 13px; color: #0f172a;">Active Drivers: <span style="font-weight: 800;">${manifestData.driverCount}</span></p>
                  <p style="margin: 5px 0 0; font-size: 13px; color: #0f172a;">Total Settlement: <span style="font-weight: 800; color: #10b981;">₦${manifestData.totalPayout.toLocaleString()}</span></p>
                </div>
                
                <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Please cross-reference these totals with your physical collection records to ensure full compliance for the week.</p>
              </div>
              <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Moreez Manager Automation System</p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      }
      console.log(`Weekly reminders sent successfully to ${users.length} users.`);
    } catch (error) {
      console.error('Error sending weekly reminders:', error);
    }
  },

  /**
   * Check stock level and trigger alerts if low
   */
  checkStock: async (product) => {
    const threshold = product.reorderLevel || 5;
    if (product.currentStock <= threshold) {
      const title = `Low Stock: ${product.name}`;
      const message = `Inventory level reduced to ${product.currentStock} units. Restock required.`;
      
      // Check if a warning for this product already exists today to avoid spam
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const existingNotif = await Notification.findOne({
        title,
        createdAt: { $gte: today }
      });

      if (!existingNotif) {
        await notificationService.createNotification(title, message, 'warning', 'inventory');
        await notificationService.sendLowStockEmail(product);
      }
    }
  }
};
