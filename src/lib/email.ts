import { Resend } from 'resend';
import { Project } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendAdminNotification = async (project: Project) => {
  try {
    await resend.emails.send({
      from: 'notifications@yourdomain.com',
      to: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
      subject: `New Project Submission: ${project.name}`,
      html: `
        <h2>New Project Submitted for Review</h2>
        <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 16px 0;">
          <h3>${project.name}</h3>
          <p><strong>Tagline:</strong> ${project.tagline}</p>
          <p><strong>Website:</strong> <a href="${project.websiteUrl}">${project.websiteUrl}</a></p>
          <p><strong>Category:</strong> ${project.category}</p>
          <p><strong>Submitted by:</strong> ${project.submitterEmail}</p>
          <p><strong>Submitted at:</strong> ${new Date(project.submittedAt.seconds * 1000).toLocaleString()}</p>
          
          <div style="margin-top: 16px;">
            <strong>Description:</strong>
            <p style="white-space: pre-wrap; margin-top: 8px;">${project.description}</p>
          </div>
          
          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_URL}/admin" 
               style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
              Review in Admin Panel
            </a>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
};

export const sendApprovalEmail = async (project: Project) => {
  try {
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: project.submitterEmail,
      subject: `🎉 Your project "${project.name}" has been approved!`,
      html: `
        <h2>Great news! Your project has been approved</h2>
        <p>Hi there,</p>
        <p>We're excited to let you know that <strong>${project.name}</strong> has been approved and is now live on our platform!</p>
        
        <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; background: #f9fafb;">
          <h3>${project.name}</h3>
          <p>${project.tagline}</p>
          <a href="${process.env.NEXT_PUBLIC_URL}/project/${project.id}" 
             style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">
            View Your Project
          </a>
        </div>
        
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>Your project is now visible to our community</li>
          <li>You'll start receiving traffic and potential backlinks</li>
          <li>Community members can vote and comment on your project</li>
          <li>You can track your project's performance in your dashboard</li>
        </ul>
        
        <p>Thank you for submitting your project. We wish you great success!</p>
        
        <p>Best regards,<br>The Startup Directory Team</p>
      `
    });
  } catch (error) {
    console.error('Failed to send approval email:', error);
  }
};

export const sendRejectionEmail = async (project: Project, reason: string) => {
  try {
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: project.submitterEmail,
      subject: `Update on your project submission: ${project.name}`,
      html: `
        <h2>Update on your project submission</h2>
        <p>Hi there,</p>
        <p>Thank you for submitting <strong>${project.name}</strong> to our platform.</p>
        
        <p>After reviewing your submission, we're unable to approve it at this time for the following reason:</p>
        
        <div style="border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; background: #fffbeb; margin: 20px 0;">
          <strong>Reason:</strong> ${reason}
        </div>
        
        <p><strong>What you can do:</strong></p>
        <ul>
          <li>Address the feedback provided above</li>
          <li>Make the necessary improvements to your project</li>
          <li>Submit your project again when ready</li>
        </ul>
        
        <p>We encourage you to resubmit once you've addressed our feedback. We're here to help great projects succeed!</p>
        
        <p>If you have any questions, feel free to reply to this email.</p>
        
        <p>Best regards,<br>The Startup Directory Team</p>
      `
    });
  } catch (error) {
    console.error('Failed to send rejection email:', error);
  }
};
