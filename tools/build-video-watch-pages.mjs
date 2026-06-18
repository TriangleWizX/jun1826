import fs from "node:fs/promises";
import path from "node:path";
import { buildVideoSlug, normalizeVideoId } from "./lib/video-slug.mjs";

const root = process.cwd();
const dataPath = path.join(root, "assets", "data", "videos.playlist.json");
const overridesPath = path.join(root, "assets", "video-overrides.json");
const legacyRedirectsPath = path.join(root, "config", "legacy-redirects.json");
const relatedGuidesPath = path.join(root, "data", "video-related-guides.json");
const videosDir = path.join(root, "videos");
const partialsDir = path.join(root, "partials");

console.log(`[videos:pages] Input playlist: ${dataPath}`);
console.log(`[videos:pages] Input overrides: ${overridesPath}`);

const SITE_ORIGIN = "https://senseisandy.com";
const SITE_TITLE = "Sensei Sandy BJJ";
const SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/assets/images/social/ssbjj-card-1200x628.jpg`;
const SOCIAL_IMAGE_ALT = "Sensei Sandy BJJ in Tannersville, NY";
const MASTER_VIDEO_HUB_PATH = "/bjj-videos";
const ANALYTICS_HEAD_INCLUDE = '  <!--#include virtual="/_includes/analytics-head.html" -->';
const TITLE_MIN = 30;
const TITLE_MAX = 60;
const META_DESCRIPTION_MAX = 160;

const PROGRAM_HUBS = [
  {
    slug: "kids",
    label: "Kids",
    shortLabel: "Kids",
    path: "/videos/kids",
    pageTitle: "Kids BJJ Videos | Sensei Sandy BJJ",
    heading: "Kids BJJ Video Hub",
    description:
      "Watch kids BJJ videos from Sensei Sandy BJJ in Tannersville, with beginner drills, games, confidence work, focus cues, and safe movement for kids."
  },
  {
    slug: "teens",
    label: "Teens",
    shortLabel: "Teens",
    path: "/videos/teens",
    pageTitle: "Teens BJJ Videos | Sensei Sandy BJJ",
    heading: "Teens BJJ Video Hub",
    description:
      "Watch teens BJJ videos from Sensei Sandy BJJ in Tannersville, with composure, control, self-defense basics, safe pacing, and real class previews.",
    credibilityCue:
      "BJJ competition formats disallow punches, strikes, and kicks, which supports a calmer learning environment focused on control and decision-making."
  },
  {
    slug: "adults",
    label: "Adults",
    shortLabel: "Adults",
    path: "/videos/adults",
    pageTitle: "Adults BJJ Videos | Sensei Sandy BJJ",
    heading: "Adults BJJ Video Hub",
    description:
      "Watch adults BJJ videos from Sensei Sandy BJJ in Tannersville, with fundamentals, control-first details, safe progressions, and class previews."
  }
];

const TECHNIQUE_HUBS = [
  {
    slug: "breakfalls",
    label: "Breakfalls",
    shortLabel: "Breakfalls",
    path: "/videos/breakfalls",
    pageTitle: "BJJ Breakfall Videos | Sensei Sandy BJJ",
    heading: "Breakfalls Video Hub",
    description:
      "Watch BJJ breakfall videos to learn safe landings, body awareness, and movement confidence through beginner-friendly drills and clear coaching."
  },
  {
    slug: "takedowns",
    label: "Takedowns",
    shortLabel: "Takedowns",
    path: "/videos/takedowns",
    pageTitle: "BJJ Takedown Videos | Sensei Sandy BJJ",
    heading: "Takedowns Video Hub",
    description:
      "Watch BJJ takedown videos with control-first entries, balance, timing, and safe finishes taught in clear progressions for beginners and hobbyists."
  },
  {
    slug: "guard-passing",
    label: "Guard Passing",
    shortLabel: "Guard Passing",
    path: "/videos/guard-passing",
    pageTitle: "BJJ Guard Passing Videos | Sensei Sandy BJJ",
    heading: "Guard Passing Video Hub",
    description:
      "Watch BJJ guard passing videos covering pressure, posture, angles, and clean step-by-step progressions for beginners and developing grapplers."
  },
  {
    slug: "escapes",
    label: "Escapes",
    shortLabel: "Escapes",
    path: "/videos/escapes",
    pageTitle: "BJJ Escape Videos | Sensei Sandy BJJ",
    heading: "Escapes Video Hub",
    description:
      "Watch BJJ escape videos that teach clear steps to get safe, get out, and reset position with calm coaching and beginner-friendly progressions."
  },
  {
    slug: "submissions",
    label: "Submissions",
    shortLabel: "Submissions",
    path: "/videos/submissions",
    pageTitle: "BJJ Submission Videos | Sensei Sandy BJJ",
    heading: "Submissions Video Hub",
    description:
      "Browse BJJ submission videos with control-first setups, clean mechanics, and safe finishes from Sensei Sandy BJJ in Tannersville, NY for beginners."
  },
  {
    slug: "positioning",
    label: "Positioning",
    shortLabel: "Positioning",
    path: "/videos/positioning",
    pageTitle: "BJJ Positioning Videos | Sensei Sandy BJJ",
    heading: "Positioning Video Hub",
    description:
      "Watch BJJ positioning videos focused on base, posture, pressure, and control so you can hold better positions and move with intent."
  },
  {
    slug: "self-defense",
    label: "Self-Defense",
    shortLabel: "Self-Defense",
    path: "/videos/self-defense",
    pageTitle: "BJJ Self-Defense Videos | Sensei Sandy BJJ",
    heading: "Self-Defense Video Hub",
    description:
      "Watch BJJ self-defense videos focused on posture, control, escapes, and practical principles taught with calm, beginner-friendly instruction you can use."
  }
];

const PROGRAM_SET = new Set(PROGRAM_HUBS.map((hub) => hub.slug));
const TECHNIQUE_SET = new Set(TECHNIQUE_HUBS.map((hub) => hub.slug));

const PROGRAM_MAP = new Map(PROGRAM_HUBS.map((hub) => [hub.slug, hub]));
const TECHNIQUE_MAP = new Map(TECHNIQUE_HUBS.map((hub) => [hub.slug, hub]));

const HUB_GUIDE_PROFILES = {
  kids: {
    title: "How to Use the Kids BJJ Video Hub",
    searchPhrase: "kids BJJ videos",
    learner: "children who need structure, safe contact, confidence, and clear rules",
    localAudience: "families from Tannersville, Haines Falls, Hunter, Windham, Palenville, and the nearby Catskills",
    trainingGoal: "turn movement, listening, balance, and self-control into repeatable habits",
    primaryConcern: "parents usually want to know whether the room is calm, whether the coach explains contact safely, and whether a new child can participate without being thrown into chaos",
    classPath: "/kids",
    classLabel: "Kids Jiu-Jitsu",
    relatedGuide: "/blog/kids-martial-arts-haines-falls",
    relatedGuideLabel: "kids martial arts near Haines Falls",
    watchSignals: [
      "Listen for simple safety language. Kids learn faster when the rule is short, repeated, and attached to a visible action.",
      "Watch how the coach separates effort from recklessness. Good kids grappling rewards patience, position, and partner care.",
      "Notice the resets after every round. A reset teaches a child that training is not a fight that runs forever.",
      "Look for balance games, breakfalls, and stand-up safety before complicated submissions.",
      "Watch partner matching. Size, maturity, and experience matter more than age alone.",
      "Notice how wins are framed. The best kids classes celebrate clean movement and brave effort, not only taps.",
      "Look for parent-readable structure: warmup, skill, controlled drill, game, and closing routine.",
      "Watch whether nervous students get smaller steps instead of pressure to perform."
    ],
    planningSteps: [
      "Start with one or two short clips, then choose the first visit date from the schedule.",
      "Tell your child they are going to learn safety skills, not prove toughness.",
      "Bring water, athletic clothing without zippers, and enough time to arrive calm.",
      "If your child is shy, let the coach know before class so the first pairing can be easy.",
      "After class, ask what rule they remember instead of asking whether they won.",
      "Repeat the visit before deciding. Many kids need one class to observe and one class to participate fully."
    ],
    topicNotes: [
      "Breakfalls help kids protect their head, shoulders, and hands when balance changes.",
      "Escapes teach kids to breathe, frame, and create space without panic.",
      "Self-defense clips show how grip breaks and posture can be taught without scaring children.",
      "Positioning clips help parents see why control is safer than speed.",
      "Takedown clips should be watched for landing safety and partner care.",
      "Submission clips should be framed as control lessons with clear tapping, not as rough finishes."
    ]
  },
  teens: {
    title: "How to Use the Teens BJJ Video Hub",
    searchPhrase: "teens BJJ videos",
    learner: "middle-school and high-school students who need challenge, composure, and a controlled outlet",
    localAudience: "teens from Tannersville, Windham, Hunter, Haines Falls, and surrounding mountain towns",
    trainingGoal: "build calm under pressure, better body awareness, and social confidence through structured grappling",
    primaryConcern: "families often want a room that is serious enough to hold a teen attention span while still being safe for beginners",
    classPath: "/teen-jiu-jitsu-tannersville-ny",
    classLabel: "Teens Jiu-Jitsu",
    relatedGuide: "/blog/teen-jiu-jitsu-hunter-ny",
    relatedGuideLabel: "teen jiu-jitsu near Hunter",
    watchSignals: [
      "Watch the pace. Teens need enough intensity to care, but not so much that form disappears.",
      "Notice how the coach corrects posture, hands, and head position before adding speed.",
      "Look for controlled resistance. A good teen class lets students test skill without turning every rep into a wrestling match.",
      "Listen for language about tapping, partner safety, and resets.",
      "Watch how students handle small mistakes. The best training turns errors into information.",
      "Look for transitions between standing, guard, escapes, and submissions so teens see a complete map.",
      "Notice whether strong students are asked to show control instead of dominance alone.",
      "Watch for clear endings. Teens do better when a round, drill, or game has a defined stop point."
    ],
    planningSteps: [
      "Have your teen watch one clip and name the skill they would be willing to try.",
      "Pick a first class that fits the week instead of waiting for a perfect week.",
      "Tell the coach about prior wrestling, striking, injuries, or anxiety before class.",
      "Use athletic clothing without pockets or zippers if it is a no-gi day.",
      "After class, ask what felt confusing and what felt useful.",
      "Give the program a few visits. Teen confidence usually comes from recognizing patterns over time."
    ],
    topicNotes: [
      "Escapes help teens manage pressure without freezing.",
      "Takedowns teach balance, timing, and responsibility for the landing.",
      "Submissions teach patience. A rushed finish usually loses control.",
      "Positioning teaches teens that the person with better structure can slow the exchange down.",
      "Self-defense clips connect mat skills to boundary setting and safe disengagement.",
      "Guard-passing clips help wrestlers and new grapplers understand how ground position changes."
    ]
  },
  adults: {
    title: "How to Use the Adults BJJ Video Hub",
    searchPhrase: "adult BJJ videos",
    learner: "adult beginners, returning athletes, parents, professionals, and hobbyists who want practical grappling without a chaotic room",
    localAudience: "adults from Tannersville, Windham, Hunter, Catskill, Cairo, Palenville, and nearby Catskills communities",
    trainingGoal: "learn technical control, pressure management, safe sparring habits, and repeatable fundamentals",
    primaryConcern: "most adults want to know whether they can start out of shape, train without getting injured, and understand the room before they book",
    classPath: "/adult-bjj",
    classLabel: "Adults Jiu-Jitsu",
    relatedGuide: "/blog/bjj-beginners-over-40-catskills",
    relatedGuideLabel: "BJJ beginners over 40 in the Catskills",
    watchSignals: [
      "Watch the coach pace the sequence. Adult beginners need details in the right order, not a flood of options.",
      "Notice how pressure is introduced. Good training lets you feel contact without turning every drill into a survival test.",
      "Look at posture, base, frames, and grips before you look at the final technique.",
      "Listen for safety cues about tapping early, landing well, and protecting the neck.",
      "Watch how partners reset after a rep. Reset quality often predicts injury risk better than intensity.",
      "Notice whether the class uses both explanation and live demonstration.",
      "Look for calm decision making. Adult BJJ improves fastest when students can ask what went wrong.",
      "Watch for the mistake and the correction that follows."
    ],
    planningSteps: [
      "Use the videos to understand class tone, then book a first intro instead of trying to master the material online.",
      "Choose clothing that lets you move and does not have zippers, hard buttons, or loose pockets.",
      "Tell the coach about old injuries, neck concerns, or training history before class.",
      "Expect to learn positions and safety rules first. Sparring can wait until the basics make sense.",
      "After class, write down one position, one movement, and one question.",
      "Come back soon. Adult progress depends more on repeat exposure than on perfect athleticism."
    ],
    topicNotes: [
      "Breakfalls reduce fear of the floor and make standing work more approachable.",
      "Escapes teach adults to breathe and build frames before trying to explode out.",
      "Guard passing gives beginners a clear task when they are on top.",
      "Submissions teach control, patience, and clean stopping points.",
      "Positioning teaches adults how to slow a round down with structure.",
      "Self-defense clips show how posture and distance matter before any finish."
    ]
  },
  breakfalls: {
    title: "How to Use the BJJ Breakfalls Video Hub",
    searchPhrase: "BJJ breakfall videos",
    learner: "beginners who want to land safely, reduce fear, and understand how falling is taught before takedowns",
    localAudience: "new students and parents near Tannersville, Hunter, Windham, Haines Falls, and the wider Catskills",
    trainingGoal: "make safe landings, technical stand-ups, and body awareness feel normal before harder training begins",
    primaryConcern: "new students often worry about being thrown, hitting the floor, or looking awkward during the first class",
    classPath: "/schedule",
    classLabel: "Class Schedule",
    relatedGuide: "/blog/how-to-fall-safely-bjj-breakfalls",
    relatedGuideLabel: "how to fall safely in BJJ",
    watchSignals: [
      "Watch where the chin goes. Protecting the head is the first priority in any breakfall.",
      "Notice whether the landing spreads impact instead of catching the floor with a stiff hand.",
      "Look for a calm path back to standing. A safe fall is not complete until the student can recover position.",
      "Watch the difference between falling from a drill and falling from a live exchange.",
      "Listen for reminders about breathing. Students who hold their breath usually tense at the wrong moment.",
      "Notice how the coach scales the height of the fall for beginners.",
      "Look for partner care during takedown entries.",
      "Watch whether the class repeats simple landings often enough for the body to remember."
    ],
    planningSteps: [
      "Watch the breakfall guide before any takedown-heavy class if you are nervous about standing work.",
      "Practice only on a safe surface and avoid high-impact repetitions outside class.",
      "Ask the coach for a low-level version if you have a shoulder, wrist, neck, or back concern.",
      "Pair breakfall study with technical stand-ups so landing and recovery are connected.",
      "For kids, talk about protecting the head and getting back to base, not about being tough.",
      "For adults, treat breakfalls as mobility and confidence training, not as a stunt."
    ],
    topicNotes: [
      "Side breakfalls help students land without posting a straight arm.",
      "Back breakfalls teach chin tuck, rounded shoulders, and calm breathing.",
      "Technical stand-ups create distance after a fall or guard exchange.",
      "Safe get-ups connect self-defense, takedown defense, and class movement.",
      "Partner takedown drills should begin with landing responsibility.",
      "Breakfall games help kids repeat safety skills without fear."
    ]
  },
  takedowns: {
    title: "How to Use the BJJ Takedowns Video Hub",
    searchPhrase: "BJJ takedown videos",
    learner: "students who want standing entries, balance, mat returns, and safe finishes without reckless throws",
    localAudience: "kids, teens, adults, wrestlers, and first-time grapplers near Tannersville and the Catskills",
    trainingGoal: "connect posture, grip fighting, level change, landing safety, and top control",
    primaryConcern: "students want to learn takedowns but also want to know that partners will land safely and reset under control",
    classPath: "/schedule",
    classLabel: "Class Schedule",
    relatedGuide: "/blog/takedown-defense",
    relatedGuideLabel: "takedown defense guide",
    watchSignals: [
      "Watch head position before the finish. A good entry keeps the neck safe and the spine organized.",
      "Notice the feet. Takedowns usually fail when the feet stop moving before the hands do their job.",
      "Look for landing control, not only the moment someone hits the mat.",
      "Watch how the coach connects the takedown to a pass, pin, or safe reset.",
      "Listen for cues about posture and inside position.",
      "Notice whether the entry is taught from realistic distance.",
      "Look for options that work for smaller students through angle and timing.",
      "Watch how students recover when the first shot is blocked."
    ],
    planningSteps: [
      "Study the entry, the finish, and the landing as three separate parts.",
      "Review breakfalls before trying takedown work at speed.",
      "Tell the coach about wrestling background so intensity can be matched safely.",
      "Begin with cooperative reps before adding resistance.",
      "After class, remember whether you lost posture, angle, grip, or follow-through.",
      "Use the schedule to pick a class where standing work fits your comfort level."
    ],
    topicNotes: [
      "Single-leg entries teach balance and patience.",
      "Knee picks reward timing more than force.",
      "Body locks teach hip position and safe mat returns.",
      "Snap-downs connect hand fighting to front headlock control.",
      "Trips teach students to move the base instead of muscling the upper body.",
      "Takedown defense helps students sprawl, frame, and recover without panic."
    ]
  },
  "guard-passing": {
    title: "How to Use the BJJ Guard Passing Video Hub",
    searchPhrase: "BJJ guard passing videos",
    learner: "students who want to understand posture, pressure, angles, and the path from top guard to stable control",
    localAudience: "beginners and developing grapplers near Tannersville, Windham, Hunter, and surrounding Catskills towns",
    trainingGoal: "build a reliable top game by solving frames, legs, hips, and distance in order",
    primaryConcern: "new students often rush in guard before they learn base and posture",
    classPath: "/adult-bjj",
    classLabel: "Adults Jiu-Jitsu",
    relatedGuide: "/blog/gi-vs-no-gi-bjj-cheat-code",
    relatedGuideLabel: "gi vs no-gi BJJ guide",
    watchSignals: [
      "Watch the passer posture before any step around the legs.",
      "Notice how the hips are controlled. Passing is hard when the bottom player can freely turn.",
      "Look for head position, shoulder pressure, and hand placement.",
      "Watch whether the passer clears frames before trying to settle.",
      "Notice the transition after the pass. A pass matters only if control follows.",
      "Listen for cues about not reaching with the arms.",
      "Look at the bottom player reaction. Guard passing is a conversation.",
      "Watch whether the drill teaches pressure without smashing a partner needlessly."
    ],
    planningSteps: [
      "Pick one passing idea and connect it to one finishing position.",
      "Ask whether the pass starts from closed guard, open guard, half guard, or a scramble.",
      "Slow down at the moment your base feels unstable.",
      "Use the glossary for guard, frame, posture, and side control if the terms feel new.",
      "Pair passing study with escape study so both sides of the position make sense.",
      "Bring the question to class rather than trying to force the pass during live rounds."
    ],
    topicNotes: [
      "Posture breaks usually happen before passes fail.",
      "Knee-line control matters. The legs frame and recover guard.",
      "Pressure passing teaches patience and weight placement.",
      "Angle passing teaches movement around the hips.",
      "Leg drags connect passing to back exposure and side control.",
      "Guard passing is safer when both partners understand frames and tapping rules."
    ]
  },
  escapes: {
    title: "How to Use the BJJ Escapes Video Hub",
    searchPhrase: "BJJ escape videos",
    learner: "beginners who want to get safe, breathe under pressure, recover guard, and stand up without panic",
    localAudience: "kids, teens, adults, and nervous first-timers near Tannersville, Hunter, Windham, and Haines Falls",
    trainingGoal: "turn bad positions into clear next steps instead of emergencies",
    primaryConcern: "most new students fear being stuck more than they fear learning a technique",
    classPath: "/schedule",
    classLabel: "Class Schedule",
    relatedGuide: "/blog/exactly-what-happens-first-bjj-class-minute-by-minute",
    relatedGuideLabel: "what happens in a first BJJ class",
    watchSignals: [
      "Watch the first safety step. Escapes start with breathing, frames, and protecting space.",
      "Notice whether the student turns toward a useful angle instead of pushing straight back.",
      "Look for hip movement. The hips usually make the escape possible.",
      "Watch how the coach breaks a stuck position into smaller checkpoints.",
      "Listen for reminders not to bench press the partner away.",
      "Notice the reset after the escape. Getting out is only useful if the student lands somewhere safe.",
      "Look for calm reactions from bottom position.",
      "Watch how the same frame appears in mount, side control, turtle, and standing defense."
    ],
    planningSteps: [
      "Use this hub first if sparring makes you nervous.",
      "Pick one escape from one position and learn the checkpoints.",
      "Ask the coach where your frames should go before asking how hard to bridge.",
      "Pair escape videos with positioning videos so you know what the top person wants.",
      "For kids and teens, frame escapes as decision making instead of losing.",
      "For adults, remember that slower, cleaner escapes usually beat tense explosive attempts."
    ],
    topicNotes: [
      "Mount escapes teach bridge, frame, and elbow-knee recovery.",
      "Side control escapes teach patience with shoulder pressure and hip movement.",
      "Turtle escapes teach hand safety and direction changes.",
      "Front headlock escapes teach posture and clearing the neck line.",
      "Technical stand-ups help students leave ground exchanges safely.",
      "Guard retention connects escape work to offense."
    ]
  },
  submissions: {
    title: "How to Use the BJJ Submissions Video Hub",
    searchPhrase: "BJJ submission videos",
    learner: "students who want chokes, armbars, kimuras, guillotines, and finishing mechanics taught with control",
    localAudience: "teens, adults, and supervised kids learning safe finishing habits near Tannersville and the Catskills",
    trainingGoal: "understand how control leads to the finish and how tapping early protects training partners",
    primaryConcern: "new students often see submissions as the whole art, but good coaching treats the finish as the last step after position",
    classPath: "/adult-bjj",
    classLabel: "Adults Jiu-Jitsu",
    relatedGuide: "/blog/neck-cranks-bjj-longevity-guide",
    relatedGuideLabel: "neck cranks and BJJ longevity",
    watchSignals: [
      "Watch the control before the finish. A clean submission should not depend on surprise or force.",
      "Notice where the partner can tap and how quickly the pressure stops.",
      "Look for posture, wedges, grips, and angles before the final squeeze.",
      "Listen for safety cues about the neck, shoulder, elbow, and wrist.",
      "Watch how the setup begins from a position of control.",
      "Notice whether the coach explains the escape risk.",
      "Look for patient transitions when the first finish is defended.",
      "Watch how students release and reset after the tap."
    ],
    planningSteps: [
      "Study submissions after you understand the position they come from.",
      "Ask the coach where the control is before asking how to finish harder.",
      "Tap early during practice and release immediately when your partner taps.",
      "Avoid cranking the neck or shoulder while learning mechanics.",
      "Use this hub to recognize common finishes, then drill them under supervision.",
      "Pair submission study with escape study so you know both responsibilities."
    ],
    topicNotes: [
      "Rear naked chokes depend on back control and clean hand position.",
      "Guillotines depend on head position, elbow height, and hip placement.",
      "Armbars depend on isolating the shoulder and controlling posture.",
      "Kimuras teach grip control, shoulder safety, and positional transitions.",
      "Cross-collar chokes teach patience with grips and angle.",
      "North-south and front headlock finishes require careful neck safety."
    ]
  },
  positioning: {
    title: "How to Use the BJJ Positioning Video Hub",
    searchPhrase: "BJJ positioning videos",
    learner: "students who want better base, posture, frames, pressure, pins, and transitions",
    localAudience: "beginners, wrestlers, parents, teens, and adult hobbyists near Tannersville and the surrounding Catskills",
    trainingGoal: "understand where to put weight, hands, hips, head, and knees so techniques become easier",
    primaryConcern: "many students chase moves before they understand why one position is stable and another is fragile",
    classPath: "/schedule",
    classLabel: "Class Schedule",
    relatedGuide: "/blog/beginners-guide-bjj-human-chess",
    relatedGuideLabel: "beginner BJJ as human chess",
    watchSignals: [
      "Watch base before motion. A stable student can move without giving up balance.",
      "Notice head position. The head often controls posture and direction.",
      "Look at the knees and hips during pins.",
      "Watch whether pressure is placed through structure rather than through roughness.",
      "Notice frames from the bottom player and how the top player clears them.",
      "Listen for cues about chest-to-chest, chest-to-back, and inside position.",
      "Look for transitions that keep control during movement.",
      "Watch how students use pauses to settle before advancing."
    ],
    planningSteps: [
      "Use positioning videos when a technique feels mysterious.",
      "Name the position before trying to name the move.",
      "Ask what your hands, knees, hips, and head should be doing.",
      "Pair positioning study with submissions and escapes so the map feels complete.",
      "For kids, turn positions into simple landmarks like mount, guard, back, and side.",
      "For adults, slow the round down by finding base before chasing the next attack."
    ],
    topicNotes: [
      "Mount teaches knees, hips, and posture.",
      "Side control teaches shoulder pressure, frames, and crossface awareness.",
      "Back control teaches hooks, chest-to-back contact, and seatbelt control.",
      "Guard teaches distance management and posture.",
      "Front headlock teaches head position and hand fighting.",
      "Scramble positions teach recovery and decision making."
    ]
  },
  "self-defense": {
    title: "How to Use the BJJ Self-Defense Video Hub",
    searchPhrase: "BJJ self-defense videos",
    learner: "students and families who want posture, boundaries, escapes, grip breaks, safe get-ups, and control-first responses",
    localAudience: "kids, teens, adults, parents, and beginners near Tannersville, Hunter, Windham, Haines Falls, and nearby Catskills towns",
    trainingGoal: "build practical safety habits without fear-based training or reckless escalation",
    primaryConcern: "people searching for self-defense want useful skills, but they also want a room that teaches judgment and calm",
    classPath: "/book-free-intro",
    classLabel: "Book Free Intro",
    relatedGuide: "/sensei-bully",
    relatedGuideLabel: "parent anti-bullying plan",
    watchSignals: [
      "Watch posture first. Self-defense improves when the student can stand, breathe, and protect space.",
      "Notice whether the response creates distance, control, or an exit instead of a dramatic finish.",
      "Look for grip breaks that use leverage rather than panic pulling.",
      "Watch how the coach talks about boundaries and partner care.",
      "Listen for safety language around the head, neck, and hands.",
      "Notice the connection between breakfalls, technical stand-ups, and escapes.",
      "Look for skills that work for smaller students through structure.",
      "Watch whether the lesson avoids fear and focuses on repeatable decisions."
    ],
    planningSteps: [
      "Use this hub as a first stop if your goal is practical confidence.",
      "Choose clips about posture, grip breaks, and stand-ups before submissions.",
      "For children, talk about getting help, using voice, and escaping, not fighting to win.",
      "For adults, ask how the skill changes when the goal is disengagement.",
      "Practice only under supervision when a drill involves the neck, head, or takedown pressure.",
      "Book a first visit to feel the room before making a long-term plan."
    ],
    topicNotes: [
      "Grip breaks teach leverage and boundary setting.",
      "Hair-grab and bear-hug defenses teach posture, base, and safe turning.",
      "Technical stand-ups teach distance after a ground exchange.",
      "Breakfalls make accidental falls less scary.",
      "Escapes teach breathing under pressure.",
      "Control positions teach restraint and safe stopping points."
    ]
  }
};

const TECHNIQUE_TAG_MAP = new Map([
  ["breakfalls", "breakfalls"],
  ["breakfall", "breakfalls"],
  ["ukemi", "breakfalls"],
  ["safe-falls", "breakfalls"],
  ["safe-fall", "breakfalls"],
  ["takedown", "takedowns"],
  ["takedowns", "takedowns"],
  ["wrestling", "takedowns"],
  ["guard-passing", "guard-passing"],
  ["guardpass", "guard-passing"],
  ["passing", "guard-passing"],
  ["pass", "guard-passing"],
  ["escapes", "escapes"],
  ["escape", "escapes"],
  ["retention", "escapes"],
  ["submissions", "submissions"],
  ["submission", "submissions"],
  ["chokes", "submissions"],
  ["choke", "submissions"],
  ["armbar", "submissions"],
  ["triangle", "submissions"],
  ["kimura", "submissions"],
  ["guillotine", "submissions"],
  ["position", "positioning"],
  ["positioning", "positioning"],
  ["control-position", "positioning"],
  ["positional", "positioning"],
  ["base", "positioning"],
  ["posture", "positioning"],
  ["mount", "positioning"],
  ["side-control", "positioning"],
  ["back-control", "positioning"],
  ["self-defense", "self-defense"],
  ["selfdefense", "self-defense"],
  ["self defense", "self-defense"],
  ["safety", "self-defense"],
  ["grip-break", "self-defense"],
  ["grip-breaks", "self-defense"],
  ["grip-breaker", "self-defense"],
  ["grip-breakers", "self-defense"],
  ["technique", "submissions"]
]);

const TECHNIQUE_PATTERNS = [
  ["breakfalls", /\bbreakfalls?|ukemi|safe falls?|fall safely|stand up safely|get[- ]?ups?\b/i],
  ["takedowns", /\btakedowns?|single leg|double leg|knee pick|tai otoshi|snap[- ]?downs?|duck and hug|duck\b/i],
  ["guard-passing", /\bguard pass(?:ing)?|leg drag|knee slice|headquarters|pogo stick pass|passing\b/i],
  ["escapes", /\bescapes?|retention|bridge and roll|trap and roll|stand up safely\b/i],
  ["submissions", /\bchokes?|armbar|guillotine|triangle|kimura|mata le[aã]o|rear naked choke|\brnc\b|north[- ]?south\b/i],
  ["positioning", /\bposition(?:ing|al)?|posture|base|mount|side control|back control|knee[- ]on[- ]belly|top control|pin(?:ning)?\b/i],
  ["self-defense", /\bself[- ]?defense|hair grab|bear hug|body lock defense|grip breaks?|beginner safety\b/i]
];

const FEATURED_PARTIAL_CONFIG = [
  {
    file: "video-featured-home.html",
    heading: "Featured Class Clips",
    intro: "Browse the indexed video hubs to preview pacing, safety cues, and coaching style before you visit."
  },
  {
    file: "video-featured-kids.html",
    heading: "Featured Kids Clips",
    intro: "Use the kids and safety hubs to preview kid-friendly instruction, controlled drills, and clear safety coaching."
  },
  {
    file: "video-featured-teens.html",
    heading: "Featured Teens Clips",
    intro: "Use the teens and escapes hubs to preview structure, composure, and progressive coaching."
  },
  {
    file: "video-featured-adults.html",
    heading: "Featured Adults Clips",
    intro: "Use the adults and technique hubs to preview pace, technical detail, and beginner-safe rounds."
  },
  {
    file: "video-featured-programs.html",
    heading: "Featured Clips By Program",
    intro: "Compare each program lane from the indexed hubs."
  },
  {
    file: "video-featured-schedule.html",
    heading: "Watch A Lane Before You Book",
    intro: "Preview each lane from indexed hubs to match the right class time and comfort level."
  },
  {
    file: "video-featured-show-up-kit.html",
    heading: "Start-Here Video Clips",
    intro: "Start with indexed hubs covering self-defense basics, escapes, and first-class pacing."
  }
];

const rawData = JSON.parse(await fs.readFile(dataPath, "utf8"));
const sourceVideos = Array.isArray(rawData) ? rawData : rawData.items || [];
let overrides = {};
let relatedGuides = { byProgram: {}, byTechnique: {} };
try {
  overrides = JSON.parse(await fs.readFile(overridesPath, "utf8"));
} catch {
  overrides = {};
}
try {
  relatedGuides = JSON.parse(await fs.readFile(relatedGuidesPath, "utf8"));
} catch {
  relatedGuides = { byProgram: {}, byTechnique: {} };
}

const loadExistingSlugById = async () => {
  const map = new Map();
  try {
    const entries = await fs.readdir(videosDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
      const base = entry.name.slice(0, -5);
      if (base.length <= 12) continue;
      if (base.charAt(base.length - 12) !== "-") continue;
      const slugId = base.slice(-11);
      if (!/^[A-Za-z0-9-]{11}$/.test(slugId)) continue;
      map.set(normalizeVideoId(slugId), base);
    }
  } catch {
    return map;
  }
  return map;
};

const existingSlugById = await loadExistingSlugById();

const unique = (items) => {
  const out = [];
  for (const item of items || []) {
    if (!item) continue;
    if (!out.includes(item)) out.push(item);
  }
  return out;
};

const normalizeTokens = (items = []) => {
  return unique(
    items
      .flatMap((item) => (Array.isArray(item) ? item : [item]))
      .map((item) => String(item || "").trim().toLowerCase())
      .filter(Boolean)
  );
};

const escapeHtml = (value) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const compactVideoTitle = (rawTitle = "") => {
  let title = String(rawTitle).trim();
  if (!title) return title;

  title = title.replace(/\bBrazilian Jiu Jitsu\b/gi, "BJJ");
  title = title.replace(/\bJiu[-\s]?Jitsu\b/gi, "BJJ");
  title = title.replace(/\bBJJ Class(?: Breakdown| Games| Talk)?\b/gi, "BJJ");
  title = title.replace(/\s*\|\s*Beginner BJJ Class\b/gi, "");
  title = title.replace(/\s*\|\s*BJJ Class(?: Breakdown| Games| Talk)?\b/gi, "");
  title = title.replace(/\s+in\s+(Tannersville|Kingston)(?:,\s*NY)?\b/gi, " ($1)");
  title = title.replace(/\s+(Tannersville|Kingston),\s*NY\b/gi, " ($1)");
  title = title.replace(/\s{2,}/g, " ").trim();

  return title;
};

const normalizeTopic = (value) => {
  return String(value || "")
    .replace(/\(.*?\)/g, "")
    .replace(/\bBJJ\b/gi, "")
    .replace(/\bBrazilian Jiu Jitsu\b/gi, "")
    .replace(/\bJiu[-\s]?Jitsu\b/gi, "")
    .replace(/\bClass\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const extractTopics = (title) => {
  if (!title) return [];
  const cleaned = String(title)
    .replace(/\s*\|\s*BJJ Class(?: Breakdown| Games| Talk)?/gi, "")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  const parts = cleaned.split(/→|->|\+|\||:|,/g);
  const topics = [];
  for (const part of parts) {
    const topic = normalizeTopic(part);
    if (topic && !topics.includes(topic)) topics.push(topic);
  }
  return topics.slice(0, 6);
};

const buildTitleTag = (title, siteTitle = SITE_TITLE, min = TITLE_MIN, max = TITLE_MAX) => {
  let baseTitle = String(title || "").trim();
  if (!baseTitle) baseTitle = "BJJ Class Video in Tannersville";
  const suffix = ` | ${siteTitle}`;
  const minimumBaseLength = Math.max(10, min - suffix.length);

  if (baseTitle.length < minimumBaseLength) {
    if (!/\bbjj\b/i.test(baseTitle)) baseTitle = `${baseTitle} BJJ Class`;
    if (!/\btannersville\b/i.test(baseTitle)) baseTitle = `${baseTitle} in Tannersville`;
    if (baseTitle.length < minimumBaseLength) baseTitle = `${baseTitle} Video`;
    baseTitle = baseTitle.replace(/\s{2,}/g, " ").trim();
  }

  if (baseTitle.length + suffix.length <= max) {
    return `${baseTitle}${suffix}`;
  }
  const maxTitle = Math.max(10, max - suffix.length);
  let trimmed = baseTitle.slice(0, maxTitle);
  trimmed = trimmed.replace(/\s+[^\s]*$/, "");
  trimmed = trimmed.replace(/[-,:;.!\\s]+$/g, "");
  if (!trimmed) trimmed = baseTitle.slice(0, maxTitle);
  return `${trimmed}${suffix}`;
};

const clampDescription = (value, max = META_DESCRIPTION_MAX) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= max) return text;
  const cut = Math.max(0, max - 1);
  let trimmed = text.slice(0, cut).replace(/\s+[^\s]*$/, "").trim();
  if (!trimmed) trimmed = text.slice(0, cut).trim();
  return `${trimmed}.`;
};

const buildDefaultDescription = (title) => {
  const prefix = "Sensei Sandy BJJ video: ";
  const suffix = ". Beginner-friendly coaching in Tannersville, NY.";
  const available = Math.max(20, META_DESCRIPTION_MAX - prefix.length - suffix.length);
  let topic = String(title || "").replace(/\s+/g, " ").trim();
  if (topic.length > available) {
    topic = topic.slice(0, available).replace(/\s+[^\s]*$/, "").trim();
  }
  return clampDescription(`${prefix}${topic}${suffix}`);
};

const laneToAudience = (lane, title = "") => {
  const lowerTitle = String(title).toLowerCase();
  if (lowerTitle.includes("kids")) return "Kids";
  if (lowerTitle.includes("teens") || lowerTitle.includes("teen")) return "Teens";
  if (lowerTitle.includes("adult") || lowerTitle.includes("adults")) return "Adults";
  switch (lane) {
    case "kids":
      return "Kids";
    case "teens":
      return "Teens";
    case "adults":
      return "Adults";
    case "mixed":
      return "Kids, Teens, Adults";
    case "safety":
      return "Kids and Adults";
    default:
      return "Adults";
  }
};

const detectLocation = (title = "") => {
  const lowerTitle = String(title).toLowerCase();
  if (lowerTitle.includes("kingston")) return "Kingston, NY";
  if (lowerTitle.includes("tannersville")) return "Tannersville, NY";
  return "Tannersville, NY";
};

const buildSummary = ({ title, topics, audience, location }) => {
  const topicSentence = topics.length ? topics.join(", ") : title;
  const first = `This class clip focuses on ${topicSentence} with calm, repeatable coaching cues so you can see how the sequence is taught in real time.`;
  const second = `You will notice the pacing, partner pairing, and safety-minded resets that keep ${audience.toLowerCase()} progressing in a ${location} session.`;
  return [first, second];
};

const buildTakeaways = (topics) => {
  const base = topics.slice(0, 5).map((topic) => `Key detail on ${topic}.`);
  const fallback = [
    "How the coach frames the main technique.",
    "What a clean, controlled rep looks like.",
    "Where beginners tend to pause or reset."
  ];
  return unique([...base, ...fallback]).slice(0, 6);
};

const localBusinessJson = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "SportsActivityLocation"],
  "@id": "https://senseisandy.com/#localbusiness",
  name: "Sensei Sandy BJJ",
  url: "https://senseisandy.com",
  telephone: "+19177368649",
  email: "me@senseisandy.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "6045 Main Street, 2nd Floor Studio",
    addressLocality: "Tannersville",
    addressRegion: "NY",
    postalCode: "12485",
    addressCountry: "US"
  },
  sameAs: [
    "https://www.instagram.com/senseisandybjj/",
    "https://www.facebook.com/p/Sensei-Sandy-BJJ-61579362991950/",
    "https://www.youtube.com/@SenseiSandyBJJ"
  ]
};

const normalizeLane = (value) => {
  const lane = String(value || "").trim().toLowerCase();
  if (["kids", "teens", "adults", "mixed", "safety"].includes(lane)) return lane;
  if (lane === "kid") return "kids";
  if (lane === "teen") return "teens";
  if (lane === "adult") return "adults";
  return "mixed";
};

const getVideoId = (video) => video.videoId || video.id || "";

const normalizeHubList = (input, validSet) => {
  const list = normalizeTokens(Array.isArray(input) ? input : []);
  return list.filter((token) => validSet.has(token));
};

const inferProgramsFromTitle = (title) => {
  const t = String(title || "").toLowerCase();
  const inferred = [];
  if (/\bkids?\b/.test(t)) inferred.push("kids");
  if (/\bteens?\b/.test(t)) inferred.push("teens");
  if (/\badults?\b/.test(t)) inferred.push("adults");
  return unique(inferred);
};

const classifyProgramHubs = ({ video, override }) => {
  const manual = normalizeHubList(override.programHubs, PROGRAM_SET);
  if (manual.length) return manual;

  const lane = normalizeLane(override.lane || video.lane);
  if (PROGRAM_SET.has(lane)) return [lane];

  const inferred = inferProgramsFromTitle(video.title);
  if (inferred.length) return inferred;

  return ["adults"];
};

const normalizeTag = (value) => {
  return String(value || "")
    .toLowerCase()
    .replace(/[_]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const mapTagToTechniqueHub = (tag) => {
  const normalized = normalizeTag(tag);
  if (!normalized) return "";

  if (TECHNIQUE_TAG_MAP.has(normalized)) return TECHNIQUE_TAG_MAP.get(normalized);
  if (normalized.includes("breakfall")) return "breakfalls";
  if (normalized.includes("takedown")) return "takedowns";
  if (normalized.includes("pass")) return "guard-passing";
  if (normalized.includes("escape") || normalized.includes("retention")) return "escapes";
  if (normalized.includes("submission") || normalized.includes("choke") || normalized.includes("armbar")) return "submissions";
  if (
    normalized.includes("position") ||
    normalized.includes("posture") ||
    normalized.includes("base") ||
    normalized.includes("mount") ||
    normalized.includes("control")
  ) {
    return "positioning";
  }
  if (normalized.includes("safety") || normalized.includes("self-defense") || normalized.includes("selfdefense")) return "self-defense";

  return "";
};

const classifyTechniqueByKeywords = (title, topics) => {
  const haystack = [title || "", ...(topics || [])].join(" ");
  const hubs = [];
  for (const [slug, pattern] of TECHNIQUE_PATTERNS) {
    if (pattern.test(haystack)) hubs.push(slug);
  }
  return unique(hubs);
};

const classifyTechniqueHubs = ({ video, override, topics }) => {
  const manual = normalizeHubList(override.techniqueHubs, TECHNIQUE_SET);
  if (manual.length) return manual;

  const rawTags = normalizeTokens([...(video.tags || []), ...(override.tags || [])]);
  const fromTags = unique(rawTags.map(mapTagToTechniqueHub).filter(Boolean));
  if (fromTags.length) return fromTags;

  const byKeywords = classifyTechniqueByKeywords(video.title, topics);
  if (byKeywords.length) return byKeywords;

  const lane = normalizeLane(override.lane || video.lane);
  if (lane === "kids" || lane === "safety") return ["self-defense"];
  if (lane === "teens") return ["escapes"];
  return ["submissions"];
};

const toAbsoluteUrl = (pathValue) => {
  if (!pathValue || pathValue === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${pathValue}`;
};

