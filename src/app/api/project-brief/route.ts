import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProjectBrief from '@/models/ProjectBrief';
import { ApiResponse } from '@/lib/api-response';
import { sendNotificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const {
      name,
      email,
      whatsapp,
      businessUrl,
      projectType,
      projectSize,
      selectedFeatures,
      designStyle,
      timeline,
      budgetRange,
      complexityScore,
      estimatedPackage,
      estimatedTimeline,
      generatedSummary,
      extraMessage,
    } = body;

    if (!name || !email || !whatsapp || !projectType || !projectSize || !designStyle || !timeline || !budgetRange) {
      return ApiResponse.error('Missing required fields', 400);
    }

    const newBrief = await ProjectBrief.create({
      name,
      email,
      whatsapp,
      businessUrl: businessUrl || '',
      projectType,
      projectSize,
      selectedFeatures: selectedFeatures || [],
      designStyle,
      timeline,
      budgetRange,
      complexityScore: Number(complexityScore) || 0,
      estimatedPackage,
      estimatedTimeline,
      generatedSummary,
      extraMessage: extraMessage || '',
      status: 'new',
    });

    // Send Project Brief email alert to Gmail
    const emailSubject = `[Portfolio Estimator] - Project Brief from ${name}`;
    
    // Create WhatsApp URL link safely
    const waClean = whatsapp.replace(/[^0-9]/g, '');
    const waLink = waClean ? `https://wa.me/${waClean}` : '';

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff; color: #333333;">
        <h2 style="color: #ff653f; border-bottom: 2px solid #ff653f; padding-bottom: 10px; margin-top: 0;">New Project Brief Received</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #555555;">A visitor has completed your Cost Estimator and submitted their project requirements.</p>
        
        <h3 style="color: #444444; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px;">Client Information</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 150px; border-bottom: 1px solid #f9f9f9;">Name:</td>
            <td style="padding: 6px 0; border-bottom: 1px solid #f9f9f9;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9;">Email:</td>
            <td style="padding: 6px 0; border-bottom: 1px solid #f9f9f9;"><a href="mailto:${email}" style="color: #ff653f; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9;">WhatsApp:</td>
            <td style="padding: 6px 0; border-bottom: 1px solid #f9f9f9;">
              ${waLink ? `<a href="${waLink}" style="color: #ff653f; text-decoration: none; font-weight: bold;">${whatsapp} ↗</a>` : whatsapp}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9;">Business URL:</td>
            <td style="padding: 6px 0; border-bottom: 1px solid #f9f9f9;">
              ${businessUrl ? `<a href="${businessUrl}" target="_blank" style="color: #ff653f; text-decoration: none;">${businessUrl}</a>` : 'N/A'}
            </td>
          </tr>
        </table>

        <h3 style="color: #444444; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px;">Project Requirements</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 150px; border-bottom: 1px solid #f9f9f9;">Project Type:</td>
            <td style="padding: 6px 0; border-bottom: 1px solid #f9f9f9;">${projectType}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9;">Project Size:</td>
            <td style="padding: 6px 0; border-bottom: 1px solid #f9f9f9;">${projectSize}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9;">Design Style:</td>
            <td style="padding: 6px 0; border-bottom: 1px solid #f9f9f9;">${designStyle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9;">Target Timeline:</td>
            <td style="padding: 6px 0; border-bottom: 1px solid #f9f9f9;">${timeline}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9;">Budget Range:</td>
            <td style="padding: 6px 0; border-bottom: 1px solid #f9f9f9; font-weight: bold; color: #ff653f;">${budgetRange}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; vertical-align: top; border-bottom: 1px solid #f9f9f9;">Selected Features:</td>
            <td style="padding: 6px 0; border-bottom: 1px solid #f9f9f9;">
              ${selectedFeatures && selectedFeatures.length > 0 ? selectedFeatures.join(', ') : 'None'}
            </td>
          </tr>
        </table>

        <h3 style="color: #444444; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px;">Auto Estimate Result</h3>
        <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; font-weight: bold; width: 150px;">Estimated Package:</td>
              <td style="padding: 4px 0; font-weight: bold; color: #ff653f;">${estimatedPackage}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold;">Estimated Timeline:</td>
              <td style="padding: 4px 0;">${estimatedTimeline}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold;">Complexity Score:</td>
              <td style="padding: 4px 0;">${complexityScore} / 100</td>
            </tr>
          </table>
        </div>

        ${extraMessage ? `
          <h3 style="color: #444444; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px;">Client Message</h3>
          <div style="padding: 12px; background-color: #f5f5f5; border-left: 4px solid #ff653f; border-radius: 4px; font-size: 13px; color: #555555; white-space: pre-wrap; line-height: 1.5; margin-bottom: 20px;">
${extraMessage}
          </div>
        ` : ''}

        <p style="font-size: 11px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">
          This brief was generated and sent from your portfolio website's Cost Estimator.
        </p>
      </div>
    `;

    // Await the email dispatch to ensure the serverless container does not terminate prematurely
    await sendNotificationEmail(emailSubject, emailHtml);

    return ApiResponse.success(newBrief, 'Project brief submitted successfully', 201);
  } catch (err: any) {
    console.error('Error submitting project brief:', err);
    return ApiResponse.serverError(err.message || 'Failed to submit project brief');
  }
}
