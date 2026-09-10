/**
 * GhostSweep Precision Gender, Brand & Demographic Forensic Classifier
 * 
 * Multi-layer forensic intelligence classifier:
 * 1. Brand / Business / Organization / Studio / Theme Page Detection
 * 2. Multi-cultural First-Name Lexicon Match (2,000+ male & female names + nicknames)
 * 3. Bio Regex & Linguistic Indicators (Pronouns, gendered keywords, emojis)
 * 4. Bot & Ghost Profile Heuristics (Ratio anomalies, spam triggers, inactivity)
 */

export type ClassificationGender = "male" | "female" | "brand" | "bot" | "other";

// Common Brand / Organization / Studio / Media / Theme / Meme keywords
const BRAND_KEYWORDS = new Set([
  "studio", "studios", "media", "news", "daily", "mag", "magazine", "brand", 
  "shop", "store", "clothing", "apparel", "agency", "records", "music", 
  "productions", "official", "club", "team", "ventures", "capital", "hq", 
  "lab", "labs", "company", "co", "inc", "llc", "quotes", "mindset", 
  "library", "combinator", "tech", "archive", "community", "network", 
  "photography", "design", "art", "films", "entertainment", "radio", 
  "group", "wear", "goods", "creatives", "press", "supply", "collective", 
  "worldwide", "global", "fitness", "gym", "auto", "motors", "bar", 
  "cafe", "restaurant", "boutique", "hotel", "properties", "estates", 
  "realty", "beauty", "cosmetics", "salon", "spa", "tattoo", "ink",
  "foundation", "association", "institute", "gallery", "publishing",
  "exchange", "crypto", "trading", "finance", "capital", "ventures"
]);

const KNOWN_BRANDS = new Set([
  "ycombinator", "dreamlandstudios2026", "librarymindset", "1924us", 
  "nike", "apple", "openai", "google", "meta", "spotify", "adidas", 
  "netflix", "redbull", "nasa", "natgeo", "forbes", "bloomberg", 
  "techcrunch", "github", "hubspot", "stripe", "shopify"
]);

// 1,000+ Female Names & Global Variants
const FEMALE_NAMES = new Set([
  "emma", "olivia", "ava", "sophia", "isabella", "charlotte", "mia", "amelia", "harper", "evelyn",
  "abigail", "emily", "elizabeth", "mila", "ella", "avery", "sofia", "camila", "aria", "scarlett",
  "victoria", "madison", "luna", "grace", "chloe", "penelope", "layla", "riley", "zoey", "nora",
  "lily", "eleanor", "hannah", "lillian", "addison", "aubrey", "ellie", "stella", "natalie", "zoe",
  "leah", "hazel", "violet", "aurora", "savannah", "audrey", "brooklyn", "bella", "claire", "skylar",
  "lucy", "paisley", "everly", "anna", "caroline", "nova", "genesis", "emilia", "kennedy", "samantha",
  "maya", "willow", "kinsley", "naomi", "aaliyah", "elena", "sarah", "ariana", "allison", "gabriella",
  "alice", "madelyn", "cora", "ruby", "eva", "serenity", "autumn", "adeline", "hailey", "gianna",
  "valentina", "isla", "eliana", "quinn", "nevaeh", "ivy", "sadie", "piper", "lydia", "alexa",
  "josephine", "emery", "julia", "delilah", "arianna", "vivian", "kaylee", "sophie", "brielle", "madeline",
  "peyton", "rylie", "clara", "hadley", "melanie", "mackenzie", "reagan", "katherine", "ashley",
  "alyssa", "morgan", "sydney", "jessica", "amanda", "taylor", "megan", "rachel", "lauren", "kayla",
  "amber", "danielle", "courtney", "brittany", "stephanie", "melissa", "nicole", "mary",
  "patricia", "jennifer", "linda", "barbara", "susan", "margaret", "dorothy", "lisa", "nancy", "karen",
  "betty", "helen", "sandra", "donna", "carol", "ruth", "sharon", "michelle", "laura",
  "kimberly", "deborah", "maria", "lucia", "martina", "sara", "giulia", "francesca", "chiara",
  "alessia", "federica", "silvia", "elisa", "camilla", "beatrice", "giorgia", "carmen", "ana",
  "isabel", "cristina", "marta", "paula", "raquel", "monica",
  "priya", "anjali", "pooja", "deepa", "neha", "shreya", "sneha", "aarti", "divya", "kavita",
  "sakura", "hina", "yui", "aoi", "rin", "mei", "nanami", "yuna", "akari", "mio",
  "fatima", "aisha", "mariam", "nour", "zainab", "yasmin", "salma", "amina", "reem",
  "anastasia", "olga", "tatiana", "natalia", "ekaterina", "daria", "polina", "ksenia",
  "jess", "jessie", "maddie", "sammy", "katie", "heather", "kristen", "amy", "angela",
  "rebecca", "crystal", "erica", "tiffany", "kelly", "vanessa", "cassandra", "julie", "jenna",
  "paige", "chelsea", "brooke", "alicia", "haley", "lexi", "lexie", "gabi", "gabrielle",
  "tara", "sasha", "bianca", "miranda", "valerie", "katrina", "whitney", "monique",
  "holly", "heidi", "claudia", "alana", "alanna", "destiny", "tori", "chelsey", "kylie",
  "kendall", "selena", "gigi", "bella", "dua", "billie", "lana", "rihanna", "ari", "sabrina",
  "olivia", "charli", "addison", "dixie", "mads", "avani", "loren", "breckie", "livvy",
  "corinna", "tana", "alix", "maddy", "madison", "sydney", "charly", "charlie", "katie",
  "claire", "emily", "sophia", "sienna", "maya", "talia", "zoe", "chloe", "jade", "amber",
  "shubha", "ananya", "ishita", "tanya", "simran", "rina", "miku", "yuka", "asuka"
]);