const sortByPlaylist = (a, b) => {
  const aIndex = Number.isFinite(Number(a.playlistIndex)) ? Number(a.playlistIndex) : Number.MAX_SAFE_INTEGER;
  const bIndex = Number.isFinite(Number(b.playlistIndex)) ? Number(b.playlistIndex) : Number.MAX_SAFE_INTEGER;
  if (aIndex !== bIndex) return aIndex - bIndex;
  return String(a.slug).localeCompare(String(b.slug));
};

const toPublishedTimestamp = (value) => {
  const text = String(value || "").trim();
  if (!text) return Number.NaN;
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? timestamp : Number.NaN;
};

const sortByNewestThenPlaylist = (a, b) => {
  const aTs = toPublishedTimestamp(a.published);
  const bTs = toPublishedTimestamp(b.published);
  const aHasDate = Number.isFinite(aTs);
  const bHasDate = Number.isFinite(bTs);

  if (aHasDate && bHasDate && aTs !== bTs) return bTs - aTs;
  if (aHasDate !== bHasDate) return aHasDate ? -1 : 1;
  return sortByPlaylist(a, b);
};

const fillToThree = (preferred, fallback) => {
  const picks = [];
  const addAll = (items) => {
    for (const item of items || []) {
      if (!item) continue;
      if (picks.some((existing) => existing.slug === item.slug)) continue;
      picks.push(item);
      if (picks.length >= 3) return;
    }
  };
  addAll(preferred);
  if (picks.length < 3) addAll(fallback);
  return picks.slice(0, 3);
};

