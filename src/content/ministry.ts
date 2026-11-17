/**
 * Giving details. Empty strings render a clearly marked "not yet published"
 * state rather than invented account numbers. Fill these in from the ministry.
 */

export const giving = {
  intro:
    "Your giving sustains the teaching, the training and the outreach of the fellowship. Every gift is received with thanksgiving, and no one is pressured to give.",
  bank: {
    bankName: "", // e.g. "Guaranty Trust Bank"
    accountName: "",
    accountNumber: "",
    sortCode: "",
    currency: "NGN",
  },
  paystack: {
    // Public checkout link, e.g. https://paystack.shop/pay/tsop
    link: "",
    enabled: false,
  },
  notes: [
    "Giving is never a condition of membership, and no one at TSOP will ask you for money in a private message.",
    "If you would like a receipt or to designate a gift toward training, tell an admin when you give.",
  ],
  /** Shown while the details are blank. */
  pendingMessage:
    "Account details are being confirmed with the ministry and will be published here. In the meantime, use the contact form and an admin will send them to you directly.",
};

export const training = {
  status: "closed" as "open" | "closed",
  cohortLabel: "Next cohort",
  cohortNote: "Dates and syllabus for the next cohort are announced in the community first.",
  intro:
    "The School of Prophets Bible Institute is an intensive training for those called into ministry and for believers with spiritual gifts, preparing them for what God has placed in their hands.",
  forWhom: [
    "Those sensing a call to the prophetic office.",
    "Believers with gifts who want accuracy and maturity.",
    "Leaders who want to disciple others well. [confirm]",
  ],
  syllabus: [
    {
      title: "Hearing and discerning the voice of God",
      body: "How God speaks, how to test what you hear, and how to wait when He is silent.",
    },
    {
      title: "Word of knowledge and the gifts of the Spirit",
      body: "The manifestations of the Spirit in the life of an ordinary believer, with their order and their limits.",
    },
    {
      title: "The prophetic office and its responsibilities",
      body: "What the office is, what it is not, and the weight of speaking in God's name.",
    },
    {
      title: "Prayer and intercession",
      body: "Building a life of prayer that outlasts mood, and standing in the gap for others.",
    },
    {
      title: "Walking in character, not just gifting",
      body: "The fruit that must accompany the gift, and the disciplines that keep a vessel usable.",
    },
  ],
  enrolmentNote:
    "Cohorts open for limited periods. When enrolment is open, the application below is live. When it is closed, the form becomes a waitlist and you will be told first.",
  costs: "Costs are set per cohort and published with each enrolment window. [confirm]",
};