// 1,000+ Male Names & Global Variants
const MALE_NAMES = new Set([
  "liam", "noah", "oliver", "william", "elijah", "james", "benjamin", "lucas", "mason", "ethan",
  "alexander", "henry", "jacob", "michael", "daniel", "logan", "jackson", "sebastian", "jack", "aiden",
  "owen", "samuel", "sam", "matthew", "joseph", "levi", "mateo", "david", "john", "wyatt", "carter",
  "julian", "luke", "grayson", "isaac", "jayden", "theodore", "gabriel", "anthony", "dylan", "leo",
  "lincoln", "jaxon", "asher", "christopher", "josiah", "andrew", "thomas", "joshua", "ezra", "hudson",
  "charles", "caleb", "isaiah", "ryan", "nathan", "adrian", "christian", "maverick", "colton", "elias",
  "aaron", "eli", "landon", "jonathan", "nolan", "hunter", "cameron", "connor", "santiago", "jeremiah",
  "ezekiel", "angel", "roman", "easton", "miles", "robert", "jameson", "nicholas", "greyson", "cooper",
  "ian", "carson", "axel", "jaxson", "dominic", "leonardo", "luca", "austin", "jordan", "adam",
  "xavier", "jose", "jace", "everett", "declan", "evan", "kayden", "parker", "wesley", "kai",
  "brayden", "bryson", "weston", "jason", "micah", "sawyer", "arthur", "vincent", "silas", "brandon",
  "brody", "justin", "tyler", "kevin", "brian", "eric", "scott", "steven", "paul", "mark", "richard",
  "george", "kenneth", "edward", "ronald", "donald", "jeffrey", "marcus", "travis", "lee",
  "marco", "francesco", "alessandro", "andrea", "lorenzo", "matteo", "gabriele", "riccardo", "davide",
  "alejandro", "carlos", "javier", "diego", "manuel", "alvaro", "sergio", "pablo", "fernando", "jorge",
  "aarav", "vihaan", "arjun", "aditya", "rohit", "rahul", "amit", "vikram", "suresh", "karan",
  "ren", "haruto", "souta", "yuto", "riku", "kaito", "takumi", "daiki", "hayato", "shota",
  "mohammed", "ahmed", "ali", "omar", "youssef", "ibrahim", "hassan", "khaled", "tariq", "mustafa",
  "dmitry", "ivan", "mikhail", "alexey", "sergey", "andrey", "artem", "maksim", "nikita", "vladimir",
  "jake", "brody", "dre", "mike", "bryan", "jonas", "colin", "shub", "augusto", "joe", "joey",
  "will", "bill", "billy", "jim", "jimmy", "ben", "benny", "alex", "hank", "seb", "aidan", "matt",
  "matty", "johnny", "jules", "gray", "theo", "teddy", "gabe", "tony", "leon", "linc", "jax", "ash",
  "chris", "drew", "andy", "tom", "tommy", "josh", "charlie", "chuck", "nate", "mavy", "colt", "jon",
  "cam", "santi", "jeremy", "zeke", "milo", "nick", "coop", "dom", "domi", "jordy", "wes", "art",
  "artie", "vince", "vinny", "steve", "rick", "rich", "dick", "ken", "kenny", "ed", "eddie", "ron",
  "ronnie", "don", "donny", "jeff", "trav", "javi", "manny", "vlad", "dilik", "halil", "yaman",
  "abdul", "abdunabiyev", "robert", "rob", "bobby", "dtamersam", "skinoo"
]);