const renderHubNav = () => {
  const programLinks = PROGRAM_HUBS.map(
    (hub) => `<a class="btn btn-outline-primary btn-sm" href="${hub.path}">${escapeHtml(hub.label)}</a>`
  ).join("\n          ");
  const techniqueLinks = TECHNIQUE_HUBS.map(
    (hub) => `<a class="btn btn-outline-secondary btn-sm" href="${hub.path}">${escapeHtml(hub.label)}</a>`
  ).join("\n          ");

  return `
      <div class="border rounded-3 p-3 mb-4">
        <h2 class="h6 mb-2">Browse by program</h2>
        <div class="d-flex flex-wrap gap-2 mb-3">
          ${programLinks}
        </div>
        <h2 class="h6 mb-2">Browse by technique</h2>
        <div class="d-flex flex-wrap gap-2">
          ${techniqueLinks}
        </div>
      </div>`;
};

const renderVideoListItems = (videos) => {
  return videos
    .map((video) => {
      const programLabel = PROGRAM_MAP.get(video.primaryProgramHub)?.label || "Adults";
      const techniqueLabel = TECHNIQUE_MAP.get(video.primaryTechniqueHub)?.label || "Submissions";
      const description = `${programLabel} lane • ${techniqueLabel}`;
      return `<a class="video-card" href="${video.path}">
            <p class="video-card-title">${escapeHtml(video.displayTitle)}</p>
            <p class="video-card-meta">${escapeHtml(description)}</p>
          </a>`;
    })
    .join("\n          ");
};

