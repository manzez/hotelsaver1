import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

// Email templates
const EMAIL_TEMPLATES = {
  booking_confirmation: {
    subject: 'Booking Confirmation - HotelSaver.ng',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #009739; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1>Booking Confirmed!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
          <h2>Dear ${data.guestName},</h2>
          <p>Your hotel booking has been confirmed. Here are your booking details:</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Booking Details</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Hotel:</strong> ${data.hotelName}</p>
            <p><strong>Room:</strong> ${data.roomType} - Room ${data.roomNumber}</p>
            <p><strong>Check-in:</strong> ${data.checkIn}</p>
            <p><strong>Check-out:</strong> ${data.checkOut}</p>
            <p><strong>Nights:</strong> ${data.nights}</p>
            <p><strong>Guests:</strong> ${data.adults} Adults, ${data.children} Children</p>
            <p><strong>Total Amount:</strong> ₦${data.totalAmount?.toLocaleString()}</p>
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Save this confirmation email for your records</li>
            <li>Arrive at the hotel by 3:00 PM on your check-in date</li>
            <li>Bring a valid ID for check-in</li>
            <li>Contact us on WhatsApp: +234 707 777 5545 for any changes</li>
          </ul>
          
          <p>We look forward to welcoming you!</p>
          <p>Best regards,<br>HotelSaver.ng Team</p>
        </div>
      </div>
    `
  },
  
  booking_reminder: {
    subject: 'Check-in Reminder - Your Stay is Tomorrow!',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #009739; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1>🏨 Check-in Tomorrow!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
          <h2>Hello ${data.guestName}!</h2>
          <p>Just a friendly reminder that your check-in is tomorrow.</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Your Booking</h3>
            <p><strong>Hotel:</strong> ${data.hotelName}</p>
            <p><strong>Check-in:</strong> Tomorrow, ${data.checkIn}</p>
            <p><strong>Room:</strong> ${data.roomType} - Room ${data.roomNumber}</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
          </div>
          
          <h3>Check-in Information</h3>
          <ul>
            <li><strong>Check-in Time:</strong> From 3:00 PM</li>
            <li><strong>Location:</strong> ${data.hotelAddress}</li>
            <li><strong>Contact:</strong> ${data.hotelPhone}</li>
          </ul>
          
          <div style="background: #e8fff1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Need Help?</strong> Contact us on WhatsApp: +234 707 777 5545</p>
          </div>
        </div>
      </div>
    `
  },
  
  room_ready: {
    subject: 'Your Room is Ready! 🏨',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #009739; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1>🎉 Your Room is Ready!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
          <h2>Good news, ${data.guestName}!</h2>
          <p>Your room is now ready for early check-in.</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Room:</strong> ${data.roomType} - Room ${data.roomNumber}</p>
            <p><strong>Available:</strong> Now</p>
            <p><strong>Floor:</strong> ${data.floor}</p>
          </div>
          
          <p>Please proceed to the front desk with your ID for check-in.</p>
          <p>Enjoy your stay!</p>
        </div>
      </div>
    `
  },
  
  status_update: {
    subject: 'Hotel Status Update',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hotel Status Update</h2>
        <p><strong>Hotel:</strong> ${data.hotelName}</p>
        <p><strong>Status:</strong> ${data.oldStatus} → ${data.newStatus}</p>
        <p><strong>Updated by:</strong> ${data.updatedBy}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
      </div>
    `
  }
};