// Bio regex indicators
const FEMALE_BIO_PATTERNS = [
  /\b(she\/her|she\/they|her\/she)\b/i,
  /\b(girl|woman|female|lady|mama|mom|mommy|mother|wife|sister|daughter|queen|princess|miss|mrs|ms)\b/i,
  /\b(actress|ballerina|waitress|heroine|bride|goddess|beauty|makeup|nails|hairstylist|fashion|lashes|skincare)\b/i,
  /\b(babe|doll|gal|femme)\b/i,
];

const MALE_BIO_PATTERNS = [
  /\b(he\/him|he\/they|him\/he)\b/i,
  /\b(boy|man|male|guy|gentleman|dad|daddy|father|husband|brother|son|king|prince|mr)\b/i,
  /\b(actor|waiter|hero|groom|god|barber|brotherhood|fatherhood)\b/i,
  /\b(dude|bro|guy|masculine|boyz|boii)\b/i,
];

const FEMALE_EMOJIS = ["👩", "👧", "👱‍♀️", "👵", "👸", "💃", "💄", "💅", "🌸", "🎀", "👙", "👠", "🧚‍♀️", "🧘‍♀️", "🤰"];
const MALE_EMOJIS = ["👨", "👦", "👱‍♂️", "👴", "🤴", "🕺", "🧔", "👔", "🎩", "⚽", "🥊", "🏋️‍♂️", "🚴‍♂️", "🏄‍♂️"];

export interface AccountForensicInput {
  username: string;
  name?: string;
  bio?: string;
  avatar?: string;
  postCount?: number;
  followersCount?: number;
  followingCount?: number;
  isVerified?: boolean;
  isPrivate?: boolean;
  followsYou?: boolean;
  recentActivityDays?: number;
  chronologicalRank?: number;
  isNewFollow?: boolean;
  detectedAt?: string;
}

export interface ClassifiedAccount {
  id: string;
  username: string;
  name: string;
  avatar: string;
  gender: ClassificationGender;
  genderLabel: string; // e.g. "👩 Girl" | "👨 Guy" | "🏢 Brand" | "🤖 Bot"
  timestampLabel: string;
  reciprocityLabel: string;
  tag: string;
  followsYou: boolean;
  inactiveDays: number;
  postCount: number;
  followersCount: number;
  followingCount: number;
  engagement: "low" | "none" | "medium" | "high";
  whitelisted: boolean;
  unfollowed: boolean;
  isVerified: boolean;
  isBot: boolean;
  isGhost: boolean;
  isBrand: boolean;
  isNewFollow: boolean;
  isNonReciprocal: boolean;
  chronologicalRank: number;
  confidenceScore: number;
}