const guideSlugFromPath = (canonicalPath) => {
  const parts = String(canonicalPath || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[parts.length - 1] || "";
};

const buildHubVideoNotes = (videos, profile) => {
  const notes = [];
  for (const video of videos.slice(0, 12)) {
    const programLabel = PROGRAM_MAP.get(video.primaryProgramHub)?.label || "Adults";
    const techniqueLabel = TECHNIQUE_MAP.get(video.primaryTechniqueHub)?.label || "Submissions";
    const topicSentence = video.topics.length
      ? `The title points toward ${video.topics.slice(0, 3).join(", ")}, so watch the first control point and the reset.`
      : "Watch the first control point, the coach correction, and the way the partners reset.";
    notes.push(
      `<li><strong>${escapeHtml(video.displayTitle)}:</strong> ${escapeHtml(topicSentence)} This clip belongs to the ${escapeHtml(programLabel)} lane and supports the ${escapeHtml(techniqueLabel.toLowerCase())} path.</li>`
    );
  }

  for (const item of profile.topicNotes || []) {
    if (notes.length >= 12) break;
    notes.push(`<li>${escapeHtml(item)} Watch for the cue, the partner reaction, and the recovery position before adding speed.</li>`);
  }

  return notes.join("\n          ");
};

const renderHubGuide = ({ canonicalPath, heading, description, videos }) => {
  const hubSlug = guideSlugFromPath(canonicalPath);
  const profile = HUB_GUIDE_PROFILES[hubSlug];
  if (!profile) return "";

  const watchSignals = profile.watchSignals
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("\n          ");
  const planningSteps = profile.planningSteps
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("\n          ");
  const videoNotes = buildHubVideoNotes(videos, profile);

  return `<div class="card prose video-hub-guide mt-4">
        <h2>${escapeHtml(profile.title)}</h2>
        <p>${escapeHtml(description)}</p>
        <p>If you found this page while searching for ${escapeHtml(profile.searchPhrase)}, use it as a practical preview of how Sensei Sandy BJJ teaches the subject in a real class. The goal is not to memorize every clip before you visit. The goal is to understand the pace of instruction, the safety language, the partner expectations, and the way a beginner can move from watching to training without guessing.</p>
        <p>This hub is built for ${escapeHtml(profile.learner)}. It is especially useful for ${escapeHtml(profile.localAudience)} who want to see the room before booking, compare class lanes, or decide whether Brazilian Jiu-Jitsu is the right activity for the next season. Each video is a small window into class culture: calm coaching, clear steps, controlled contact, and a strong bias toward safe repetitions.</p>
        <p>The training goal for this hub is to ${escapeHtml(profile.trainingGoal)}. That matters because BJJ is more than a list of moves. A student has to learn when to slow down, where to put weight, how to protect a partner, and how to reset after a mistake. Video makes those small habits easier to see before the student walks upstairs to the mats.</p>
        <p>${escapeHtml(profile.primaryConcern)} These clips answer that concern better than a long promise can. You can see whether the coach breaks the skill down, whether students have room to ask questions, whether the drill has a beginning and an end, and whether the tone feels appropriate for your family or training style.</p>

        <h2>Start With Intent, Not Scrolling</h2>
        <p>A video hub works best when you pick a question first. Ask what you are trying to understand: safety, pace, body position, partner matching, first-class nerves, or the difference between a drill and a live round. Then watch one clip for that question. If you try to binge the whole page, the details blend together and the useful coaching cues are easier to miss.</p>
        <p>For a brand-new student, the most important details are usually quiet details. Watch how the coach starts the rep, how partners place their hands, how students stop, and how the class returns to the starting point. Those moments show whether the school has structure. A clean reset tells you that the skill is being taught as a process, not as a scramble.</p>
        <p>For parents, the most useful question is not whether a child looks impressive. The question is whether the child knows what is expected next. Good youth and teen training creates simple boundaries: listen, protect your partner, tap when needed, stop when told, and try the next rep. If a clip shows those boundaries clearly, it is a strong sign that the first visit will be easier to understand.</p>
        <p>For adults, the useful question is whether the pace looks sustainable. You do not need to arrive in peak shape to begin BJJ, but you do need a room where the first layer is clear. Look for posture, frames, grips, safe landings, and controlled pressure before you judge the athleticism of the students. Those basics are what let adults train for months and years instead of treating the first class like a test.</p>

        <h2>What To Watch For</h2>
        <ul>
          ${watchSignals}
        </ul>
        <p>BJJ can look complex from the outside. A beginner sees arms, legs, grips, and rolling bodies. A coach sees checkpoints: where the head is, where the hips are, whether the spine is safe, whether the partner can tap, and whether the student has a route back to balance. Training becomes less intimidating when you learn to watch those checkpoints.</p>

        <h2>Video Notes In This Hub</h2>
        <p>The titles below are not meant to replace in-person coaching. Use them as a reading guide for the playlist. Before you press play, read the note and decide what you will watch for. After the clip, ask whether you saw the setup, the control point, and the reset. If you missed one of those, rewatch that portion instead of jumping to the next video.</p>
        <ul>
          ${videoNotes}
        </ul>

        <h2>How This Connects To Class</h2>
      <p>Use this hub to make the first in-person class easier to read. You will still learn from the coach in the room, and the video gives you vocabulary before you arrive.</p>
      <p>Class adds feedback. A technique may look simple on screen, but your balance, grip, breathing, and timing all change when another person is moving with you. Watch enough to understand the shape of training, then get coached through the details.</p>
        <p>Do not worry if the first watch feels confusing. BJJ is a layered skill. The first layer is safety. The second layer is position. The third layer is timing. The fourth layer is choice. A beginner who understands only the safety layer is already doing something useful. The rest becomes clearer after repeated classes.</p>
        <p>Students who improve steadily tend to ask better questions over time. At first, ask where to put your hands and how to stay safe. Later, ask what the partner is trying to do. Then ask how to connect one position to the next. A video hub can support that progression. You can return to the same clip with a better eye after several classes.</p>

        <h2>Planning A First Visit</h2>
        <ul>
          ${planningSteps}
        </ul>
        <p>If the hub fits what you are looking for, the next step is simple: visit the page for <a href="${profile.classPath}">${escapeHtml(profile.classLabel)}</a>, check the current class path, and choose a first date. For deeper context, read the related guide on <a href="${profile.relatedGuide}">${escapeHtml(profile.relatedGuideLabel)}</a>. The most important decision is not which video to watch next. It is choosing a calm first rep in the room.</p>

        <h2>Use This Hub With The Rest Of The Library</h2>
      <p>No single BJJ topic stands alone. ${escapeHtml(heading)} is one doorway into a larger skill map. A student who studies this page should also understand the neighboring hubs. One class may move from standing to guard, from guard to passing, from passing to pinning, from pinning to submission, and then back to escape work when the partner responds. That is why Sensei Sandy BJJ keeps separate hubs for programs and techniques instead of treating every clip as an isolated highlight.</p>
        <p>If you are a parent, compare this hub with the kids or teens lane so you can see whether the skill is being taught at the right maturity level. If you are an adult beginner, compare it with escapes, positioning, and breakfalls so you can recognize the safety layer under the technique. If you already have wrestling, striking, fitness, or self-defense experience, use the related hubs to notice what changes when the goal is controlled grappling rather than winning one exchange.</p>
      <p>Choose one primary hub and one support hub. For example, a student studying takedowns should also review breakfalls. A student studying submissions should also review positioning and escapes. A student studying guard passing should also review guard recovery and frames through the glossary. A student studying self-defense should also review safe stand-ups, grip breaks, and controlled disengagement. The goal is to connect the topics instead of scrolling one lane in isolation.</p>
        <p>When a clip makes you curious, bring that curiosity to class. Ask where the skill begins, where it usually fails, and what the partner should do to stay safe. That kind of question helps the coach give a useful answer. It also keeps video from becoming a passive scroll. The library is here to make the next live rep clearer, calmer, and easier to remember.</p>

        <h2>FAQ</h2>
        <h3>Can I learn this from video alone?</h3>
        <p>No. Video is useful for previewing language, pace, and class culture, but BJJ needs live feedback. A coach can correct posture, pressure, distance, and partner safety in ways a screen cannot. Use the hub to arrive informed, then let class teach the details.</p>
        <h3>Which video should I watch first?</h3>
        <p>Start with the clip whose title matches the question you already have. If you are nervous, start with safety, escapes, breakfalls, or positioning. If you are comparing programs for a child or teen, choose a clip that shows the age lane and watch the class structure more than the final move.</p>
        <h3>What if I do not understand the terms?</h3>
        <p>That is normal. Use the glossary and the related guide links when a word feels important. You do not need a perfect vocabulary before class. Knowing a few words like tap, frame, guard, mount, posture, and base is enough to make the first lesson easier.</p>
        <h3>Are these videos beginner friendly?</h3>
        <p>They are meant to help beginners see how training is taught, but some clips include students with different experience levels. Watch for the coaching cues rather than trying to copy every detail. In class, the coach can scale the same idea for a first-day student.</p>
        <h3>Can parents use this hub before bringing a child?</h3>
        <p>Yes. Parents can watch for tone, pacing, safety rules, and partner care. A child does not have to study the whole page. Often it is better for the parent to preview the room first, then show the child one simple clip so the visit feels familiar.</p>
        <h3>How should adults use the hub if they are out of shape?</h3>
        <p>Focus on structure, not intensity. Look for how the coach explains body position and how students reset. A first class is not a fitness test. It is a chance to learn the room, move at an appropriate pace, and build a training habit that can grow.</p>
        <h3>How often should I rewatch a clip?</h3>
        <p>Rewatch after class, not only before class. The same video will make more sense after you have felt the position in person. A short rewatch can help you remember one correction, one grip, or one safety rule for the next visit.</p>
        <h3>What is the clearest next step?</h3>
        <p>If the coaching style looks like a fit, book a free intro or check the schedule. The hub should reduce uncertainty, but the decision becomes real only when you step on the mats, meet the coach, and try the first controlled rep.</p>
      </div>`;
};

const toHubCardTitle = (title = "", max = 70) => {
  const source = String(title || "").replace(/\s+/g, " ").trim();
  if (!source || source.length <= max) return source;
  let trimmed = source.slice(0, max).replace(/\s+[^\s]*$/, "").trim();
  trimmed = trimmed.replace(/[-,:;.!\\s]+$/g, "");
  return trimmed || source.slice(0, max).trim();
};

const toSentenceCase = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatTopicLabel = (value = "") => {
  return String(value || "")
    .replace(/\bBJJ\b/gi, "")
    .replace(/\bBrazilian Jiu Jitsu\b/gi, "")
    .replace(/\bJiu[-\s]?Jitsu\b/gi, "")
    .replace(/\bTannersville,\s*NY\b/gi, "")
    .replace(/\bTannersville\b/gi, "")
    .replace(/\bKingston,\s*NY\b/gi, "")
    .replace(/\bKingston\b/gi, "")
    .replace(/\bNY\b/g, "")
    .replace(/\bin\s*$/i, "")
    .replace(/\b(?:in|and|plus)\b$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const isUsefulExcerptTopic = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return false;
  if (text.length < 4) return false;
  if (/^(kids|teens|adults|adult|ny|skills)$/i.test(text)) return false;
  return /[a-z]{3,}/i.test(text);
};

const isSpecificExcerptTopic = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/(monday|tuesday|wednesday|thursday|friday|saturday|sunday|night|no gi|gi|intro)/i.test(text)) return false;
  if (/(kids teens|teens and|adults and|adults? \d|^\d+pm\b)/i.test(text)) return false;
  return /(escape|choke|guard|mount|takedown|headlock|breakfall|stand up|sweep|armbar|kimura|guillotine|pressure|position|control|body lock|pick|drag|triangle|grip|safety)/i.test(text);
};

