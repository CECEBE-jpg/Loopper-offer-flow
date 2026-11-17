// User test: Jildou (account manager) answers what the test user writes.
// Simple keyword matching, no server: good enough to feel real in a moderated test.
// utAmReply(text) returns the answer; foul language gets a polite warning instead.
(function () {
  var CURSES = [
    "fuck", "fucking", "fucked", "f\\*ck", "f\\*\\*k", "shit", "bullshit", "bitch", "bastard", "asshole",
    "arsehole", "dick", "cunt", "piss", "pissed", "crap", "damn", "wtf", "motherfucker", "twat", "wanker",
    "kut", "klote", "godverdomme", "tering", "kanker", "tyfus", "lul", "eikel", "klootzak", "shitty",
  ];
  var CURSE_RE = new RegExp("(^|[^a-z])(" + CURSES.join("|") + ")([^a-z]|$)", "i");
  var WARNING =
    "Please, we encourage you to refrain from using foul language. I'm happy to help you with any question about your offer.";
  var RULES = [
    {
      re: /\b(hi|hello|hey|hoi|hallo|good (morning|afternoon)|goedemorgen)\b/i,
      a: "Hi Cayna! How can I help you with your offer?",
      only: true,
    },
    {
      re: /\b(thank|thanks|thx|cheers|bedankt|dank)\b/i,
      a: "You're welcome! Let me know if there's anything else I can do for you.",
      only: true,
    },
    {
      re: /\b(deliver|delivery|deliveries|arrive|arrival|when|deadline|date|ship|shipping|levering|wanneer)\b/i,
      a: "The tote bags can be delivered on 27 November. The noma noma thermos bottles are back in stock on 8 December, so they would arrive around 14 December. Do you have a fixed event date? Then I'll check what's possible.",
    },
    {
      re: /\b(price|prices|cost|costs|expensive|cheap|cheaper|discount|budget|euro|€|prijs|korting)\b/i,
      a: "The price per piece drops as you order more. For example the tote bag goes from € 1,88 at 250 pieces to € 1,64 at 500 pieces. Shall I calculate a different quantity for you?",
    },
    {
      re: /\b(logo|design|mockup|mock-up|bigger|smaller|larger|size|position|place|left|right|center|centre|move)\b/i,
      a: "Good point! I'll pass this on to our designer and you'll get an updated mockup within 1 hour.",
    },
    {
      re: /\b(navy|blue|red|black|white|green|beige|natural|turquoise|grey|gray|pink|yellow|other colou?rs?|kleur(en)?)\b/i,
      a: "The tote bag comes in natural, white, black and bright green, the beach bag in beige, black, navy, red and turquoise, and the noma noma thermos in black. Shall I switch a colour for you?",
    },
    {
      re: /\b(engrav\w*|print\w*|colours?|colors?|pms|full.?colou?r)\b/i,
      a: "The thermos is engraved, so your logo shows in the colour of the steel. The tote bag is screen printed in one colour. If you have a specific PMS colour, you can add it under PMS / Colour.",
    },
    {
      re: /\b(sample|samples|example|proef|voorbeeld)\b/i,
      a: "Of course! We can send you a sample before you order. Use \"Request sample offer\" under the products, or tell me which product you'd like to see.",
    },
    {
      re: /\b(quantity|quantities|pieces|pcs|amount|more|less|fewer|aantal|stuks)\b/i,
      a: "You can change the quantity per product with \"Change quantity\". Need a quantity that isn't listed? Tell me and I'll make you a custom price.",
    },
    {
      re: /\b(pay|payment|invoice|vat|btw|ideal|paypal|credit card|factuur)\b/i,
      a: "You can pay by iDEAL, credit card, PayPal or on invoice. That comes after you approve the designs in step 2 and fill in your details in step 3.",
    },
    {
      re: /\b(stock|available|availability|voorraad)\b/i,
      a: "The tote bags are in stock. The noma noma thermos bottles are expected back in stock on 8 December (1,409 pieces incoming).",
    },
    {
      re: /\b(beach bag|alternative|recommend\w*|suggest\w*)\b/i,
      a: "I suggested the beach bag because it matches your tote bags well. Once it's in your offer, I'll make a free mockup for it with your logo.",
    },
  ];
  window.utIsCurse = function (text) {
    return CURSE_RE.test(" " + text + " ");
  };
  window.utAmReply = function (text) {
    if (window.utIsCurse(text)) return WARNING;
    var t = String(text || "");
    var hits = RULES.filter(function (r) {
      return r.re.test(t);
    });
    // a greeting or thanks only answers on its own; with a real question the question wins
    var real = hits.filter(function (r) {
      return !r.only;
    });
    if (real.length) return real[0].a;
    if (hits.length) return hits[0].a;
    return "Thanks for your message! I'll look into it and get back to you shortly.";
  };
  // a short, slightly random typing delay
  window.utAmDelay = function () {
    return 1400 + Math.round(Math.random() * 1200);
  };
})();