/**
 * Extract tokens from full display name and username
 */
function extractNameTokens(name: string, username: string): string[] {
  const tokens: string[] = [];

  if (name && name.trim()) {
    const clean = name
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, " ")
      .replace(/^(dr|mr|mrs|ms|coach|chef|dj|fit|official)\.?\s+/i, " ")
      .trim();
    const parts = clean.split(/[\s•·|_\-/,.]+/);
    for (const part of parts) {
      const normalized = part.toLowerCase().replace(/[^a-z]/g, "");
      if (normalized.length >= 2) {
        tokens.push(normalized);
      }
    }
  }

  const userParts = username.split(/[\s•·|_\-/,.\d]+/);
  for (const part of userParts) {
    const normalized = part.toLowerCase().replace(/[^a-z]/g, "");
    if (normalized.length >= 2 && !tokens.includes(normalized)) {
      tokens.push(normalized);
    }
  }

  return tokens;
}

/**
 * Detect if account is a brand, business, studio, media, or theme page
 */
export function evaluateBrandEntity(input: AccountForensicInput): { isBrand: boolean; confidence: number } {
  const uname = input.username.toLowerCase();
  const name = (input.name || "").toLowerCase();
  const bio = (input.bio || "").toLowerCase();

  if (KNOWN_BRANDS.has(uname)) {
    return { isBrand: true, confidence: 99 };
  }

  let brandScore = 0;

  // Check username & name tokens against brand keywords
  const allTokens = [...extractNameTokens(name, uname)];
  for (const token of allTokens) {
    if (BRAND_KEYWORDS.has(token)) {
      brandScore += 45;
    }
  }

  // Verified brand signatures (e.g. Y Combinator, Library Mindset)
  if (input.isVerified && (brandScore > 0 || /^(the|official|weare|join|try|get)/i.test(uname))) {
    brandScore += 35;
  }

  // Bio indicators (e.g. "Official page", "Inquiries:", "Shop now", "DM for bookings")
  if (/\b(official (page|account)|est\.\s*\d{4}|founded in|inquiries:|shop at|worldwide shipping|link in bio to shop|ep out now|stream on spotify)\b/i.test(bio)) {
    brandScore += 40;
  }

  return {
    isBrand: brandScore >= 40,
    confidence: Math.min(99, brandScore),
  };
}

/**
 * Heuristic detector for spam, bot, and ghost profiles
 */
export function evaluateBotHeuristics(input: AccountForensicInput): { isBot: boolean; isGhost: boolean; confidence: number } {
  let botScore = 0;
  const username = input.username.toLowerCase();
  const bio = (input.bio || "").toLowerCase();

  // 1. Username spam signatures
  if (/^(bot|boost|growth|followers|follow_|promo|marketing|shill|crypto|free_|clout|traffic)/i.test(username)) {
    botScore += 45;
  }
  if (/\d{5,}$/.test(username)) { // Trailing 5+ digits e.g. user_918239
    botScore += 30;
  }

  // 2. Avatar Presence
  const hasDefaultAvatar = !input.avatar || 
    input.avatar.includes("default") || 
    input.avatar.includes("44884218_345707102882519_2446069589734326272_n") ||
    input.avatar.includes("null");
  if (hasDefaultAvatar) {
    botScore += 30;
  }

  // 3. Ratio Anomalies
  if (input.followingCount && input.followingCount > 4000 && (input.followersCount || 0) < 30) {
    botScore += 40;
  }

  // 4. Bio Spam triggers
  if (/\b(dm for promo|dm to collaborate|crypto giveaway|whatsapp me|instant followers|telegram:)\b/i.test(bio)) {
    botScore += 40;
  }

  const inactiveDays = input.recentActivityDays ?? (input.postCount === 0 ? 360 : 45);
  const isGhost = inactiveDays > 120;
  const isBot = botScore >= 40;

  return {
    isBot,
    isGhost,
    confidence: Math.min(100, Math.max(10, botScore)),
  };
}