const buildVideoCardExcerpt = (video) => {
  const laneLabel = PROGRAM_MAP.get(video.primaryProgramHub)?.label || "Adults";
  const techniqueLabel = TECHNIQUE_MAP.get(video.primaryTechniqueHub)?.label || "submissions";
  const laneAudience = laneLabel === "Adults" ? "Adult" : laneLabel;
  const cleanTopics = unique((video.topics || []).map(formatTopicLabel).filter(isUsefulExcerptTopic));
  const shortTopics = cleanTopics.filter((topic) => topic.length <= 34);
  const specificTopics = shortTopics.filter(isSpecificExcerptTopic);

  if (specificTopics.length >= 2) {
    return `${specificTopics[0]} flows into ${specificTopics[1]} with ${laneLabel.toLowerCase()}-friendly ${techniqueLabel.toLowerCase()} coaching and controlled resets.`;
  }

  if (specificTopics.length === 1 && /\s/.test(specificTopics[0])) {
    return `${toSentenceCase(specificTopics[0])} is taught with ${laneLabel.toLowerCase()}-friendly pacing and a clear ${techniqueLabel.toLowerCase()} focus.`;
  }

  return `${laneAudience} students can use this clip to preview ${techniqueLabel.toLowerCase()} instruction, safety cues, and class pacing before training.`;
};

