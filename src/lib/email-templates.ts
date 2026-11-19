/**
 * The School of Prophets — Liturgical & Modern HTML Email Templates
 * Designed for high deliverability across all email clients (Gmail, Apple Mail, Outlook).
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : "https://theschoolofprophets.site";

export type BaseEmailOptions = {
  preheader?: string;
  badge?: string;
  title: string;
  paragraphs?: string[];
  htmlBody?: string;
  highlightBox?: {
    label?: string;
    items: { label: string; value: string }[];
  };
  cta?: {
    label: string;
    url: string;
  };
  closing?: string;
  footerNote?: string;
};

/**
 * Base responsive email layout matching the TSOP visual brand:
 * Deep ink, rich liturgical gold, warm parchment surfaces, elegant typography.
 */
export function buildHtmlEmail(options: BaseEmailOptions): string {
  const {
    preheader = "",
    badge = "The School of Prophets",
    title,
    paragraphs = [],
    htmlBody,
    highlightBox,
    cta,
    closing = "Grace and peace,<br /><strong>The School of Prophets</strong>",
    footerNote = "The School of Prophets · Interdenominational Fellowship · Africa/Lagos (WAT)",
  } = options;

  const crestUrl = `${SITE_URL}/images/tsop-crest.png`;

  const paragraphsHtml = htmlBody
    ? `<div style="font-size: 15px; line-height: 1.65; color: #2d261e;">${htmlBody}</div>`
    : paragraphs
        .map(
          (p) =>
            `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #2d261e;">${p}</p>`
        )
        .join("");

  const highlightHtml = highlightBox
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; background-color: #f6f3eb; border-left: 3px solid #c89b3c; border-radius: 4px;">
      <tr>
        <td style="padding: 16px 20px;">
          ${
            highlightBox.label
              ? `<div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8c734b; font-weight: 700; margin-bottom: 10px;">${highlightBox.label}</div>`
              : ""
          }
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${highlightBox.items
              .map(
                (item) => `
              <tr>
                <td style="padding: 4px 0; font-size: 13px; color: #6b5e51; width: 38%; font-weight: 600;">${item.label}:</td>
                <td style="padding: 4px 0; font-size: 14px; color: #181511; font-weight: 500;">${item.value}</td>
              </tr>
            `
              )
              .join("")}
          </table>
        </td>
      </tr>
    </table>
  `
    : "";

  const ctaHtml = cta
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: 6px; background-color: #c89b3c; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
                <a href="${cta.url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #14120e; font-weight: 700; text-decoration: none; border-radius: 6px; letter-spacing: 0.02em;">
                  ${cta.label} &rarr;
                </a>
              </td>
            </tr>
          </table>
          <p style="margin: 12px 0 0 0; font-size: 12px; color: #8c7f70;">
            If the button doesn't work, copy and paste this link: <br />
            <a href="${cta.url}" style="color: #a67c2e; word-break: break-all;">${cta.url}</a>
          </p>
        </td>
      </tr>
    </table>
  `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #ede9e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; display: block; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; }
      .content-padding { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ede9e0; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text for inbox previews -->
  <div style="display: none; font-size: 1px; color: #ede9e0; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader || title}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ede9e0; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" class="container" width="580" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(20, 18, 14, 0.08); border: 1px solid #dfd8c7;">
          
          <!-- Top Brand Header -->
          <tr>
            <td style="background-color: #14120e; padding: 28px 24px 24px 24px; text-align: center; border-bottom: 2px solid #c89b3c;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${crestUrl}" alt="The School of Prophets" width="48" height="54" style="margin-bottom: 12px; max-width: 48px; height: auto;" />
                    <h1 style="margin: 0; font-family: Georgia, Cambria, 'Times New Roman', serif; font-size: 18px; letter-spacing: 0.16em; text-transform: uppercase; color: #f8f6f0; font-weight: 500;">
                      The School of Prophets
                    </h1>
                    <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #c89b3c; font-style: italic;">
                      &ldquo;The Most High rules in the kingdom of men&rdquo; &middot; Dan 4:17
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td class="content-padding" style="padding: 36px 36px 28px 36px; background-color: #ffffff;">
              <!-- Section Badge -->
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #a67c2e; font-weight: 700; margin-bottom: 8px;">
                ${badge}
              </div>

              <!-- Email Title -->
              <h2 style="margin: 0 0 20px 0; font-family: Georgia, Cambria, 'Times New Roman', serif; font-size: 24px; line-height: 1.3; color: #14120e; font-weight: 600;">
                ${title}
              </h2>

              <!-- Body Paragraphs -->
              ${paragraphsHtml}

              <!-- Highlights / Structured Data -->
              ${highlightHtml}

              <!-- Call to Action Button -->
              ${ctaHtml}

              <!-- Closing Sign-off -->
              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #eee9df; font-size: 14px; line-height: 1.6; color: #4a4035;">
                ${closing}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7f4ed; padding: 24px 32px; text-align: center; border-top: 1px solid #e6dfcf;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #736758; line-height: 1.5;">
                ${footerNote}
              </p>
              <p style="margin: 0; font-size: 12px; color: #a69885;">
                <a href="${SITE_URL}" style="color: #a67c2e; text-decoration: underline;">Official Website</a> &middot;
                <a href="${SITE_URL}/gatherings" style="color: #a67c2e; text-decoration: underline;">Weekly Gatherings</a> &middot;
                <a href="${SITE_URL}/contact" style="color: #a67c2e; text-decoration: underline;">Contact Us</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Team Invitation Email
 */
export function renderInviteEmail(params: {
  fullName: string;
  email: string;
  role: string;
  inviteLink: string;
  invitedByName?: string;
}): { subject: string; html: string; text: string } {
  const roleLabels: Record<string, string> = {
    owner: "Owner (Full administrative and team access)",
    admin: "Administrator (Content, bookings, and inbox moderation)",
    moderator: "Moderator (Inbox submissions, testimonies, and prayer requests)",
    viewer: "Viewer (Read-only dashboard access)",
  };

  const roleName = roleLabels[params.role] ?? params.role;
  const inviter = params.invitedByName || "An administrator";

  const subject = `You're invited to join The School of Prophets team`;
  const paragraphs = [
    `Hello ${params.fullName || "there"},`,
    `${inviter} has invited you to join the ministry dashboard of <strong>The School of Prophets</strong> as an <strong>${params.role.toUpperCase()}</strong>.`,
    `To activate your account and gain access, please click the button below to choose your secure password. Once set up, you will always use your email (<code>${params.email}</code>) and your chosen password to sign in.`,
  ];

  const html = buildHtmlEmail({
    badge: "Staff Invitation",
    title: "Join the Ministry Team",
    preheader: `${inviter} has invited you to join The School of Prophets team as ${params.role}.`,
    paragraphs,
    highlightBox: {
      label: "Account Details",
      items: [
        { label: "Assigned Role", value: roleName },
        { label: "Account Email", value: params.email },
        { label: "Dashboard URL", value: `${SITE_URL}/admin/login` },
      ],
    },
    cta: {
      label: "Accept Invitation & Set Password",
      url: params.inviteLink,
    },
    closing: "Grace and peace,<br /><strong>The School of Prophets Leadership</strong>",
  });

  const text = `Hello ${params.fullName || "there"},\n\n` +
    `${inviter} has invited you to join The School of Prophets as ${params.role}.\n\n` +
    `Role: ${roleName}\n` +
    `Email: ${params.email}\n\n` +
    `Please set up your password here:\n${params.inviteLink}\n\n` +
    `Once configured, you can always sign in at ${SITE_URL}/admin/login using your email and password.\n\n` +
    `The School of Prophets`;

  return { subject, html, text };
}

/**
 * 2. Form Submission Confirmation Email
 */
export function renderConfirmationEmail(params: {
  name: string;
  type: string;
}): { subject: string; html: string; text: string } {
  const subject = `We received your ${params.type} — The School of Prophets`;
  const paragraphs = [
    `Hello ${params.name || "there"},`,
    `Thank you for reaching out to <strong>The School of Prophets</strong>. We have received your ${params.type}.`,
    `A member of our pastoral and ministry team will review your submission prayerfully and respond if a reply or follow-up is needed.`,
    `We stand in faith with you and pray that God's grace and illumination abound in your life.`,
  ];

  const html = buildHtmlEmail({
    badge: "Message Received",
    title: "Thank You for Reaching Out",
    preheader: `We have received your ${params.type}. A member of the team will respond soon.`,
    paragraphs,
    cta: {
      label: "Explore Teachings & Resources",
      url: `${SITE_URL}/teachings`,
    },
  });

  const text = `Hello ${params.name || "there"},\n\n` +
    `Thank you for reaching out to The School of Prophets. We have received your ${params.type}.\n\n` +
    `A member of the team will respond soon.\n\n` +
    `The School of Prophets`;

  return { subject, html, text };
}

/**
 * Newsletter Welcome Email (Daily Devotions, Teaching Alerts, Weekly Letter)
 */
export function renderNewsletterWelcomeEmail(params: {
  name: string;
}): { subject: string; html: string; text: string } {
  const firstName = params.name ? params.name.split(" ")[0] : "Beloved";
  const subject = `Welcome to the Fellowship: Daily Devotions & Teaching Alerts — The School of Prophets`;
  const paragraphs = [
    `Grace, peace, and spiritual illumination be multiplied to you, ${firstName}.`,
    `You are now connected to the spiritual lifeline of <strong>The School of Prophets</strong>. This subscription is essential for every disciple and believer in our fellowship to remain continually fed, anchored, and aligned with what God is speaking in this hour.`,
    `<strong>Please make checking your email a daily habit.</strong> We deliver everyday spiritual nourishment directly to your inbox so you never miss a prophetic impartation or timely Word.`,
  ];

  const html = buildHtmlEmail({
    badge: "Daily Devotions & Dispatches",
    title: "Welcome to The Fellowship",
    preheader: `Your daily devotions and teaching alerts are active. Please check your email every day to stay spiritually fed.`,
    paragraphs,
    highlightBox: {
      label: "What You Will Receive in Your Inbox",
      items: [
        {
          label: "Everyday Morning Devotions",
          value: "Scripture, prophetic exhortation, and prayer delivered every morning to anchor your day.",
        },
        {
          label: "Instant Teaching Alerts",
          value: "Immediate notifications whenever a new sermon, audio recording, or study is uploaded.",
        },
        {
          label: "Weekly Fellowship Letter",
          value: "Prophetic outlines, gathering times, and fellowship notices sent each week.",
        },
        {
          label: "Daily Action",
          value: "Check your email daily. Add our address to your contacts or VIP list so you never miss a devotion.",
        },
      ],
    },
    cta: {
      label: "Explore Recent Teachings",
      url: `${SITE_URL}/teachings`,
    },
    closing: `Planted in the Word. Moved by the Spirit. Built on prayer.<br /><br />Grace and peace,<br /><strong>The School of Prophets</strong>`,
    footerNote: `You are receiving this because you subscribed to daily devotions and teaching alerts at The School of Prophets.`,
  });

  const text =
    `Hello ${firstName},\n\n` +
    `Grace, peace, and spiritual illumination be multiplied to you. Welcome to The School of Prophets.\n\n` +
    `You are now connected to our spiritual dispatch. This subscription is essential for every disciple and believer in our fellowship to stay fed and aligned:\n\n` +
    `1. EVERYDAY MORNING DEVOTIONS:\n` +
    `Scripture, prophetic exhortation, and prayer delivered every morning to anchor your walk.\n\n` +
    `2. INSTANT TEACHING ALERTS:\n` +
    `Immediate notification whenever a new sermon or audio recording is uploaded to the library.\n\n` +
    `3. WEEKLY FELLOWSHIP LETTER:\n` +
    `Prophetic outlines, gathering times, and notices from the fellowship.\n\n` +
    `IMPORTANT: PLEASE CHECK YOUR EMAIL DAILY.\n` +
    `Make checking your email a daily habit. Please add our email address to your contacts or VIP list, or move this message to your Primary inbox so you never miss a devotion.\n\n` +
    `Explore recent teachings: ${SITE_URL}/teachings\n\n` +
    `Planted in the Word. Moved by the Spirit. Built on prayer.\n\n` +
    `The School of Prophets`;

  return { subject, html, text };
}

/**
 * New Teaching Uploaded Notification Email
 */
export function renderTeachingPublishedEmail(params: {
  name: string;
  title: string;
  slug: string;
  summary?: string | null;
}): { subject: string; html: string; text: string } {
  const firstName = params.name ? params.name.split(" ")[0] : "Beloved";
  const subject = `New Teaching Uploaded: "${params.title}" — The School of Prophets`;
  const paragraphs = [
    `Grace and peace to you, ${firstName}.`,
    `A fresh teaching has just been uploaded to <strong>The School of Prophets</strong> library. We encourage you to listen, meditate on the Word, and let the Holy Spirit speak to your heart.`,
  ];

  if (params.summary) {
    paragraphs.push(`<em>"${params.summary}"</em>`);
  }

  const teachingUrl = `${SITE_URL}/teachings/${params.slug}`;

  const html = buildHtmlEmail({
    badge: "New Teaching Alert",
    title: params.title,
    preheader: `A new teaching has been uploaded: "${params.title}". Watch or listen now.`,
    paragraphs,
    highlightBox: {
      label: "Teaching Details",
      items: [
        { label: "Title", value: params.title },
        { label: "Access Link", value: teachingUrl },
      ],
    },
    cta: {
      label: "Watch & Listen Now",
      url: teachingUrl,
    },
    closing: `Planted in the Word. Moved by the Spirit. Built on prayer.<br /><br />Grace and peace,<br /><strong>The School of Prophets</strong>`,
    footerNote: `You are receiving this teaching alert because you subscribed to The School of Prophets updates.`,
  });

  const text =
    `Hello ${firstName},\n\n` +
    `A new teaching has just been uploaded to The School of Prophets: "${params.title}".\n\n` +
    (params.summary ? `Summary: ${params.summary}\n\n` : "") +
    `Watch or listen here:\n${teachingUrl}\n\n` +
    `Planted in the Word. Moved by the Spirit. Built on prayer.\n\n` +
    `The School of Prophets`;

  return { subject, html, text };
}

/**
 * 3. Call Booking Confirmed Email
 */
export function renderBookingConfirmedEmail(params: {
  name: string;
  time: string;
  joinLink?: string;
  cancelLink?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Your call is confirmed — The School of Prophets`;
  const paragraphs = [
    `Hello ${params.name || "there"},`,
    `Your one-on-one session with The School of Prophets has been confirmed.`,
    `Please find your appointment details below. We recommend joining 2–3 minutes early in a quiet environment.`,
  ];

  const items = [
    { label: "Date & Time", value: `${params.time} (West Africa Time)` },
  ];
  if (params.joinLink) {
    items.push({ label: "Meeting Link", value: params.joinLink });
  }

  const html = buildHtmlEmail({
    badge: "Booking Confirmed",
    title: "Your Ministry Call is Booked",
    preheader: `Your session is confirmed for ${params.time} (WAT).`,
    paragraphs,
    highlightBox: {
      label: "Appointment Details",
      items,
    },
    cta: params.joinLink
      ? {
          label: "Join Video Call",
          url: params.joinLink,
        }
      : undefined,
    closing: `Blessings,<br /><strong>The School of Prophets</strong>${
      params.cancelLink
        ? `<p style="margin-top: 14px; font-size: 12px; color: #888;">Need to reschedule or cancel? <a href="${params.cancelLink}" style="color: #a67c2e;">Manage your booking here</a>.</p>`
        : ""
    }`,
  });

  const text = `Hello ${params.name || "there"},\n\n` +
    `Your call is confirmed for ${params.time} (WAT).\n\n` +
    (params.joinLink ? `Join link: ${params.joinLink}\n\n` : "") +
    (params.cancelLink ? `Reschedule/cancel: ${params.cancelLink}\n\n` : "") +
    `The School of Prophets`;

  return { subject, html, text };
}

/**
 * 4. Call Cancelled Email
 */
export function renderBookingCancelledEmail(params: {
  name: string;
  time: string;
  reason?: string;
  bookLink?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Update regarding your booking — The School of Prophets`;
  const paragraphs = [
    `Hello ${params.name || "there"},`,
    `Your call originally scheduled for <strong>${params.time} (WAT)</strong> has been cancelled.`,
    params.reason
      ? `<strong>Reason:</strong> ${params.reason}`
      : "We apologize for any inconvenience this may cause to your schedule.",
    `You are very welcome to choose another convenient time on our booking calendar.`,
  ];

  const html = buildHtmlEmail({
    badge: "Booking Update",
    title: "Call Cancelled",
    preheader: `Your call scheduled for ${params.time} has been cancelled.`,
    paragraphs,
    cta: {
      label: "Book a New Session",
      url: params.bookLink || `${SITE_URL}/book`,
    },
  });

  const text = `Hello ${params.name || "there"},\n\n` +
    `Your call scheduled for ${params.time} has been cancelled.\n` +
    (params.reason ? `Reason: ${params.reason}\n\n` : "\n") +
    `You can book a new time here: ${params.bookLink || `${SITE_URL}/book`}\n\n` +
    `The School of Prophets`;

  return { subject, html, text };
}

/**
 * 5. Enrolment Accepted Email
 */
export function renderEnrolmentAcceptedEmail(params: {
  name: string;
  cohortName?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Welcome to The School of Prophets — Application Accepted`;
  const paragraphs = [
    `Hello ${params.name || "there"},`,
    `Grace and peace to you in the name of our Lord Jesus Christ.`,
    `We are delighted to inform you that your application for enrolment in <strong>${
      params.cohortName || "The School of Prophets"
    }</strong> has been accepted!`,
    `You have been prayerfully considered and selected for this intake. The training is intensive, systematic, and focused on grounded prophetic character, hearing God with accuracy, and upright kingdom stewardship.`,
    `Please stay tuned for orientation details, calendar schedules, and preparatory reading.`,
  ];

  const html = buildHtmlEmail({
    badge: "Admissions Office",
    title: "Application Accepted",
    preheader: `Welcome to The School of Prophets! Your enrolment application has been accepted.`,
    paragraphs,
    cta: {
      label: "View Training Details",
      url: `${SITE_URL}/training`,
    },
    closing: "In His service,<br /><strong>Prophet Lawrence Iwara & The Faculty</strong>",
  });

  const text = `Hello ${params.name || "there"},\n\n` +
    `We are joyful to inform you that your enrolment application for ${
      params.cohortName || "The School of Prophets"
    } has been accepted!\n\n` +
    `Orientation details will follow shortly.\n\n` +
    `Grace and peace,\nThe School of Prophets`;

  return { subject, html, text };
}

/**
 * 6. Enrolment Declined Email
 */
export function renderEnrolmentDeclinedEmail(params: {
  name: string;
}): { subject: string; html: string; text: string } {
  const subject = `Update regarding your application — The School of Prophets`;
  const paragraphs = [
    `Hello ${params.name || "there"},`,
    `Thank you for your sincere interest in joining The School of Prophets and taking time to share your heart and ministry walk with us.`,
    `After thorough prayer and consideration by the leadership team, we are unable to offer you a seat for this particular cohort due to capacity and cohort balance.`,
    `This is not a reflection of your standing in Christ or your calling. We warmly invite you to continue participating in our Weekly Gatherings, Bible studies, and Convergence nights.`,
  ];

  const html = buildHtmlEmail({
    badge: "Admissions Update",
    title: "Admissions Decision",
    preheader: `Update regarding your application to The School of Prophets.`,
    paragraphs,
    cta: {
      label: "Join Our Weekly Gatherings",
      url: `${SITE_URL}/gatherings`,
    },
    closing: "With love in Christ,<br /><strong>The School of Prophets Admissions</strong>",
  });

  const text = `Hello ${params.name || "there"},\n\n` +
    `Thank you for your interest in The School of Prophets. After prayerful review, we are unable to offer you a seat for this intake.\n\n` +
    `We invite you to continue gathering with us weekly online: ${SITE_URL}/gatherings\n\n` +
    `Grace and peace,\nThe School of Prophets`;

  return { subject, html, text };
}

/**
 * 7. Waitlist Priority Email
 */
export function renderWaitlistOpenEmail(params: {
  name: string;
  link?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Applications are now open — The School of Prophets`;
  const paragraphs = [
    `Hello ${params.name || "there"},`,
    `We are writing to let you know that applications have just opened for the upcoming intake of <strong>The School of Prophets</strong>!`,
    `Because you joined our priority waitlist, you have first access to submit your application before the general public deadline.`,
    `Seats are limited to maintain close mentorship and spiritual oversight. We encourage you to complete your application promptly.`,
  ];

  const html = buildHtmlEmail({
    badge: "Priority Admissions",
    title: "Applications Are Now Open",
    preheader: `Priority access: Applications have opened for the upcoming intake.`,
    paragraphs,
    cta: {
      label: "Submit Application Now",
      url: params.link || `${SITE_URL}/training`,
    },
  });

  const text = `Hello ${params.name || "there"},\n\n` +
    `Applications have just opened for the upcoming intake! As you joined our waitlist, you have priority access:\n\n` +
    `${params.link || `${SITE_URL}/training`}\n\n` +
    `The School of Prophets`;

  return { subject, html, text };
}

/**
 * 8. Beta review — thank you to the tester, with a summary of what they sent.
 */
export function renderBetaConfirmationEmail(params: {
  name: string;
  lines: string[];
  priority?: boolean;
}): { subject: string; html: string; text: string } {
  const subject = "Thank you for reviewing the site — The School of Prophets";
  const paragraphs = [
    `Hello ${params.name || "friend"},`,
    `Thank you for taking the time to test the site and tell us the truth about it. Your review is now with the team, and every one is read.`,
    `Here is what you sent us, for your own records. If we fixed something you found, we will write again.`,
  ];

  const html = buildHtmlEmail({
    badge: "Beta Review Received",
    title: "Thank you for being among the first",
    preheader: "Your review of the site has been received. The team reads every one.",
    paragraphs,
    highlightBox: {
      label: "What you sent",
      items: params.lines.map((line) => {
        const [label, ...rest] = line.split(":");
        return { label, value: rest.join(":").trim() || "—" };
      }),
    },
    cta: {
      label: "Return to the site",
      url: SITE_URL,
    },
    closing: "With gratitude,<br /><strong>The School of Prophets</strong>",
  });

  const text = `Hello ${params.name || "friend"},\n\n` +
    `Thank you for taking the time to test the site and tell us the truth about it. Your review is now with the team, and every one is read.\n\n` +
    `${params.lines.join("\n")}\n\n` +
    `With gratitude,\nThe School of Prophets`;

  return { subject, html, text };
}

/**
 * 9. "We fixed what you found" — optional note to a beta tester.
 */
export function renderBetaFixedEmail(params: {
  name: string;
  count: number;
  note?: string;
}): { subject: string; html: string; text: string } {
  const what = params.count === 1 ? "the issue you found" : "the issues you found";
  const subject = "We fixed what you found — The School of Prophets";
  const paragraphs = [
    `Hello ${params.name || "friend"},`,
    `A short note to say thank you again. We have worked on ${what} in your beta review.`,
    params.note ? String(params.note) : `If it still is not right, reply to this email and tell us. That is exactly what this beta is for.`,
  ];

  const html = buildHtmlEmail({
    badge: "Beta Update",
    title: "We fixed what you found",
    preheader: `An update on ${what} from your beta review.`,
    paragraphs,
    cta: { label: "Open the site again", url: SITE_URL },
    closing: "With gratitude,<br /><strong>The School of Prophets</strong>",
  });

  const text = `Hello ${params.name || "friend"},\n\n` +
    `We have worked on ${what} in your beta review.\n\n` +
    `${params.note ?? "If it still is not right, reply and tell us."}\n\n` +
    `The School of Prophets`;

  return { subject, html, text };
}

/**
 * 10. General Templated / Custom Email
 */
export function renderGenericEmail(params: {
  title: string;
  badge?: string;
  bodyText: string;
  cta?: { label: string; url: string };
}): { html: string; text: string } {
  const paragraphs = params.bodyText.split("\n\n").filter(Boolean);
  const html = buildHtmlEmail({
    badge: params.badge || "The School of Prophets",
    title: params.title,
    paragraphs,
    cta: params.cta,
  });

  return { html, text: params.bodyText };
}

/**
 * 11. Password Recovery Email
 */
export function renderPasswordResetEmail(params: {
  resetUrl: string;
  email: string;
}): { html: string; text: string; subject: string } {
  const { resetUrl, email } = params;
  const subject = "Reset Your Administrator Password — The School of Prophets";
  const html = buildHtmlEmail({
    badge: "Security & Recovery",
    title: "Password Recovery Request",
    preheader: "Secure link to choose a new password for The School of Prophets portal",
    paragraphs: [
      `A request has been made to reset the password for your administrator account (<strong>${email}</strong>) at The School of Prophets.`,
      "Click the gold button below to create your new password. For your protection, this secure link is valid for 60 minutes and can only be used once.",
    ],
    highlightBox: {
      label: "Account Details",
      items: [
        { label: "Account Email", value: email },
        { label: "Link Validity", value: "60 minutes" },
        { label: "Destination", value: "The School of Prophets Admin" },
      ],
    },
    cta: {
      label: "Reset My Password",
      url: resetUrl,
    },
    closing:
      "If you did not request this password recovery, you can safely ignore this message. Your password will remain unchanged.<br /><br />Ministry Administrative Security,<br /><strong>The School of Prophets</strong>",
  });

  const text = `The School of Prophets — Password Recovery\n\nA request was made to reset the password for your administrator account (${email}).\n\nTo choose a new password, click the secure link below:\n${resetUrl}\n\nThis link is valid for 60 minutes.\nIf you did not request this change, please ignore this email.`;

  return { html, text, subject };
}
