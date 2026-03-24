const ContactInquiry = require("../models/ContactInquiry");
const nodemailer = require("nodemailer");
const {
  buildAdminNotificationTemplate,
  buildResolvedConfirmationTemplate,
} = require("../email_templates/contactEmailTemplates");

// Submit contact form (public)
exports.submitInquiry = async (req, res) => {
  try {
    const inquiry = await ContactInquiry.create(req.body);

    // Send notification email to admin
    await sendNotificationEmail(inquiry);

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully. We will contact you soon.",
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting inquiry",
      error: error.message,
    });
  }
};

// Get all inquiries (admin)
exports.getAllInquiries = async (req, res) => {
  try {
    const { status, inquiry_type, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const inquiries = await ContactInquiry.findAll({
      status,
      inquiry_type,
      limit: parseInt(limit),
      offset,
    });

    res.status(200).json({
      success: true,
      data: inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching inquiries",
      error: error.message,
    });
  }
};

// Get inquiry statistics (admin)
exports.getInquiryStats = async (req, res) => {
  try {
    const stats = await ContactInquiry.getStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// Get single inquiry (admin)
exports.getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await ContactInquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching inquiry",
      error: error.message,
    });
  }
};

// Update inquiry status (admin)
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, assigned_to } = req.body;

    const inquiry = await ContactInquiry.updateStatus(
      id,
      status,
      admin_notes,
      assigned_to,
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // Send response email if status is resolved
    if (status === "resolved") {
      await sendResponseEmail(inquiry);
    }

    res.status(200).json({
      success: true,
      message: "Inquiry status updated successfully",
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating inquiry status",
      error: error.message,
    });
  }
};

// Delete inquiry (admin)
exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await ContactInquiry.delete(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting inquiry",
      error: error.message,
    });
  }
};

// Send notification email to admin
async function sendNotificationEmail(inquiry) {
  if (!process.env.SMTP_HOST) return;

  try {
    const template = buildAdminNotificationTemplate(inquiry);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"AI House Website" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || "maison_ia@univ-blida.dz",
      subject: template.subject,
      html: template.html,
    });
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}

// Send response confirmation email
async function sendResponseEmail(inquiry) {
  if (!process.env.SMTP_HOST) return;

  try {
    const template = buildResolvedConfirmationTemplate(inquiry);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Blida 1 AI House" <${process.env.SMTP_USER}>`,
      to: inquiry.email,
      subject: template.subject,
      html: template.html,
    });
  } catch (error) {
    console.error("Failed to send response email:", error);
  }
}