const renderMasterHubIntro = () => {
  return `<div class="card prose ss-video-intro mb-4">
        <h2>How to use the BJJ video library</h2>
        <p>This page is for people who want a practical preview of class, not an endless scroll of disconnected clips. Start with your lane, then narrow by topic. If you are brand new, begin with safety, posture, breakfalls, escapes, and simple positions before you chase a finish.</p>
        <p>The fastest way to make this library useful is to watch one clip with one question in mind. Ask what the coach wants first: hand position, balance, breathing, partner care, or the reset after the rep. Those details make class feel less random when you walk in.</p>

        <h3>Best starting points for beginners</h3>
        <p>Adult beginners usually do best with <a href="/videos/adults">Adults</a>, then <a href="/videos/escapes">Escapes</a>, <a href="/videos/positioning">Positioning</a>, and <a href="/videos/breakfalls">Breakfalls</a>. Parents comparing programs should start with <a href="/videos/kids">Kids</a> or <a href="/videos/teens">Teens</a> and watch for pacing, partner matching, and whether the room looks calm enough to learn in.</p>

        <h3>Short topic guide</h3>
        <p><a href="/videos/breakfalls">Breakfalls</a> show how students land and stand up safely. <a href="/videos/takedowns">Takedowns</a> show entries, balance, and responsible finishes. <a href="/videos/guard-passing">Guard Passing</a> shows how top players solve legs and frames. <a href="/videos/escapes">Escapes</a> help nervous beginners understand how to get safe again. <a href="/videos/submissions">Submissions</a> show why control comes before the finish. <a href="/videos/positioning">Positioning</a> explains where the body should go before the technique makes sense.</p>

        <h3>How kids, teens, and adults use the library differently</h3>
        <p>Kids clips are best used by parents looking for structure, safety language, and confidence-building. Teens clips are useful for families who want challenge without chaos. Adult clips are usually about understanding pace, posture, and whether the class looks sustainable for a beginner or a returning hobbyist.</p>

        <h3>Use the glossary with the videos</h3>
        <p>If a title uses a word you do not know, open the <a href="/bjj-glossary">BJJ glossary</a> and learn enough to follow the next rep. Terms like <a href="/bjj-glossary/base">base</a>, <a href="/bjj-glossary/posture">posture</a>, <a href="/bjj-glossary/frame">frame</a>, <a href="/bjj-glossary/guard">guard</a>, and <a href="/bjj-glossary/tap">tap</a> matter more than memorizing a long list of advanced names.</p>

        <h3>A simple beginner path</h3>
        <p>Start with one lane page, then one safety-heavy topic page, then one clip from the filtered grid below. After that, check the <a href="/schedule">schedule</a> or <a href="/book-free-intro">book a free intro</a>. The goal is to arrive less uncertain, not to self-coach an entire first month from video.</p>

        <h3>FAQ</h3>
        <p><strong>Can I learn BJJ from this page alone?</strong> No. The library is for preview and review; live coaching still matters most. <strong>Which clip should I watch first?</strong> Watch the title that matches the question you already have. <strong>What if I do not know the terms?</strong> Use the glossary for the important words, then come back here. <strong>What is the next step if the coaching style looks like a fit?</strong> Check the program pages or schedule and try class in person.</p>
      </div>`;
};

const renderFilteredHubCards = (videos) => {
  return videos
    .map((video) => {
      const programLabel = PROGRAM_MAP.get(video.primaryProgramHub)?.label || "Adults";
      const techniqueLabel = TECHNIQUE_MAP.get(video.primaryTechniqueHub)?.label || "Submissions";
      const laneValue = escapeHtml(video.primaryProgramHub || "adults");
      const topicValue = escapeHtml(video.primaryTechniqueHub || "submissions");
      const alt = `${programLabel} ${techniqueLabel} lesson thumbnail`;
      const hubCardTitle = toHubCardTitle(video.displayTitle);
      const excerpt = buildVideoCardExcerpt(video);
      return `<div class="col-12 col-md-6 col-xl-4 ss-video-card-wrap" data-lane="${laneValue}" data-topic="${topicValue}">
            <article class="card h-100 shadow-sm border-0 ss-video-card">
              <a href="${video.path}" class="ss-video-thumb">
                <img src="${escapeHtml(video.imageUrl)}" class="card-img-top" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" width="1280" height="720">
              </a>
              <div class="card-body d-flex flex-column">
                <div class="d-flex flex-wrap gap-2 mb-2">
                  <span class="badge rounded-pill text-bg-light ss-video-pill">${escapeHtml(programLabel)}</span>
                  <span class="badge rounded-pill text-bg-light ss-video-pill">${escapeHtml(techniqueLabel)}</span>
                </div>
                <h3 class="h5 card-title ss-video-title mb-3">
                  <a href="${video.path}" class="stretched-link text-decoration-none text-reset">${escapeHtml(hubCardTitle)}</a>
                </h3>
                <p class="ss-video-excerpt mb-3">${escapeHtml(excerpt)}</p>
                <a href="${video.path}" class="ss-video-cta mt-auto">Watch lesson</a>
              </div>
            </article>
          </div>`;
    })
    .join("\n          ");
};

const renderCollectionGraph = ({ name, canonicalPath, videos }) => {
  const localBusinessGraphNode = { ...localBusinessJson };
  delete localBusinessGraphNode['@context'];
  const listElements = videos.slice(0, 20).map((video, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: toAbsoluteUrl(video.path)
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${toAbsoluteUrl(canonicalPath)}#collection`,
        url: toAbsoluteUrl(canonicalPath),
        name
      },
      {
        "@type": "ItemList",
        "@id": `${toAbsoluteUrl(canonicalPath)}#video-list`,
        name: `${name} - video list`,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: videos.length,
        itemListElement: listElements
      },
      localBusinessGraphNode
    ]
  };
};

const buildHubPage = ({ canonicalPath, pageTitle, heading, description, credibilityCue = "", videos, breadcrumbName, filteredNavigation = false }) => {
  const graph = renderCollectionGraph({ name: heading, canonicalPath, videos });
  const hubCanonicalUrl = toAbsoluteUrl(canonicalPath);
  const escapedTitle = escapeHtml(pageTitle);
  const escapedDescription = escapeHtml(description);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapedTitle}</title>
  <meta name="description" content="${escapedDescription}" />
  <link rel="canonical" href="${hubCanonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${SITE_TITLE}" />
  <meta property="og:url" content="${hubCanonicalUrl}" />
  <meta property="og:title" content="${escapedTitle}" />
  <meta property="og:description" content="${escapedDescription}" />
  <meta property="og:image" content="${SOCIAL_IMAGE_URL}" />
  <meta property="og:image:alt" content="${SOCIAL_IMAGE_ALT}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@SenseiSandyBJJ" />
  <meta name="twitter:creator" content="@SenseiSandyBJJ" />
  <meta name="twitter:title" content="${escapedTitle}" />
  <meta name="twitter:description" content="${escapedDescription}" />
  <meta name="twitter:image" content="${SOCIAL_IMAGE_URL}" />
  <meta name="twitter:image:alt" content="${SOCIAL_IMAGE_ALT}" />
  <meta name="twitter:url" content="${hubCanonicalUrl}" />
  <meta name="robots" content="index, follow" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="/assets/css/ss.min.css?v=20260219" />
  <link rel="stylesheet" href="/assets/css/videos.css" />
  <script type="application/ld+json">
${JSON.stringify(graph, null, 2)}
  </script>
${ANALYTICS_HEAD_INCLUDE}
  ${filteredNavigation ? '<script defer src="/js/videos-hub-filters.js"></script>' : ""}
</head>
<body class="lane-mixed page-videos-hub">

<!--#include virtual="/nav-include.html" -->