// SMS templates (for WhatsApp integration)
const SMS_TEMPLATES = {
  booking_confirmation: (data: any) => 
    `🏨 HotelSaver.ng - Booking Confirmed!\n\nBooking ID: ${data.bookingId}\nHotel: ${data.hotelName}\nRoom: ${data.roomNumber}\nCheck-in: ${data.checkIn}\n\nTotal: ₦${data.totalAmount?.toLocaleString()}\n\nNeed help? Reply to this message!`,
    
  check_in_reminder: (data: any) => 
    `🏨 Reminder: Check-in tomorrow at ${data.hotelName}!\n\nRoom: ${data.roomNumber}\nTime: From 3:00 PM\nBooking: ${data.bookingId}\n\nSee you soon!`,
    
  room_ready: (data: any) => 
    `🎉 Great news! Your room ${data.roomNumber} is ready for early check-in at ${data.hotelName}. Proceed to front desk with ID. Enjoy your stay!`
};

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Notification queue management
interface NotificationJob {
  id: string;
  type: 'email' | 'sms' | 'both';
  template: string;
  recipient: {
    email?: string;
    phone?: string;
    name: string;
  };
  data: any;
  scheduledFor?: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  createdAt: Date;
  lastAttempt?: Date;
  error?: string;
}

class NotificationQueue {
  private jobs: NotificationJob[] = [];
  private processing = false;

  async addJob(job: Omit<NotificationJob, 'id' | 'attempts' | 'status' | 'createdAt'>) {
    const notification: NotificationJob = {
      ...job,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      attempts: 0,
      status: job.scheduledFor ? 'scheduled' : 'pending',
      createdAt: new Date()
    };
    
    this.jobs.push(notification);
    
    if (!this.processing) {
      this.processQueue();
    }
    
    return notification.id;
  }