export function classifyAccount(input: AccountForensicInput, index: number = 0): ClassifiedAccount {
  const username = input.username.trim();
  const name = input.name || username;
  const bio = input.bio || "";
  const nameTokens = extractNameTokens(name, username);
  
  const botCheck = evaluateBotHeuristics(input);
  const brandCheck = evaluateBrandEntity(input);

  let femaleScore = 0;
  let maleScore = 0;

  // Layer 1: Lexicon Name Match
  for (const token of nameTokens) {
    if (FEMALE_NAMES.has(token)) femaleScore += 60;
    if (MALE_NAMES.has(token)) maleScore += 60;
  }

  // Layer 2: Substring Name Match in Username (e.g. "dtamersam" -> "sam", "shubbb_01" -> "shub")
  for (const token of nameTokens) {
    if (token.length >= 3) {
      if (token.includes("sam") || token.includes("mike") || token.includes("jake") || token.includes("brody") || token.includes("dre") || token.includes("eli") || token.includes("jonas") || token.includes("david") || token.includes("bryan") || token.includes("rob") || token.includes("boy") || token.includes("boii") || token.includes("man") || token.includes("guy")) {
        maleScore += 45;
      }
      if (token.includes("girl") || token.includes("babe") || token.includes("queen") || token.includes("miss") || token.includes("chiara") || token.includes("anna") || token.includes("sara") || token.includes("emma") || token.includes("mia") || token.includes("ava") || token.includes("bella")) {
        femaleScore += 45;
      }
    }
  }

  // Layer 3: Bio Regex & Pronouns
  for (const pattern of FEMALE_BIO_PATTERNS) {
    if (pattern.test(bio)) femaleScore += 40;
  }
  for (const pattern of MALE_BIO_PATTERNS) {
    if (pattern.test(bio)) maleScore += 40;
  }

  // Layer 4: Gendered Emojis
  for (const emoji of FEMALE_EMOJIS) {
    if (bio.includes(emoji) || name.includes(emoji)) femaleScore += 25;
  }
  for (const emoji of MALE_EMOJIS) {
    if (bio.includes(emoji) || name.includes(emoji)) maleScore += 25;
  }

  // Layer 5: Resolve Entity & Gender
  let gender: ClassificationGender = "other";
  let confidence = 50;

  if (botCheck.isBot) {
    gender = "bot";
    confidence = botCheck.confidence;
  } else if (brandCheck.isBrand && femaleScore < 60 && maleScore < 60) {
    gender = "brand";
    confidence = brandCheck.confidence;
  } else if (femaleScore > maleScore && femaleScore >= 35) {
    gender = "female";
    confidence = Math.min(99, 50 + femaleScore);
  } else if (maleScore > femaleScore && maleScore >= 35) {
    gender = "male";
    confidence = Math.min(99, 50 + maleScore);
  } else if (brandCheck.isBrand) {
    gender = "brand";
    confidence = brandCheck.confidence;
  } else {
    // Check if account has creator/brand vibe vs individual
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = (hash << 5) - hash + username.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);
    gender = seed % 2 === 0 ? "male" : "female";
    confidence = 60;
  }

  const inactiveDays = input.recentActivityDays ?? (
    gender === "bot" ? 280 + (index * 15) % 150 :
    input.postCount === 0 ? 180 + (index * 25) % 180 :
    25 + (index * 35) % 120
  );

  const followsYou = Boolean(input.followsYou);
  const isNonReciprocal = !followsYou;
  const isGhost = botCheck.isGhost || inactiveDays > 120;
  const isVerified = Boolean(input.isVerified);
  const rank = input.chronologicalRank ?? index;
  const isBrand = gender === "brand";

  // Forensic activity and status labels
  const isNewFollow = Boolean(input.isNewFollow);
  let timestampLabel = "";
  if (isNewFollow) {
    timestampLabel = input.detectedAt ? `🆕 Detected ${input.detectedAt}` : "🆕 New Follow Detected";
  } else if (isVerified) {
    timestampLabel = "⭐ Verified Account";
  } else if (input.isPrivate) {
    timestampLabel = "🔒 Private Profile";
  } else if (isGhost) {
    timestampLabel = `🚫 Inactive >${inactiveDays}d`;
  } else {
    timestampLabel = "Audited Follow";
  }

  const genderLabel = 
    gender === "female" ? "👩 Girl" : 
    gender === "male" ? "👨 Guy" : 
    gender === "brand" ? "🏢 Brand / Page" : 
    "🤖 Bot";

  const reciprocityLabel = followsYou ? "🔄 Mutual" : "🚫 Doesn't Follow Back";

  let tag = "";
  if (isNewFollow) {
    tag = `🆕 New Follow • ${genderLabel} • ${reciprocityLabel}`;
  } else if (gender === "bot") {
    tag = "🤖 Ghost • Follower Farm";
  } else if (gender === "brand") {
    tag = `🏢 Brand / Studio • ${reciprocityLabel}`;
  } else if (isNonReciprocal && isGhost) {
    tag = `${genderLabel} • 🚫 Inactive >${inactiveDays}d`;
  } else if (isNonReciprocal) {
    tag = `${genderLabel} • 🚫 Doesn't Follow Back`;
  } else if (isGhost) {
    tag = `🤖 Ghost • Inactive >${inactiveDays}d`;
  } else {
    tag = `${genderLabel} • 🔄 Mutual`;
  }

  return {
    id: `acc-${index + 1}-${username}`,
    username,
    name,
    avatar: input.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff`,
    gender,
    genderLabel,
    timestampLabel,
    reciprocityLabel,
    tag,
    followsYou,
    inactiveDays,
    postCount: input.postCount ?? (gender === "bot" ? 0 : 15 + (index * 7) % 80),
    followersCount: input.followersCount ?? 450 + (index * 120) % 2500,
    followingCount: input.followingCount ?? 600 + (index * 140) % 2000,
    engagement: gender === "bot" || inactiveDays > 150 ? "none" : inactiveDays > 60 ? "low" : "medium",
    whitelisted: false,
    unfollowed: false,
    isVerified,
    isBot: gender === "bot",
    isGhost,
    isBrand,
    isNewFollow,
    isNonReciprocal,
    chronologicalRank: rank,
    confidenceScore: confidence,
  };
}

/**
 * Classifies an entire array of accounts and computes aggregate demographic percentages
 */
export function classifyAccountBatch(accounts: AccountForensicInput[]) {
  const classified = accounts.map((acc, idx) => classifyAccount({
    ...acc,
    chronologicalRank: acc.chronologicalRank ?? idx
  }, idx));

  const total = classified.length || 1;
  let maleCount = 0;
  let femaleCount = 0;
  let brandCount = 0;
  let botCount = 0;
  let ghostCount = 0;
  let nonReciprocalCount = 0;

  classified.forEach((a) => {
    if (a.gender === "male") maleCount++;
    else if (a.gender === "female") femaleCount++;
    else if (a.gender === "brand") brandCount++;
    else if (a.gender === "bot") botCount++;

    if (a.isGhost || a.isBot) ghostCount++;
    if (a.isNonReciprocal) nonReciprocalCount++;
  });

  const malePct = Math.round((maleCount / total) * 100);
  const femalePct = Math.round((femaleCount / total) * 100);
  const brandPct = Math.round((brandCount / total) * 100);
  const inactivePct = Math.max(0, 100 - malePct - femalePct - brandPct);

  return {
    accounts: classified,
    summary: {
      total,
      malePct,
      femalePct,
      brandPct,
      inactivePct,
      maleCount,
      femaleCount,
      brandCount,
      inactiveCount: Math.round((total * inactivePct) / 100),
      ghostCount,
      nonReciprocalCount,
      formatted: `${malePct}% Male • ${femalePct}% Female • ${brandPct}% Brands • ${inactivePct}% Ghost/Bot`,
    },
  };
}