<main id="main-content" role="main" class="ss-main page-videos-index">
  <section class="section video-hero">
    <div class="container">
      <nav aria-label="Breadcrumb" class="small mb-3">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item"><a href="/">Home</a></li>
          <li class="breadcrumb-item"><a href="${MASTER_VIDEO_HUB_PATH}">Videos</a></li>
          <li class="breadcrumb-item active" aria-current="page">${escapeHtml(breadcrumbName)}</li>
        </ol>
      </nav>
      <p class="eyebrow">Videos</p>
      <h1>${escapeHtml(filteredNavigation ? "Find a video by lane or topic" : heading)}</h1>
      <p class="lede">${escapeHtml(filteredNavigation ? "Start with your lane, then narrow by topic. Fewer titles show at once so the page stays easy to scan." : description)}</p>
      ${credibilityCue ? `<p class="small text-muted mb-3">${escapeHtml(credibilityCue)} <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4555620/" rel="noopener" target="_blank">Source</a></p>` : ""}
      ${filteredNavigation ? "" : `<div class="card prose">
${renderHubNav()}
      </div>`}
    </div>
  </section>

  <section class="section ${filteredNavigation ? "ss-videos-hub py-5" : ""}">
    <div class="container">
      ${filteredNavigation
        ? `${renderMasterHubIntro()}

      <div class="ss-video-filters mx-auto mb-4">
        <div class="ss-filter-block mb-3">
          <div class="ss-filter-label">Lane</div>
          <div class="ss-chip-row" id="ssLaneFilters" role="tablist" aria-label="Filter videos by lane">
            <button class="ss-chip is-active" type="button" data-filter-group="lane" data-filter-value="all" aria-pressed="true">All</button>
            <button class="ss-chip" type="button" data-filter-group="lane" data-filter-value="kids" aria-pressed="false">Kids</button>
            <button class="ss-chip" type="button" data-filter-group="lane" data-filter-value="teens" aria-pressed="false">Teens</button>
            <button class="ss-chip" type="button" data-filter-group="lane" data-filter-value="adults" aria-pressed="false">Adults</button>
          </div>
        </div>

        <div class="ss-filter-block">
          <div class="ss-filter-label">Topic</div>
          <div class="ss-chip-row" id="ssTopicFilters" role="tablist" aria-label="Filter videos by topic">
            <button class="ss-chip is-active" type="button" data-filter-group="topic" data-filter-value="all" aria-pressed="true">All topics</button>
            <button class="ss-chip" type="button" data-filter-group="topic" data-filter-value="breakfalls" aria-pressed="false">Breakfalls</button>
            <button class="ss-chip" type="button" data-filter-group="topic" data-filter-value="takedowns" aria-pressed="false">Takedowns</button>
            <button class="ss-chip" type="button" data-filter-group="topic" data-filter-value="guard-passing" aria-pressed="false">Guard Passing</button>
            <button class="ss-chip" type="button" data-filter-group="topic" data-filter-value="escapes" aria-pressed="false">Escapes</button>
            <button class="ss-chip" type="button" data-filter-group="topic" data-filter-value="submissions" aria-pressed="false">Submissions</button>
            <button class="ss-chip" type="button" data-filter-group="topic" data-filter-value="self-defense" aria-pressed="false">Self-Defense</button>
            <button class="ss-chip" type="button" data-filter-group="topic" data-filter-value="positioning" aria-pressed="false">Positioning</button>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-center mb-3">
        <div class="small text-muted" id="ssVideoResultsText" aria-live="polite">Showing all videos</div>
      </div>

      <div class="row g-4" id="ssVideoGrid">
          ${renderFilteredHubCards(videos)}
      </div>

      <div class="text-center mt-4">
        <button type="button" class="btn btn-dark px-4 ss-show-more-btn" id="ssShowMoreVideos">Show more</button>
      </div>`
        : `<div class="card prose">
        <h2 class="h5 mb-3">Video pages in this hub</h2>
        <div class="video-grid">
          ${renderVideoListItems(videos)}
        </div>
      </div>
      ${renderHubGuide({ canonicalPath, heading, description, videos })}`}
      </div>
  </section>

</main>

<!--#include virtual="/footer-include.html" -->

</body>
</html>
`;
};

const renderBreadcrumbListJson = (video, programHub, techniqueHub) => {
  const items = [
    { name: "Home", item: `${SITE_ORIGIN}/` },
    { name: "Videos", item: `${SITE_ORIGIN}${MASTER_VIDEO_HUB_PATH}` },
    { name: programHub.label, item: `${SITE_ORIGIN}${programHub.path}` },
    { name: techniqueHub.label, item: `${SITE_ORIGIN}${techniqueHub.path}` },
    { name: video.h1Title, item: `${SITE_ORIGIN}${video.path}` }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item
    }))
  };
};

const buildVideoObjectJson = (video) => {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.rawTitle,
    description: video.description,
    thumbnailUrl: [video.imageUrl],
    uploadDate: video.published || "",
    embedUrl: video.embedUrl,
    contentUrl: video.youtubeUrl,
    url: toAbsoluteUrl(video.path),
    mainEntityOfPage: toAbsoluteUrl(video.path),
    isPartOf: {
      "@type": "CollectionPage",
      "@id": `${SITE_ORIGIN}${MASTER_VIDEO_HUB_PATH}#collection`,
      url: `${SITE_ORIGIN}${MASTER_VIDEO_HUB_PATH}`,
      name: "Sensei Sandy BJJ Video Library"
    },
    about: {
      "@id": "https://senseisandy.com/#localbusiness"
    },
    publisher: {
      "@type": "Organization",
      name: "Sensei Sandy BJJ",
      url: "https://senseisandy.com/",
      logo: {
        "@type": "ImageObject",
        url: "https://senseisandy.com/assets/images/sslogowhitebckgrnd.webp"
      }
    }
  };
};

const renderRelatedVideoLinks = (videos) => {
  return videos
    .map((item) => `<li><a href="${item.path}">${escapeHtml(item.displayTitle)}</a></li>`)
    .join("\n              ");
};

const CLASS_PAGE_BY_PROGRAM = {
  kids: "/kids",
  teens: "/teen-jiu-jitsu-tannersville-ny",
  adults: "/adult-bjj"
};

const toGuideLabel = (href) => {
  const slug = String(href || "")
    .split("/")
    .filter(Boolean)
    .pop() || "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
};

const pickGuideLinks = (video) => {
  const byProgram = relatedGuides?.byProgram?.[video.primaryProgramHub] || [];
  const byTechnique = relatedGuides?.byTechnique?.[video.primaryTechniqueHub] || [];
  const merged = unique([...(byTechnique || []), ...(byProgram || [])])
    .filter((href) => typeof href === "string" && href.startsWith("/blog/"));
  return merged.slice(0, 3);
};

const renderGuideLinks = (links) => {
  return links
    .map(
      (href) =>
        `<a href="${href}"><span>${escapeHtml(toGuideLabel(href))}</span></a>`
    )
    .join("\n              ");
};

const buildWatchPage = ({ video, relatedVideos, prevVideo, nextVideo }) => {
  const primaryProgram = PROGRAM_MAP.get(video.primaryProgramHub) || PROGRAM_MAP.get("adults");
  const primaryTechnique = TECHNIQUE_MAP.get(video.primaryTechniqueHub) || TECHNIQUE_MAP.get("submissions");
  const audience = laneToAudience(video.lane, video.rawTitle);
  const location = detectLocation(video.rawTitle);
  const [summaryFirst, summarySecond] = buildSummary({
    title: video.displayTitle,
    topics: video.topics,
    audience,
    location
  });
  const takeaways = buildTakeaways(video.topics);
  const guideLinks = pickGuideLinks(video);
  const classPath = CLASS_PAGE_BY_PROGRAM[video.primaryProgramHub] || "/adult-bjj";
  const classLabel = PROGRAM_MAP.get(video.primaryProgramHub)?.label || "Adults";
  const chipLabels = unique([primaryProgram.label, primaryTechnique.label, location]);

  const videoObjectJson = buildVideoObjectJson(video);
  const breadcrumbJson = renderBreadcrumbListJson(video, primaryProgram, primaryTechnique);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(video.titleTag)}</title>
  <meta name="description" content="${escapeHtml(video.description)}" />
  <link rel="canonical" href="${toAbsoluteUrl(video.path)}" />
  <meta property="og:title" content="${escapeHtml(video.titleTag)}" />
  <meta property="og:description" content="${escapeHtml(video.description)}" />
  <meta property="og:type" content="video.other" />
  <meta property="og:url" content="${toAbsoluteUrl(video.path)}" />
  <meta property="og:image" content="${escapeHtml(video.imageUrl)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@SenseiSandyBJJ" />
  <meta name="twitter:title" content="${escapeHtml(video.titleTag)}" />
  <meta name="twitter:description" content="${escapeHtml(video.description)}" />
  <meta name="twitter:image" content="${escapeHtml(video.imageUrl)}" />
  <meta name="twitter:url" content="${toAbsoluteUrl(video.path)}" />
  <meta name="robots" content="index, follow" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="/assets/css/ss.min.css?v=20260219" />
  <link rel="stylesheet" href="/assets/css/videos.css" />
  <script type="application/ld+json">
${JSON.stringify(videoObjectJson, null, 2)}
  </script>
  <script type="application/ld+json">
${JSON.stringify(breadcrumbJson, null, 2)}
  </script>
${ANALYTICS_HEAD_INCLUDE}
</head>
<body class="lane-mixed page-video-watch">

<!--#include virtual="/nav-include.html" -->

