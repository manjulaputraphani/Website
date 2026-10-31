/* ============================================================
   SITE SETTINGS
   Update business details here. The site copies these values
   into every contact panel, footer and email link.

   Form delivery uses FormSubmit. Replace the email address in
   both FormSubmit URLs if you change the trade-desk inbox.
   The first submission sends an activation link to that inbox.
   ============================================================ */

window.SITE_CONFIG = {
  businessName: "Sri Durga HariHara Enterprises",

  email: "sridurgahariharaenterprises@gmail.com",
  phoneDisplay: "+91\u00A075692\u00A008757",
  phoneE164: "+917569208757",
  whatsapp: "917569208757",
  // Add the full street address and PIN code before launch.
  address: "Bengaluru, Karnataka, India",
  // Confirm the registration details with the business before publishing.
  gstin: "37JAGPM1479E1ZE",
  // Replace with the actual Import Export Code when available.
  iec: "Available on request",

  form: {
    // FormSubmit AJAX endpoint used by the in-page form.
    ajaxEndpoint: "https://formsubmit.co/ajax/sridurgahariharaenterprises@gmail.com",
    // Standard endpoint used when JavaScript is unavailable.
    fallbackEndpoint: "https://formsubmit.co/sridurgahariharaenterprises@gmail.com",
    subject: "New trade enquiry — Sri Durga HariHara Enterprises"
  }
};