  async processQueue() {
    if (this.processing) return;
    this.processing = true;

    try {
      const now = new Date();
      const pendingJobs = this.jobs.filter(job => 
        (job.status === 'pending' || 
         (job.status === 'scheduled' && job.scheduledFor && job.scheduledFor <= now)) &&
        job.attempts < job.maxAttempts
      );

      for (const job of pendingJobs) {
        try {
          await this.executeJob(job);
        } catch (error) {
          console.error(`Failed to execute notification job ${job.id}:`, error);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  private async executeJob(job: NotificationJob) {
    job.attempts++;
    job.lastAttempt = new Date();

    try {
      if (job.type === 'email' || job.type === 'both') {
        await this.sendEmail(job);
      }
      
      if (job.type === 'sms' || job.type === 'both') {
        await this.sendSMS(job);
      }
      
      job.status = 'sent';
      console.log(`Notification ${job.id} sent successfully`);
    } catch (error) {
      job.error = error instanceof Error ? error.message : 'Unknown error';
      
      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
        console.error(`Notification ${job.id} failed after ${job.attempts} attempts:`, error);
      } else {
        console.warn(`Notification ${job.id} attempt ${job.attempts} failed, will retry:`, error);
      }
    }
  }

  private async sendEmail(job: NotificationJob) {
    if (!job.recipient.email) {
      throw new Error('No email address provided');
    }

    const template = EMAIL_TEMPLATES[job.template as keyof typeof EMAIL_TEMPLATES];
    if (!template) {
      throw new Error(`Email template '${job.template}' not found`);
    }

    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"HotelSaver.ng" <${process.env.SMTP_FROM || 'noreply@hotelsaver.ng'}>`,
      to: job.recipient.email,
      subject: template.subject,
      html: template.html(job.data)
    });
  }

  private async sendSMS(job: NotificationJob) {
    if (!job.recipient.phone) {
      throw new Error('No phone number provided');
    }

    const template = SMS_TEMPLATES[job.template as keyof typeof SMS_TEMPLATES];
    if (!template) {
      throw new Error(`SMS template '${job.template}' not found`);
    }

    const message = template(job.data);
    
    // Here you would integrate with your SMS provider (Twilio, etc.)
    // For now, we'll simulate the SMS sending
    console.log(`SMS to ${job.recipient.phone}: ${message}`);
    
    // In production, replace with actual SMS API call:
    // await smsProvider.send({
    //   to: job.recipient.phone,
    //   message: message
    // });
  }

  getJobStatus(jobId: string) {
    return this.jobs.find(job => job.id === jobId);
  }

  getAllJobs() {
    return this.jobs;
  }

  retryFailedJob(jobId: string) {
    const job = this.jobs.find(job => job.id === jobId);
    if (job && job.status === 'failed') {
      job.status = 'pending';
      job.attempts = 0;
      job.error = undefined;
      
      if (!this.processing) {
        this.processQueue();
      }
      
      return true;
    }
    return false;
  }
}

// Global notification queue instance
const notificationQueue = new NotificationQueue();

// API endpoint for sending notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      type = 'email',
      template,
      recipient,
      data,
      scheduledFor,
      maxAttempts = 3
    } = body;

    // Validate required fields
    if (!template || !recipient || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: template, recipient, data' },
        { status: 400 }
      );
    }

    // Validate recipient
    if (type === 'email' && !recipient.email) {
      return NextResponse.json(
        { error: 'Email address required for email notifications' },
        { status: 400 }
      );
    }

    if (type === 'sms' && !recipient.phone) {
      return NextResponse.json(
        { error: 'Phone number required for SMS notifications' },
        { status: 400 }
      );
    }

    // Schedule notification
    const jobId = await notificationQueue.addJob({
      type,
      template,
      recipient,
      data,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      maxAttempts
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Notification queued successfully'
    });

  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: 'Failed to process notification request' },
      { status: 500 }
    );
  }
}

// API endpoint for checking notification status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (jobId) {
    const job = notificationQueue.getJobStatus(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Notification job not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ job });
  }

  // Return all jobs
  const jobs = notificationQueue.getAllJobs();
  return NextResponse.json({ jobs });
}

// Utility functions for common notification scenarios
export const NotificationService = {
  async sendBookingConfirmation(bookingData: {
    bookingId: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    hotelName: string;
    roomType: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    children: number;
    totalAmount: number;
  }) {
    return await notificationQueue.addJob({
      type: 'both',
      template: 'booking_confirmation',
      recipient: {
        email: bookingData.guestEmail,
        phone: bookingData.guestPhone,
        name: bookingData.guestName
      },
      data: bookingData,
      maxAttempts: 3
    });
  },

  async sendCheckInReminder(bookingData: {
    bookingId: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    hotelName: string;
    hotelAddress: string;
    hotelPhone: string;
    roomType: string;
    roomNumber: string;
    checkIn: string;
  }) {
    // Schedule for 1 day before check-in
    const checkInDate = new Date(bookingData.checkIn);
    const reminderDate = new Date(checkInDate.getTime() - 24 * 60 * 60 * 1000);
    reminderDate.setHours(10, 0, 0, 0); // Send at 10 AM

    return await notificationQueue.addJob({
      type: 'both',
      template: 'booking_reminder',
      recipient: {
        email: bookingData.guestEmail,
        phone: bookingData.guestPhone,
        name: bookingData.guestName
      },
      data: bookingData,
      scheduledFor: reminderDate,
      maxAttempts: 3
    });
  },

  async sendRoomReadyNotification(data: {
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    roomType: string;
    roomNumber: string;
    floor: number;
  }) {
    return await notificationQueue.addJob({
      type: 'both',
      template: 'room_ready',
      recipient: {
        email: data.guestEmail,
        phone: data.guestPhone,
        name: data.guestName
      },
      data,
      maxAttempts: 3
    });
  },

  async sendHotelStatusUpdate(data: {
    hotelName: string;
    oldStatus: string;
    newStatus: string;
    updatedBy: string;
    notes?: string;
    adminEmail: string;
  }) {
    return await notificationQueue.addJob({
      type: 'email',
      template: 'status_update',
      recipient: {
        email: data.adminEmail,
        name: 'Hotel Administrator'
      },
      data,
      maxAttempts: 3
    });
  },

  // Process queue manually (useful for testing)
  async processQueue() {
    return await notificationQueue.processQueue();
  },

  // Get notification status
  getJobStatus(jobId: string) {
    return notificationQueue.getJobStatus(jobId);
  },

  // Retry failed notification
  retryFailedJob(jobId: string) {
    return notificationQueue.retryFailedJob(jobId);
  }
};

// Start processing queue periodically
if (typeof window === 'undefined') {
  setInterval(() => {
    notificationQueue.processQueue();
  }, 30000); // Process every 30 seconds
}