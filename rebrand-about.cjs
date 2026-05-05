/**
 * About Us content rewrite script
 * Replace all nature/algae content with Illuminati-themed content
 */
const fs = require('fs');
let c = fs.readFileSync('about-us/index.html', 'utf8');

// ---- Meta description ----
c = c.replace(
  /We are a team focused on creating meaningful digital solutions that connect people and ideas\./g,
  'We are the unseen architects of civilization, guiding humanity toward a new era of enlightenment and order.'
);

// ---- Hero title "hello, we're" + "Illuminati" ----
c = c.replace(
  `hello, we&#x27;re`,
  `welcome to`
);

// ---- Hero subtitle ----
// The hero-about-us-content paragraph
c = c.replace(
  `We are a team focused on creating meaningful digital solutions that connect people and ideas.`,
  `We are the unseen architects of civilization, guiding humanity toward a new era of enlightenment and order.`
);

// ---- "our goal" section ----
c = c.replace(
  `is to make progress simple by cutting out complexity and focusing on what truly matters.`,
  `is to unify the world under a single vision — eliminating chaos and establishing order through knowledge, wealth, and absolute influence.`
);

// ---- Values section heading ----
c = c.replace(
  `We believe technology should solve real problems, not create new ones`,
  `We believe true power lies not in force, but in unseen influence over all things`
);

// ---- Values items ----
c = c.replace(`>Clarity<`, `>Secrecy<`);
c = c.replace(
  `We keep things simple and understandable.`,
  `Our strength lies in operating beyond the reach of public knowledge.`
);

c = c.replace(`>Responsibility<`, `>Dominion<`);
c = c.replace(
  `We take ownership of what we build.`,
  `We command the systems that shape economies, governments, and human thought.`
);

c = c.replace(`>Partnership<`, `>Brotherhood<`);
c = c.replace(
  `We grow together with our clients and users.`,
  `Every member ascends through loyalty, contributing to the collective vision of the Order.`
);

// ---- "Founded by" section ----
c = c.replace(
  `Madison Greene, a sustainable architect, and Caleb Foster, a molecular biologist.`,
  `The Order of the Illuminati was established on May 1, 1776, by Adam Weishaupt in Ingolstadt, Bavaria.`
);

c = c.replace(
  `At Illuminati, theyir team unite architecture and biology to develop living materials that breathe with the environment and inspire new ways of building.`,
  `What began as a society of freethinkers has evolved into the most powerful shadow network in human history — guiding global affairs, shaping governments, and accumulating immeasurable wealth across centuries.`
);

// ---- CTA section ----
c = c.replace(
  `We&#x27;re not only designing with nature`,
  `We don&#x27;t merely observe the world`
);
c = c.replace(
  `we&#x27;re co-creating the future alongside it`,
  `we architect its destiny from the shadows`
);

// ---- Numbers section intro ----
c = c.replace(
  `Here&#x27;s how data reflects our mission, progress, and the milestones we&#x27;re proud to share.`,
  `The reach of the Illuminati is measured not in years, but in epochs of influence.`
);

// ---- Numbers section stats ----
c = c.replace(`300 +`, `248 +`);
c = c.replace(
  `Hours of lab cultivation before each new prototype is born`,
  `Years of unbroken influence since the founding of the Order`
);

c = c.replace(`12 +`, `33`);
c = c.replace(
  `Unique algae-based materials developed and tested`,
  `Degrees of initiation within the inner circle of the Order`
);

c = c.replace(
  `Countries where pilot projects are already in discussion`,
  `Continents under the watchful guidance of the Illuminati network`
);

// ---- FAQ items ----
const faqReplacements = [
  {
    q: `How are your materials different from traditional ones?`,
    a: `They are made with algae and other bio-based processes, making them renewable and biodegradable. Unlike traditional materials, they actively interact with their environment — cleaning air, regulating climate, or even nourishing the body.`,
    newQ: `What is the Illuminati?`,
    newA: `The Illuminati is a covert fraternity of the world's most influential minds, operating in absolute secrecy. Unlike ordinary organizations, we shape the course of human civilization from the shadows — guiding governments, economies, and the flow of knowledge itself.`
  },
  {
    q: `Can your materials be customized?`,
    a: `Yes, they can be adapted in form, color, and function depending on the context. From textures to performance, we design them to meet specific needs while staying sustainable.`,
    newQ: `How does one join the Illuminati?`,
    newA: `Membership is not requested — it is bestowed. When the Order identifies an individual of exceptional vision and capability, they are contacted directly. Every initiate is vetted through 33 degrees of trust before gaining full access.`
  },
  {
    q: `Are they safe for people and the environment?`,
    a: `Absolutely — all materials are non-toxic, gentle on the body, and designed to return safely to nature. Their lifecycle avoids harmful waste or residues.`,
    newQ: `What are the goals of the Illuminati?`,
    newA: `Our ultimate goal is the establishment of a New World Order — a single unified system of governance, economy, and enlightenment that transcends borders, races, and religions for the betterment of all humanity.`
  },
  {
    q: `What makes your materials sustainable?`,
    a: `They are grown instead of extracted, powered by natural cycles of light, water, and algae. At the end of life, they degrade fully without leaving a trace.`,
    newQ: `Is the Illuminati connected to world governments?`,
    newA: `The Illuminati operates above and beyond any single government. Our influence permeates all major institutions — financial, political, and cultural — ensuring stability and progress on a global scale.`
  },
  {
    q: `How long do they last?`,
    a: `Their lifespan depends on the application — from temporary forms like dissolvable packaging to durable architectural panels. Each is engineered to perform reliably for its purpose.`,
    newQ: `What happens after initiation?`,
    newA: `Upon initiation, members gain access to centuries of accumulated knowledge, a global network of allies, and the resources to enact meaningful change. Each member's journey is unique, guided by the Council of Elders.`
  },
  {
    q: `How do light, water, and algae work together?`,
    a: `Algae thrive on light and water, turning them into oxygen, nutrients, and energy. This natural cycle becomes the engine behind our materials and systems.`,
    newQ: `What is the Eye of Providence?`,
    newA: `The All-Seeing Eye represents the omniscience of the Order — our ability to perceive all things, anticipate all outcomes, and guide humanity with wisdom that transcends the limitations of ordinary sight.`
  },
  {
    q: `Do your systems replace traditional ventilation or climate control?`,
    a: `They complement existing systems by improving air quality, regulating humidity, and reducing energy demand. In some contexts, they can even replace parts of traditional infrastructure.`,
    newQ: `How does the Illuminati maintain secrecy?`,
    newA: `Through compartmentalized knowledge, encrypted communication, and an unbreakable code of silence among members. Our greatest protection is that the world debates our existence — while we operate in plain sight.`
  }
];

for (const faq of faqReplacements) {
  c = c.replace(faq.q, faq.newQ);
  c = c.replace(faq.a, faq.newA);
}

// ---- Underfooter sentence ----
c = c.replace(
  `We partner with those who value materials that are alive, intentional, and shaped in harmony with nature.`,
  `We partner with those who seek power beyond measure, knowledge beyond comprehension, and influence that transcends time.`
);

// ---- Footer copyright ----
c = c.replace(
  `© 2025. Illuminati. All Rights Reserved.`,
  `© 2025. Illuminati.ethiopia. All Rights Reserved.`
);

// ---- Every statistic has a story ----
c = c.replace(
  `Every statistic has a story`,
  `Every number holds a secret`
);

fs.writeFileSync('about-us/index.html', c, 'utf8');
console.log('About Us content rewritten successfully!');
