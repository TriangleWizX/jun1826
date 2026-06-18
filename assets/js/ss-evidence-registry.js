/* assets/js/ss-evidence-registry.js */

window.SS_EVIDENCE_REGISTRY = {
  meta: {
    brand: "Sensei Sandy BJJ",
    lastChecked: "2026-05-13",
    purpose: "Consolidated Evidence Links for global accordion (Offer -> Proof -> CTA)",
    standard: "Notion Rollout Plan (May 2026)"
  },

  sources: {
    "cdc-kids-benefits": {
      title: "CDC: Health Benefits of Physical Activity for Children",
      url: "https://www.cdc.gov/physical-activity-basics/health-benefits/children.html",
      publisher: "Centers for Disease Control and Prevention",
      fact: "Physical activity supports children’s academic performance, brain health, muscular fitness, heart and lung health, and bone strength.",
      bestFor: ["kids", "after-school", "student-hub"]
    },
    "cdc-youth-activity-guidelines": {
      title: "CDC: Physical Activity Guidelines for School-Aged Children",
      url: "https://www.cdc.gov/physical-activity-education/guidelines/index.html",
      publisher: "Centers for Disease Control and Prevention",
      fact: "Children and adolescents ages 6 to 17 should get 60 minutes or more of moderate-to-vigorous physical activity daily.",
      bestFor: ["kids", "teens", "after-school"]
    },
    "aap-martial-arts-safety": {
      title: "AAP: Martial Arts Patient Education Handout",
      url: "https://www.aap.org/globalassets/publications/coya/martial-arts.1.0.pdf",
      publisher: "American Academy of Pediatrics",
      fact: "AAP notes martial arts can help children build focus, motor skills, self-confidence, discipline, respect, and social skills when taught safely.",
      bestFor: ["kids", "teens", "after-school"]
    },
    "hhs-youth-sports-strategy": {
      title: "HHS: National Youth Sports Strategy",
      url: "https://odphp.health.gov/sites/default/files/2020-09/YSS_Report_OnePager_2020-08-31_web.pdf",
      publisher: "U.S. Department of Health and Human Services",
      fact: "Youth sports can support physical, mental, emotional, and social benefits when taught in a safe, inclusive environment.",
      bestFor: ["kids", "after-school"]
    },
    "cdc-school-connectedness": {
      title: "CDC: School Connectedness Helps Students Thrive",
      url: "https://www.cdc.gov/youth-behavior/school-connectedness/index.html",
      publisher: "Centers for Disease Control and Prevention",
      fact: "Connectedness has long-lasting effects on youth health and well-being.",
      bestFor: ["teens", "student-hub"]
    },
    "cdc-adolescent-mental-health": {
      title: "CDC: Adolescent Mental Health",
      url: "https://www.cdc.gov/healthy-youth/mental-health/index.html",
      publisher: "Centers for Disease Control and Prevention",
      fact: "Protective relationships and strong bonds can support adolescent mental health.",
      bestFor: ["teens", "student-hub"]
    },
    "hhs-youth-sports-mental-health": {
      title: "HHS: Youth Sports Mental Health Resource",
      url: "https://health.gov/sites/default/files/2024-03/Youth_Sports_Mental_Health.pdf",
      publisher: "U.S. Department of Health and Human Services",
      fact: "Youth sports can support mental, emotional, and social health when the environment is positive and structured.",
      bestFor: ["teens"]
    },
    "hhs-social-connection-advisory": {
      title: "U.S. Surgeon General: Social Connection Advisory",
      url: "https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf",
      publisher: "U.S. Department of Health and Human Services",
      fact: "Social connection is a public health priority, not a soft extra.",
      bestFor: ["teens", "adult-bjj", "student-hub"]
    },
    "cdc-adult-benefits": {
      title: "CDC: Health Benefits of Physical Activity for Adults",
      url: "https://www.cdc.gov/physical-activity-basics/benefits/index.html",
      publisher: "Centers for Disease Control and Prevention",
      fact: "Physical activity can help adults feel better, function better, and sleep better.",
      bestFor: ["adult-bjj", "student-hub"]
    },
    "cdc-adult-guidelines": {
      title: "CDC: Adult Physical Activity Guidelines",
      url: "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html",
      publisher: "Centers for Disease Control and Prevention",
      fact: "Adults need 150 minutes of moderate-intensity activity each week plus at least 2 days of muscle-strengthening activity.",
      bestFor: ["adult-bjj"]
    },
    "nih-nia-exercise-benefits": {
      title: "NIH/NIA: Health Benefits of Exercise and Physical Activity",
      url: "https://www.nia.nih.gov/health/exercise-and-physical-activity/health-benefits-exercise-and-physical-activity",
      publisher: "National Institute on Aging",
      fact: "Physical activity can help reduce feelings of depression and anxiety, improve sleep, and support emotional well-being.",
      bestFor: ["adult-bjj"]
    },
    "cdc-active-people": {
      title: "CDC: Active People, Healthy Nation",
      url: "https://www.cdc.gov/physical-activity/activepeoplehealthynation/index.html",
      publisher: "Centers for Disease Control and Prevention",
      fact: "Regular movement supports better sleep, thinking, learning, and emotional health.",
      bestFor: ["adult-bjj", "student-hub"]
    },
    "nij-deescalation-training": {
      title: "NIJ: De-Escalation Training for Law Enforcement",
      url: "https://nij.ojp.gov/topics/articles/what-works-de-escalation-training",
      publisher: "National Institute of Justice",
      fact: "De-escalation training is designed to help officers slow down, communicate, and create safer outcomes.",
      bestFor: ["law-enforcement-bjj"]
    },
    "perf-icat-guide": {
      title: "PERF: ICAT Training Guide",
      url: "https://www.policeforum.org/assets/icattrainingguide.pdf",
      publisher: "Police Executive Research Forum",
      fact: "A rigorous ICAT evaluation found reductions in overall use of force and injuries to officers and members of the public.",
      bestFor: ["law-enforcement-bjj"]
    },
    "doj-cops-procedural-justice": {
      title: "DOJ COPS: Procedural Justice",
      url: "https://portal.cops.usdoj.gov/resourcecenter/ric/publications/cops-w0795-pub.pdf",
      publisher: "Office of Community Oriented Policing Services",
      fact: "BJJ should be framed as a physical control layer that supports communication and decision-making, not as a replacement for de-escalation.",
      bestFor: ["law-enforcement-bjj"]
    },
    "marietta-police-bjj-data": {
      title: "Marietta Police: BJJ Training Data",
      url: "https://www.mariettaga.gov/CivicAlerts.asp?AID=3116",
      publisher: "Marietta Police Department",
      fact: "Marietta Police Department reported that officers participating in BJJ training saw fewer officer injuries, fewer injuries to arrested people, and less Taser use than non-participating coworkers in its 2020 comparison.",
      bestFor: ["law-enforcement-bjj"]
    },
    "marietta-chief-flynn-article": {
      title: "Chief Dan Flynn: Brazilian Jiu-Jitsu: The Future of Policing",
      url: "https://www.mariettaga.gov/DocumentCenter/View/11626",
      publisher: "Marietta Police Department",
      fact: "Chief Dan Flynn explains that Jiu-Jitsu emphasizes leverage, body weight, and hip control instead of relying primarily on blunt force or striking.",
      bestFor: ["law-enforcement-bjj"]
    },
    "great-northern-tannersville": {
      title: "Great Northern Catskills: Village of Tannersville",
      url: "https://www.greatnortherncatskills.com/tannersville-ny",
      publisher: "Great Northern Catskills",
      fact: "Tannersville is a village in the Town of Hunter, known as a gateway to Catskill Park outdoor recreation.",
      bestFor: ["near-hunter-ny", "near-haines-falls-ny", "near-windham-ny"]
    },
    "town-hunter-trails": {
      title: "Town of Hunter: Kaaterskill Rail Trail",
      url: "https://townofhunterny.gov/kaaterskill-rail-trail/",
      publisher: "Town of Hunter, NY",
      fact: "The Kaaterskill Rail Trail provides a key recreational link between Haines Falls and Tannersville.",
      bestFor: ["near-hunter-ny", "near-haines-falls-ny"]
    },
    "dec-windham-wilderness": {
      title: "NYS DEC: Windham-Blackhead Range Wilderness",
      url: "https://dec.ny.gov/places/windham-blackhead-range-wilderness",
      publisher: "New York State DEC",
      fact: "The Windham-Blackhead Range Wilderness is part of the Catskill Forest Preserve, offering significant hiking and outdoor access.",
      bestFor: ["near-windham-ny"]
    },
    "dec-kaaterskill-wild-forest": {
      title: "NYS DEC: Kaaterskill Wild Forest",
      url: "https://dec.ny.gov/places/kaaterskill-wild-forest",
      publisher: "New York State DEC",
      fact: "Kaaterskill Wild Forest features iconic Catskill scenery, including the famous Kaaterskill Falls.",
      bestFor: ["near-haines-falls-ny", "near-hunter-ny"]
    },
    "nces-htcsd-facts": {
      title: "Verified Local Facts: Hunter-Tannersville CSD",
      url: "https://nces.ed.gov/ccd/districtsearch/district_detail.asp?ID2=3615060",
      publisher: "NCES CCD District Detail",
      fact: "Hunter-Tannersville CSD serves 333 students (2024-2025) across 2 schools with a 7.09 student-teacher ratio. District office: 6094 Main St, Tannersville, NY 12485.",
      bestFor: ["after-school"]
    },
    "after-school-movement-context": {
      title: "Movement and Screen-Time Context",
      url: "https://www.cdc.gov/physical-activity-basics/health-benefits/children.html",
      publisher: "CDC",
      fact: "Children/adolescents (6-17) should get 60+ minutes of daily moderate-to-vigorous physical activity. Many youth spend 7.5 hours/day with entertainment media, making a scheduled movement lane vital.",
      bestFor: ["after-school"]
    }
  },

  pageMap: {
    "/after-school": [
      "nces-htcsd-facts",
      "after-school-movement-context",
      "cdc-kids-benefits",
      "cdc-youth-activity-guidelines",
      "aap-martial-arts-safety",
      "hhs-youth-sports-strategy"
    ],
    "/kids": [
      "cdc-kids-benefits",
      "cdc-youth-activity-guidelines",
      "aap-martial-arts-safety",
      "hhs-youth-sports-strategy"
    ],
    "/teens": [
      "cdc-school-connectedness",
      "cdc-adolescent-mental-health",
      "hhs-youth-sports-mental-health",
      "hhs-social-connection-advisory"
    ],
    "/adult-bjj": [
      "cdc-adult-benefits",
      "cdc-adult-guidelines",
      "nih-nia-exercise-benefits",
      "cdc-active-people"
    ],
    "/student-hub": [
      "cdc-active-people",
      "cdc-school-connectedness",
      "hhs-social-connection-advisory"
    ],
    "/law-enforcement-bjj": [
      "nij-deescalation-training",
      "perf-icat-guide",
      "doj-cops-procedural-justice",
      "marietta-police-bjj-data"
    ],
    "/show-up-kit": [
      "cdc-kids-benefits",
      "cdc-adult-benefits",
      "aap-martial-arts-safety",
      "nih-nia-exercise-benefits"
    ],
    "/near/windham-ny": [
      "dec-windham-wilderness",
      "great-northern-tannersville",
      "cdc-adult-benefits",
      "cdc-youth-activity-guidelines"
    ],
    "/near/haines-falls-ny": [
      "dec-kaaterskill-wild-forest",
      "town-hunter-trails",
      "cdc-kids-benefits",
      "cdc-school-connectedness"
    ],
    "/near/hunter-ny": [
      "town-hunter-trails",
      "dec-kaaterskill-wild-forest",
      "great-northern-tannersville",
      "cdc-adult-benefits"
    ]
  }
};
