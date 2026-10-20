/*
  Offer flow prototype: test data
  Edit this file to change the offer content (products, prices, account manager, copy).
  Dummy/test data only. Never paste real client data or back-office HTML here.
*/
window.OFFER = {
  project: {
    number: "5436794",
    company: "Loopper",
    client: "Cayna",
    orderBefore: "Thu 22 Oct, 12:00",
    deliveryDate: "Fri 30 Oct",
    validUntil: "3 Nov",
    vatRate: 0.2,
    vatLabel: "VAT 20% (UK)",
    paymentTerms: "Paid before production starts",
  },

  am: {
    name: "Caynalin",
    initials: "CB",
    phone: "+44 20 4576 5960",
    email: "caynalin@loopper.com",
    quote:
      "Questions about sizes, colours or delivery? Call or email me, I'm happy to help.",
  },

  intro:
    "I've put together 3 products with your logo. Switch off what you don't need, pick your quantities and continue when you're happy.",

  logos: [
    { type: "file", name: "ydh_white.png", received: "13 Oct, 18:00" },
    { type: "text", text: "FAKE OFFER BY MARKETING", font: "Times New Roman", colour: "purple" },
  ],

  products: [
    {
      id: "thermos",
      name: "Thermos bottle · Stainless steel · 500 ml",
      short: "Thermos bottle",
      variant: "Silver",
      article: "6386857",
      image: "https://img.loopper.com/storage/webshop/articles/pfconcept/87/10067181.jpg",
      print: "Full-colour print · wrap-around 223×100 mm",
      printArea: { x: 30, y: 40, w: 40, h: 26 }, // % of the proof image
      delivery: "Fri 30 Oct",
      fast: true,
      stock: { now: 1240 },
      chips: ["Bigger print", "Great alternative"],
      amNote:
        "The wrap-around print lets your logo show from every side. Popular for events, and it keeps drinks warm for 12 hours.",
      tiers: [
        { qty: 250, price: 6.82 },
        { qty: 500, price: 6.54 },
        { qty: 1000, price: 6.34, flag: "Most chosen" },
        { qty: 2500, price: 6.18 },
      ],
      qty: 250,
      inOffer: true,
    },
    {
      id: "bottle",
      name: "Water bottle · Recycled steel · 750 ml · carabiner",
      short: "Recycled water bottle",
      variant: "Apple green",
      article: "6457285",
      image: "svg:bottle",
      tag: { label: "Sustainable · you asked for this", tone: "green" },
      print: "Full-colour print · wrap-around 230×160 mm",
      printArea: { x: 27, y: 42, w: 46, h: 30 },
      delivery: "Fri 30 Oct",
      fast: true,
      stock: { now: 92, incoming: 36, incomingDate: "20 Oct", limit: 128, lateDelivery: "6 Nov" },
      chips: ["Fast delivery", "High quality"],
      amNote:
        "You asked for a sustainable option. This one is made from recycled steel and is half the price of the Thermos.",
      tiers: [
        { qty: 250, price: 4.07 },
        { qty: 500, price: 3.84 },
        { qty: 1000, price: 3.68 },
        { qty: 2500, price: 3.54 },
      ],
      qty: 250,
      inOffer: true,
    },
    {
      id: "bag",
      name: "Shopping bag · Cotton 140 g/m² · Ecru",
      short: "Cotton shopping bag",
      variant: "Ecru",
      article: "1144681",
      image: "svg:bag",
      print: "Digital transfer · both sides 230×280 mm",
      printArea: { x: 24, y: 40, w: 52, h: 44 },
      delivery: "Fri 30 Oct",
      fast: true,
      stock: { now: 759943 },
      chips: ["Fast delivery"],
      amNote: "A cheap extra to hand out with the bottles. Print on both sides at no extra cost.",
      tiers: [
        { qty: 250, price: 2.92 },
        { qty: 500, price: 2.71 },
        { qty: 1000, price: 2.52 },
        { qty: 2500, price: 2.31 },
      ],
      qty: 250,
      inOffer: false,
    },
  ],

  // Prefilled "Your details" form (test values)
  details: {
    company: "Loopper Test Ltd",
    name: "Cayna Test",
    email: "test@example.com",
    phone: "+44 20 0000 0000",
    vat: "",
    street: "1 Test Street",
    postcode: "EC1A 1AA",
    city: "London",
    country: "United Kingdom",
    po: "",
  },

  paymentMethods: [
    { id: "bank", label: "Bank transfer", note: "We send the invoice by email" },
    { id: "card", label: "Credit card", note: "Visa, Mastercard, Amex" },
    { id: "paypal", label: "PayPal", note: "" },
    { id: "klarna", label: "Klarna", note: "Pay in 30 days" },
  ],

  clients: ["Atlassian", "Siemens", "Lidl", "EA", "United Nations", "Huawei", "Jaguar"],
  reviews: { platform: "Trustpilot", score: "4.7", count: "1,282" },
};