<main id="main-content" role="main" class="ss-main page-video-detail">
  <section class="section video-hero">
    <div class="container">
      <nav aria-label="Breadcrumb" class="small mb-3">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item"><a href="/">Home</a></li>
          <li class="breadcrumb-item"><a href="${MASTER_VIDEO_HUB_PATH}">Videos</a></li>
          <li class="breadcrumb-item"><a href="${primaryProgram.path}">${escapeHtml(primaryProgram.label)}</a></li>
          <li class="breadcrumb-item"><a href="${primaryTechnique.path}">${escapeHtml(primaryTechnique.label)}</a></li>
          <li class="breadcrumb-item active" aria-current="page">${escapeHtml(video.h1Title)}</li>
        </ol>
      </nav>
      <p class="eyebrow">Video</p>
      <h1>${escapeHtml(video.h1Title)}</h1>
      <p class="lede">${escapeHtml(video.description)}</p>
      <div class="cta-row">
        <a class="btn btn-primary" data-cta-target="intro"><span data-cta-text></span></a>
        <a class="btn" href="${MASTER_VIDEO_HUB_PATH}">Back to all videos</a>
      </div>
      <div class="chips" aria-label="Video tags">
        ${chipLabels.map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="video-layout">
        <div>
          <div class="video-frame">
           <div class="ss-video-facade ss-video-facade--16-9" data-video-id="${video.id}" data-video-title="${escapeHtml(video.rawTitle)}">
             <img src="${video.imageUrl}" alt="${escapeHtml(video.rawTitle)} thumbnail" loading="lazy" decoding="async" width="1280" height="720">
             <div class="ss-video-facade__play"></div>
           </div>
          </div>
          <div class="card prose">
            <h2>Video summary</h2>
            <p>${escapeHtml(summaryFirst)}</p>
            <p>${escapeHtml(summarySecond)}</p>
            <h3>Key takeaways</h3>
            <ul>
              ${takeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n              ")}
            </ul>
            <h3>Who this is for</h3>
            <p>
              Best for ${escapeHtml(audience)} looking for a clear preview of training in ${escapeHtml(location)}.
              Use this to picture the room, coaching style, and the way we keep class approachable.
            </p>
          </div>
        </div>

        <aside>
          <div class="card">
            <h3>Series navigation</h3>
            <div class="cta-row">
              ${prevVideo ? `<a class="btn" href="${prevVideo.path}">Previous in ${escapeHtml(primaryProgram.shortLabel)}</a>` : ""}
              ${nextVideo ? `<a class="btn" href="${nextVideo.path}">Next in ${escapeHtml(primaryProgram.shortLabel)}</a>` : ""}
              <a class="btn" href="${primaryProgram.path}">View all ${escapeHtml(primaryProgram.label)} videos</a>
            </div>
          </div>

          <div class="card">
            <h3>Helpful links</h3>
            <div class="link-list">
              <a href="/schedule">Class schedule</a>
              <a href="/book-free-intro">Book a free intro</a>
              <a href="${classPath}">${escapeHtml(classLabel)} class page</a>
              <a href="${primaryProgram.path}">${escapeHtml(primaryProgram.label)} video hub</a>
              <a href="${primaryTechnique.path}">${escapeHtml(primaryTechnique.label)} video hub</a>
              <a href="/blog/how-to-fall-safely-bjj-breakfalls">Breakfalls guide</a>
              <a href="/blog/exactly-what-happens-first-bjj-class-minute-by-minute">Your first class</a>
            </div>
          </div>

          <div class="card cta-panel">
            <h3>Want to visit?</h3>
            <p>Start with a Free Intro and see the mats in person.</p>
            <div class="cta-row">
              <a class="btn btn-primary" data-cta-target="intro"><span data-cta-text></span></a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h2>Watch related videos</h2>
      <div class="related-grid">
              ${relatedVideos
                .map((item) => {
                  const programLabel = PROGRAM_MAP.get(item.primaryProgramHub)?.label || "Adults";
                  const techniqueLabel = TECHNIQUE_MAP.get(item.primaryTechniqueHub)?.label || "Submissions";
                  return `<a class="video-card" href="${item.path}">
                <p class="video-card-title">${escapeHtml(item.displayTitle)}</p>
                <p class="video-card-meta">${escapeHtml(programLabel)} lane • ${escapeHtml(techniqueLabel)}</p>
              </a>`;
                })
                .join("\n              ")}
      </div>
    </div>
  </section>

  ${guideLinks.length
    ? `<section class="section">
    <div class="container">
      <div class="card">
        <h3>Related blog guides</h3>
        <div class="link-list">
              ${renderGuideLinks(guideLinks)}
        </div>
      </div>
    </div>
  </section>`
    : ""}

</main>

<!--#include virtual="/footer-include.html" -->

</body>
</html>
`;
};

const renderFeaturedPartial = ({ heading, intro }) => {
  const rows = [
    `<li class="mb-2"><a href="${MASTER_VIDEO_HUB_PATH}">All videos hub</a><span class="small text-muted"> (Master index)</span></li>`,
    '<li class="mb-2"><a href="/videos/kids">Kids videos hub</a><span class="small text-muted"> (Program)</span></li>',
    '<li class="mb-2"><a href="/videos/teens">Teens videos hub</a><span class="small text-muted"> (Program)</span></li>',
    '<li class="mb-2"><a href="/videos/adults">Adults videos hub</a><span class="small text-muted"> (Program)</span></li>'
  ].join("\n        ");

  return `<section class="py-4 border-top border-bottom bg-light" aria-label="Featured videos">
  <div class="container" style="max-width: 960px;">
    <h2 class="h5 mb-2">${escapeHtml(heading)}</h2>
    <p class="small text-muted mb-3">${escapeHtml(intro)}</p>
    <ul class="mb-0">
        ${rows}
    </ul>
    <p class="small mb-0 mt-2"><a href="${MASTER_VIDEO_HUB_PATH}">Browse all video hubs</a></p>
  </div>
</section>
`;
};

const createVideoModel = () => {
  const modeled = [];
  const redirectPairs = [];
  for (const sourceVideo of sourceVideos) {
    const videoId = getVideoId(sourceVideo);
    if (!videoId) continue;

    const override = overrides?.[videoId] || {};
    if (override.archived) continue;

    const rawTitle = sourceVideo.title || "Sensei Sandy BJJ Video";
    const displayTitle = compactVideoTitle(rawTitle) || rawTitle;
    const seoTitle = String(override.seoTitle || "").trim() || displayTitle;
    const h1Title = String(override.h1 || "").trim() || displayTitle;
    const customSlug = String(override.slug || "").trim();
    const slugData = buildVideoSlug({
      videoId,
      title: rawTitle,
      overrideSlug: customSlug
    });
    if (slugData.warning) {
      console.warn(`[videos] ${videoId}: ${slugData.warning}`);
    }
    const slug = slugData.slug;
    const pathValue = `/videos/${slug}`;
    const rawSlugId = String(videoId || "").replace(/_/g, "-");
    const mixedCaseVariantPath = `/videos/${slugData.keywordPart}-${rawSlugId}`;
    if (mixedCaseVariantPath !== pathValue) {
      redirectPairs.push([mixedCaseVariantPath, pathValue]);
    }
    const existingSlug = existingSlugById.get(slugData.slugId);
    if (existingSlug && existingSlug !== slug) {
      redirectPairs.push([`/videos/${existingSlug}`, pathValue]);
    }

    const rawDescription = String(override.metaDescription || "").trim() || buildDefaultDescription(rawTitle);
    const description = clampDescription(rawDescription);
    const rawImage = String(sourceVideo.thumb || "").trim() || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const imageUrl = /^https?:\/\//.test(rawImage)
      ? rawImage
      : `${SITE_ORIGIN}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;

    const topics = extractTopics(rawTitle);
    const lane = normalizeLane(override.lane || sourceVideo.lane);
    const programHubs = classifyProgramHubs({ video: sourceVideo, override });
    const techniqueHubs = classifyTechniqueHubs({ video: sourceVideo, override, topics });

    const rawTags = normalizeTokens([...(sourceVideo.tags || []), ...(override.tags || [])]);
    const noindex = false;

    modeled.push({
      id: videoId,
      slug,
      path: pathValue,
      rawTitle,
      displayTitle,
      seoTitle,
      h1Title,
      titleTag: buildTitleTag(seoTitle),
      description,
      imageUrl,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`,
      published: sourceVideo.published || "",
      lane,
      tags: rawTags,
      noindex,
      topics,
      programHubs,
      techniqueHubs,
      primaryProgramHub: programHubs[0],
      primaryTechniqueHub: techniqueHubs[0],
      playlistIndex: Number(sourceVideo.playlistIndex || sourceVideo.position || Number.MAX_SAFE_INTEGER)
    });
  }

  return {
    videos: modeled.sort(sortByPlaylist),
    redirectPairs
  };
};

const { videos: videosByOrder, redirectPairs } = createVideoModel();

const programBuckets = new Map(PROGRAM_HUBS.map((hub) => [hub.slug, []]));
const techniqueBuckets = new Map(TECHNIQUE_HUBS.map((hub) => [hub.slug, []]));

for (const video of videosByOrder) {
  for (const slug of video.programHubs) {
    if (programBuckets.has(slug)) programBuckets.get(slug).push(video);
  }
  for (const slug of video.techniqueHubs) {
    if (techniqueBuckets.has(slug)) techniqueBuckets.get(slug).push(video);
  }
}

for (const hubVideos of [...programBuckets.values(), ...techniqueBuckets.values()]) {
  hubVideos.sort(sortByPlaylist);
}

const pickRelatedVideos = (video) => {
  const picks = [];
  const add = (items) => {
    for (const item of items || []) {
      if (!item || item.slug === video.slug) continue;
      if (picks.some((existing) => existing.slug === item.slug)) continue;
      picks.push(item);
      if (picks.length >= 4) return;
    }
  };

  add(techniqueBuckets.get(video.primaryTechniqueHub));
  add(programBuckets.get(video.primaryProgramHub));
  add(videosByOrder);

  return picks.slice(0, 4);
};

const getSeriesNav = (video) => {
  const series = programBuckets.get(video.primaryProgramHub) || [];
  const index = series.findIndex((item) => item.slug === video.slug);
  const prevVideo = index > 0 ? series[index - 1] : null;
  const nextVideo = index >= 0 && index < series.length - 1 ? series[index + 1] : null;
  return { prevVideo, nextVideo };
};

await fs.mkdir(videosDir, { recursive: true });
const existingEntries = await fs.readdir(videosDir, { withFileTypes: true });
for (const entry of existingEntries) {
  if (!entry.isFile()) continue;
  if (!entry.name.endsWith(".html")) continue;
  await fs.unlink(path.join(videosDir, entry.name));
}

for (const video of videosByOrder) {
  const relatedVideos = pickRelatedVideos(video);
  const { prevVideo, nextVideo } = getSeriesNav(video);
  const html = buildWatchPage({ video, relatedVideos, prevVideo, nextVideo });
  await fs.writeFile(path.join(videosDir, `${video.slug}.html`), html, "utf8");
}

const masterHubHtml = buildHubPage({
  canonicalPath: MASTER_VIDEO_HUB_PATH,
  pageTitle: "BJJ Videos in Tannersville NY | Sensei Sandy BJJ",
  heading: "Sensei Sandy BJJ Video Library",
  breadcrumbName: "All Videos",
  description:
    "Browse Sensei Sandy BJJ's video library with beginner-friendly lessons for kids, teens, and adults, including fundamentals, drills, and calm coaching.",
  videos: [...videosByOrder].sort(sortByNewestThenPlaylist),
  filteredNavigation: true
});
await fs.writeFile(path.join(videosDir, "index.html"), masterHubHtml, "utf8");

for (const hub of PROGRAM_HUBS) {
  const html = buildHubPage({
    canonicalPath: hub.path,
    pageTitle: hub.pageTitle,
    heading: hub.heading,
    breadcrumbName: hub.label,
    description: hub.description,
    credibilityCue: hub.credibilityCue,
    videos: programBuckets.get(hub.slug) || []
  });
  await fs.writeFile(path.join(videosDir, `${hub.slug}.html`), html, "utf8");
}

for (const hub of TECHNIQUE_HUBS) {
  const html = buildHubPage({
    canonicalPath: hub.path,
    pageTitle: hub.pageTitle,
    heading: hub.heading,
    breadcrumbName: hub.label,
    description: hub.description,
    videos: techniqueBuckets.get(hub.slug) || []
  });
  await fs.writeFile(path.join(videosDir, `${hub.slug}.html`), html, "utf8");
}

await fs.mkdir(partialsDir, { recursive: true });
for (const config of FEATURED_PARTIAL_CONFIG) {
  const partialHtml = renderFeaturedPartial({
    heading: config.heading,
    intro: config.intro
  });
  await fs.writeFile(path.join(partialsDir, config.file), partialHtml, "utf8");
}

let legacyRedirectConfig = { version: 1, redirects: {} };
try {
  legacyRedirectConfig = JSON.parse(await fs.readFile(legacyRedirectsPath, "utf8"));
} catch {
  legacyRedirectConfig = { version: 1, redirects: {} };
}
if (!legacyRedirectConfig || typeof legacyRedirectConfig !== "object") {
  legacyRedirectConfig = { version: 1, redirects: {} };
}
if (!legacyRedirectConfig.redirects || typeof legacyRedirectConfig.redirects !== "object") {
  legacyRedirectConfig.redirects = {};
}

const redirects = legacyRedirectConfig.redirects;
const canonicalVideoPaths = new Set(videosByOrder.map((video) => video.path));
for (const canonicalPath of canonicalVideoPaths) {
  delete redirects[canonicalPath];
}
for (const [sourcePath, targetPath] of redirectPairs) {
  if (!sourcePath || !targetPath || sourcePath === targetPath) continue;
  redirects[sourcePath] = targetPath;
}

const resolveRedirectTarget = (sourcePath) => {
  let targetPath = redirects[sourcePath];
  if (!targetPath) return "";
  const seen = new Set([sourcePath]);
  while (redirects[targetPath] && !seen.has(targetPath)) {
    seen.add(targetPath);
    targetPath = redirects[targetPath];
  }
  return targetPath;
};

for (const sourcePath of Object.keys(redirects)) {
  const finalTarget = resolveRedirectTarget(sourcePath);
  if (!finalTarget || sourcePath === finalTarget) continue;
  redirects[sourcePath] = finalTarget;
}

const orderedRedirects = Object.fromEntries(
  Object.entries(redirects).sort((a, b) => a[0].localeCompare(b[0]))
);
legacyRedirectConfig.redirects = orderedRedirects;
await fs.writeFile(`${legacyRedirectsPath}`, `${JSON.stringify(legacyRedirectConfig, null, 2)}\n`, "utf8");

console.log(`Wrote ${videosByOrder.length} watch pages to ${videosDir}`);
console.log("Wrote 10 hub pages to /videos (master + program + technique)");
console.log(`Wrote ${FEATURED_PARTIAL_CONFIG.length} featured video partials to ${partialsDir}`);
