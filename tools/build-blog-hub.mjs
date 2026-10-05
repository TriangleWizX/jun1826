import fs from 'fs';
import path from 'path';

const POSTS = [
  {
    slug: "after-school-jiu-jitsu",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "After-School Jiu-Jitsu in Tannersville",
    desc: "A calm class for kids. Small groups build focus and pride.",
    readTime: "3 min",
    url: "/blog/after-school-jiu-jitsu",
    tags: "kids after school tannersville youth focus routine"
  },
  {
    slug: "after-school-jiu-jitsu-calm-routine-catskills",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "A Calm After-School Routine for Catskills Kids",
    desc: "Two weekly classes help kids reset. Friendly partners train with safe pacing.",
    readTime: "4 min",
    url: "/blog/after-school-jiu-jitsu-calm-routine-catskills",
    tags: "catskills after school routine kids teens schedule"
  },
  {
    slug: "beginners-guide-bjj-human-chess",
    category: "first-class",
    categoryLabel: "First Class",
    title: "Beginner Guide: How Jiu-Jitsu Works Like Chess",
    desc: "Kids and adults learn ground moves. Small steps beat big force.",
    readTime: "4 min",
    url: "/blog/beginners-guide-bjj-human-chess",
    tags: "beginner guide human chess strategy leverage fundamentals"
  },
  {
    slug: "bio-switch-nervous-system",
    category: "adults",
    categoryLabel: "Adult Fitness",
    title: "The Bio-Switch: Calm Breathing for the Mat",
    desc: "Breathe deep to stay calm. Reset your body after drills.",
    readTime: "3 min",
    url: "/blog/bio-switch-nervous-system",
    tags: "breathing nervous system calm mindset focus recovery"
  },
  {
    slug: "bioginastica-movement-no-gi",
    category: "adults",
    categoryLabel: "Adult Fitness",
    title: "Smooth Movement Drills for No-Gi Training",
    desc: "Fun floor drills for mobility. They build strong hips and easy movement.",
    readTime: "3 min",
    url: "/blog/bioginastica-movement-no-gi",
    tags: "movement mobility ginastica hips floor drills"
  },
  {
    slug: "bjj-36-techniques",
    category: "first-class",
    categoryLabel: "First Class",
    title: "36 Core Moves for New Students",
    desc: "Basic moves for new students. Learn safe escapes and calm control.",
    readTime: "5 min",
    url: "/blog/bjj-36-techniques",
    tags: "36 techniques fundamentals moves curriculum escapes"
  },
  {
    slug: "bjj-beginners-over-40-catskills",
    category: "adults",
    categoryLabel: "Adult Fitness",
    title: "Starting Jiu-Jitsu Over 40 in the Catskills",
    desc: "Adults can start at any age. Friendly partners keep you safe.",
    readTime: "4 min",
    url: "/blog/bjj-beginners-over-40-catskills",
    tags: "over 40 beginner adult longevity catskills safety"
  },
  {
    slug: "bjj-belts-stripes-promotions",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "How Belts, Stripes, and Promotions Work",
    desc: "See how belts and stripes work. Coaches reward good effort and teamwork.",
    readTime: "4 min",
    url: "/blog/bjj-belts-stripes-promotions",
    tags: "belts stripes promotions rank kids teens families"
  },
  {
    slug: "bjj-black-belt-degree-time",
    category: "adults",
    categoryLabel: "Adult Fitness",
    title: "Black Belt Degrees and Time on the Mat",
    desc: "A steady timeline for mat time. Keep practice calm and fun.",
    readTime: "4 min",
    url: "/blog/bjj-black-belt-degree-time",
    tags: "black belt degree timeline stripes rank goals"
  },
  {
    slug: "bjj-promotions-how-often",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "How Often Do Students Earn Stripes?",
    desc: "Learn what coaches look for in class. Good habits build your skill.",
    readTime: "3 min",
    url: "/blog/bjj-promotions-how-often",
    tags: "promotions stripes cadence how often progress"
  },
  {
    slug: "bjj-sensei",
    category: "first-class",
    categoryLabel: "First Class",
    title: "What Sensei Means on the Mat",
    desc: "Sensei means teacher or guide. We use polite words in daily class.",
    readTime: "3 min",
    url: "/blog/bjj-sensei",
    tags: "sensei meaning coach professor teacher etiquette"
  },
  {
    slug: "cairo-ny-bjj-specialist",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "Training from Cairo, NY: An 18-Minute Drive",
    desc: "A short drive from Cairo, NY. Friendly coaching and clean mats.",
    readTime: "3 min",
    url: "/blog/cairo-ny-bjj-specialist",
    tags: "cairo ny local drive commute route tannersville"
  },
  {
    slug: "can-you-beat-sensei-without-a-black-belt",
    category: "first-class",
    categoryLabel: "First Class",
    title: "How Coaches Help New Students Learn",
    desc: "Coaches match your pace. Every drill helps you learn.",
    readTime: "3 min",
    url: "/blog/can-you-beat-sensei-without-a-black-belt",
    tags: "coaching learning pace rolls feedback growth"
  },
  {
    slug: "catskills-gym-alternative-jiu-jitsu",
    category: "adults",
    categoryLabel: "Adult Fitness",
    title: "A Fun Alternative to the Gym in the Catskills",
    desc: "A fun way to stay fit. Moving with partners makes exercise fun.",
    readTime: "4 min",
    url: "/blog/catskills-gym-alternative-jiu-jitsu",
    tags: "gym alternative fitness workout catskills fun"
  },
  {
    slug: "exactly-what-happens-first-bjj-class-minute-by-minute",
    category: "first-class",
    categoryLabel: "First Class",
    title: "Your First Class: Minute by Minute",
    desc: "See what happens on day one. Learn the warm-up and basic drills.",
    readTime: "5 min",
    url: "/blog/exactly-what-happens-first-bjj-class-minute-by-minute",
    tags: "first class minute by minute arrival warm up partner drills"
  },
  {
    slug: "gain-points-system",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "How Kids Build Good Habits on the Mat",
    desc: "Kids build good habits on the mat. Praise for effort builds pride.",
    readTime: "3 min",
    url: "/blog/gain-points-system",
    tags: "kids habits praise points progress report card"
  },
  {
    slug: "gi-bjj-windham-ny",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "Gi Jiu-Jitsu for Windham, NY Families",
    desc: "Jiu-Jitsu for Windham families. Clear steps for all ages.",
    readTime: "3 min",
    url: "/blog/gi-bjj-windham-ny",
    tags: "gi windham ny martial arts classes schedule"
  },
  {
    slug: "gi-vs-no-gi-bjj-cheat-code",
    category: "first-class",
    categoryLabel: "First Class",
    title: "Gi vs No-Gi: Which Class to Try First",
    desc: "Which class to try first. Both styles teach great balance.",
    readTime: "4 min",
    url: "/blog/gi-vs-no-gi-bjj-cheat-code",
    tags: "gi vs no-gi difference uniform rash guard beginner"
  },
  {
    slug: "growth-over-gold-bjj-mindset",
    category: "adults",
    categoryLabel: "Adult Fitness",
    title: "Growth Over Gold: A Healthy Training Mindset",
    desc: "Focus on learning each week. Small steps bring mat joy.",
    readTime: "3 min",
    url: "/blog/growth-over-gold-bjj-mindset",
    tags: "mindset growth progress learning goals joy"
  },
  {
    slug: "how-to-fall-safely-bjj-breakfalls",
    category: "first-class",
    categoryLabel: "First Class",
    title: "How to Fall Safely with Breakfalls",
    desc: "Learn how to roll and break your fall. Keep your head tucked in.",
    readTime: "4 min",
    url: "/blog/how-to-fall-safely-bjj-breakfalls",
    tags: "breakfalls falling safely rolls movement safety"
  },
  {
    slug: "hunter-elementary-tuesday-drop-off-bjj",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "Tuesday After-School Bus from Hunter School",
    desc: "After-school bus from Hunter school. Ride straight to the gym.",
    readTime: "3 min",
    url: "/blog/hunter-elementary-tuesday-drop-off-bjj",
    tags: "hunter elementary after school bus drop off tuesday"
  },
  {
    slug: "jiu-jitsu-near-hunter-mountain",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "Jiu-Jitsu Near Hunter Mountain",
    desc: "Train near Hunter Mountain. Skiers and locals share the mat.",
    readTime: "3 min",
    url: "/blog/jiu-jitsu-near-hunter-mountain",
    tags: "hunter mountain ski jiu jitsu local slope side"
  },
  {
    slug: "jiu-jitsu-near-windham-mountain-club",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "Martial Arts Near Windham Mountain Club",
    desc: "Martial arts near Windham Club. Great youth and adult classes.",
    readTime: "3 min",
    url: "/blog/jiu-jitsu-near-windham-mountain-club",
    tags: "windham mountain club martial arts classes local"
  },
  {
    slug: "jiu-jitsu-near-windham-mountain-club-ski-families",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "Jiu-Jitsu for Mountain and Ski Families",
    desc: "Build strong legs and good balance. Great for ski lovers.",
    readTime: "3 min",
    url: "/blog/jiu-jitsu-near-windham-mountain-club-ski-families",
    tags: "ski families mountain balance legs winter sports"
  },
  {
    slug: "jiu-jitsu-windham-ny",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "Windham, NY Guide to Starting Jiu-Jitsu",
    desc: "How Windham folks start training. Drive times and what to bring.",
    readTime: "4 min",
    url: "/blog/jiu-jitsu-windham-ny",
    tags: "windham ny guide drive times what to bring"
  },
  {
    slug: "kids-jiu-jitsu-windham-ny",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "Kids Martial Arts Near Windham, NY",
    desc: "A safe room where kids learn self-control. Games keep it fun.",
    readTime: "3 min",
    url: "/blog/kids-jiu-jitsu-windham-ny",
    tags: "kids windham martial arts games self control"
  },
  {
    slug: "kids-martial-arts-haines-falls",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "Kids Martial Arts in Haines Falls, NY",
    desc: "Kids martial arts near Haines Falls. Friendly small groups.",
    readTime: "3 min",
    url: "/blog/kids-martial-arts-haines-falls",
    tags: "haines falls kids martial arts small groups"
  },
  {
    slug: "kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "Gentle Youth Classes Near Haines Falls",
    desc: "Gentle youth classes near Haines Falls. Kids learn to move with care.",
    readTime: "3 min",
    url: "/blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu",
    tags: "haines falls beginner friendly youth gentle classes"
  },
  {
    slug: "kids-teens-bjj-belts-ranks-stripes-promotions",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "Kids and Teens Belt Ranks Explained",
    desc: "How kids earn new belt colors. Steps from white to green.",
    readTime: "4 min",
    url: "/blog/kids-teens-bjj-belts-ranks-stripes-promotions",
    tags: "belts ranks stripes kids teens white green"
  },
  {
    slug: "kinetic-chess-onteora-park",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "Outdoor Movement Near Onteora Park",
    desc: "Fun movement in Onteora Park. Playful games in mountain air.",
    readTime: "3 min",
    url: "/blog/kinetic-chess-onteora-park",
    tags: "onteora park movement outdoor summer mountain air"
  },
  {
    slug: "martial-arts-windham-ny-why-families-pick-jiu-jitsu",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "Why Catskills Families Choose Jiu-Jitsu",
    desc: "Why local families pick Jiu-Jitsu. Gentle leverage beats size.",
    readTime: "4 min",
    url: "/blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu",
    tags: "families pick jiu jitsu leverage size calm coaching"
  },
  {
    slug: "neck-cranks-bjj-longevity-guide",
    category: "adults",
    categoryLabel: "Adult Fitness",
    title: "Neck Safety and Training for Long-Term Health",
    desc: "Keep your neck safe while training. Good posture helps you roll.",
    readTime: "4 min",
    url: "/blog/neck-cranks-bjj-longevity-guide",
    tags: "neck safety posture longevity training clean mechanics"
  },
  {
    slug: "no-gi-windham-ny",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "No-Gi Jiu-Jitsu Near Windham, NY",
    desc: "No-Gi training near Windham. Fast, fun moves build good stamina.",
    readTime: "3 min",
    url: "/blog/no-gi-windham-ny",
    tags: "no-gi windham stamina speed conditioning"
  },
  {
    slug: "private-jiu-jitsu-lessons-windham-ny",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "Private Jiu-Jitsu Coaching for Windham Locals",
    desc: "Private coaching for Windham locals. Morning hours to meet your goals.",
    readTime: "3 min",
    url: "/blog/private-jiu-jitsu-lessons-windham-ny",
    tags: "private lessons windham 1 on 1 morning coaching"
  },
  {
    slug: "sanda-vs-jiu-jitsu",
    category: "first-class",
    categoryLabel: "First Class",
    title: "Sanda vs Jiu-Jitsu: Which to Start First?",
    desc: "Sanda or Jiu-Jitsu first? One is kicks, one is ground control.",
    readTime: "4 min",
    url: "/blog/sanda-vs-jiu-jitsu",
    tags: "sanda vs jiu jitsu striking grappling comparison"
  },
  {
    slug: "sanda-vs-jiu-jitsu-for-mma",
    category: "first-class",
    categoryLabel: "First Class",
    title: "Striking and Grappling for Self-Defense",
    desc: "Self-defense on your feet and ground. A balanced plan.",
    readTime: "4 min",
    url: "/blog/sanda-vs-jiu-jitsu-for-mma",
    tags: "sanda jiu jitsu mma self defense striking grappling"
  },
  {
    slug: "schedule-sensei",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "How to Build a Steady Training Habit",
    desc: "How to build a mat habit. Pick two days each week.",
    readTime: "3 min",
    url: "/blog/schedule-sensei",
    tags: "habit routine schedule two days consistency"
  },
  {
    slug: "schedule-sensei-reset-protocol",
    category: "adults",
    categoryLabel: "Adult Fitness",
    title: "How to Reset Your Routine After a Busy Week",
    desc: "Reset your schedule after a busy week. A calm, clean restart.",
    readTime: "3 min",
    url: "/blog/schedule-sensei-reset-protocol",
    tags: "reset schedule restart busy week rhythm"
  },
  {
    slug: "schedule-sensei-weekly-template",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "Weekly Training Template for Busy Adults",
    desc: "A weekly plan for busy adults. Simple calendars keep you on track.",
    readTime: "3 min",
    url: "/blog/schedule-sensei-weekly-template",
    tags: "weekly template calendar plan busy adults"
  },
  {
    slug: "seated-guard-basics",
    category: "first-class",
    categoryLabel: "First Class",
    title: "Seated Guard Basics for Beginners",
    desc: "Sit with good posture. Protect your space with simple frames.",
    readTime: "3 min",
    url: "/blog/seated-guard-basics",
    tags: "seated guard posture frames space hooks"
  },
  {
    slug: "sensei-mma-bjj",
    category: "first-class",
    categoryLabel: "First Class",
    title: "Why Fundamentals Build Real Mat Confidence",
    desc: "Strong basics win under pressure. Learn core moves first.",
    readTime: "3 min",
    url: "/blog/sensei-mma-bjj",
    tags: "fundamentals basics mma bjj confidence"
  },
  {
    slug: "sensei-rules",
    category: "first-class",
    categoryLabel: "First Class",
    title: "5 Core Rules for a Safe, Friendly Mat",
    desc: "Five simple rules for a safe room. Treat partners with care.",
    readTime: "3 min",
    url: "/blog/sensei-rules",
    tags: "rules safety hygiene tap respect etiquette"
  },
  {
    slug: "snow-day-protocol-bjj-home-dojo",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "Snow Day Mat Drills You Can Do at Home",
    desc: "Snow day drills for your living room. Gentle practice at home.",
    readTime: "3 min",
    url: "/blog/snow-day-protocol-bjj-home-dojo",
    tags: "snow day home drills practice living room catskills"
  },
  {
    slug: "spring-fling-is-here",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "Spring Fling: Kids Friendly Mat Showcase",
    desc: "A fun kids mat showcase. Young students share their skills.",
    readTime: "2 min",
    url: "/blog/spring-fling-is-here",
    tags: "spring fling event kids tournament showcase"
  },
  {
    slug: "takedown-defense",
    category: "adults",
    categoryLabel: "Adult Fitness",
    title: "Takedown Defense and Good Standing Balance",
    desc: "Stay on your feet with good balance. Heavy hips keep you safe.",
    readTime: "4 min",
    url: "/blog/takedown-defense",
    tags: "takedown defense posture balance sprawl hips"
  },
  {
    slug: "tannersville-bjj-tuesday",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "Tuesday Class Rhythm in Tannersville",
    desc: "Tuesday class times in town. Kids at five, adults at six.",
    readTime: "3 min",
    url: "/blog/tannersville-bjj-tuesday",
    tags: "tuesday tannersville schedule kids adults"
  },
  {
    slug: "teen-jiu-jitsu-hunter-ny",
    category: "families",
    categoryLabel: "Kids & Families",
    title: "Teen Martial Arts Near Hunter, NY",
    desc: "Teen martial arts near Hunter. Teens gain strength and calm pride.",
    readTime: "3 min",
    url: "/blog/teen-jiu-jitsu-hunter-ny",
    tags: "teens hunter ny martial arts strength confidence"
  },
  {
    slug: "things-to-do-near-hunter-ny-private-bjj-coaching",
    category: "local",
    categoryLabel: "Local & Schedule",
    title: "Things to Do Near Hunter: Try Private BJJ",
    desc: "Fun indoor activity near Hunter. Coached lessons at your pace.",
    readTime: "3 min",
    url: "/blog/things-to-do-near-hunter-ny-private-bjj-coaching",
    tags: "things to do hunter ny private coaching indoor activity"
  },
  {
    slug: "water-before-training-how-much-when",
    category: "adults",
    categoryLabel: "Adult Fitness",
    title: "How Much Water to Drink Before Class",
    desc: "Drink plenty of water before class. Stay fresh and light.",
    readTime: "3 min",
    url: "/blog/water-before-training-how-much-when",
    tags: "water hydration drink before class pre training"
  },
  {
    slug: "what-does-sensei-mean-in-bjj",
    category: "first-class",
    categoryLabel: "First Class",
    title: "The Meaning of Sensei in Martial Arts",
    desc: "What sensei means in martial arts. Someone who walked the path first.",
    readTime: "3 min",
    url: "/blog/what-does-sensei-mean-in-bjj",
    tags: "sensei meaning teacher coach guide martial arts"
  },
  {
    slug: "what-is-sanda-sanshou",
    category: "first-class",
    categoryLabel: "First Class",
    title: "What Is Sanda? A Simple Introduction",
    desc: "What is Sanda? Simple kicks and sweeps that pair with grappling.",
    readTime: "3 min",
    url: "/blog/what-is-sanda-sanshou",
    tags: "what is sanda sanshou kicks sweeps striking"
  },
  {
    slug: "wrestle-ups-scramble",
    category: "adults",
    categoryLabel: "Adult Fitness",
    title: "3 Smooth Wrestle-Ups from the Guard",
    desc: "Stand up from the ground with ease. Pure leverage helps you rise.",
    readTime: "3 min",
    url: "/blog/wrestle-ups-scramble",
    tags: "wrestle ups scramble stand up guard sweep"
  }
];

export function generateBlogHtml() {
  const cardsHtml = POSTS.map((p, idx) => `
    <article class="ss-post-card" data-category="${p.category}" data-search="${p.title.toLowerCase()} ${p.desc.toLowerCase()} ${p.tags.toLowerCase()}">
      <div class="ss-post-card__inner">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="ss-card-badge">${p.categoryLabel}</span>
          <span class="ss-card-read-time">${p.readTime}</span>
        </div>
        <h3 class="ss-post-card__title">
          <a href="${p.url}">${p.title}</a>
        </h3>
        <p class="ss-post-card__desc">${p.desc}</p>
        <div class="ss-post-card__footer">
          <a href="${p.url}" class="ss-card-link">
            Read Guide <span class="ss-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  `).join('\n');

  return `---
layout: layouts/base.njk
title: "BJJ Guides & Library | Sensei Sandy Brazilian Jiu-Jitsu"
description: "Read calm, friendly Brazilian Jiu-Jitsu guides for beginners, kids, teens, and adults in Tannersville, NY and the Catskills."
canonicalUrl: "https://senseisandy.com/blog"
bodyClass: "page-blog"
extraCss:
  - "/assets/css/routes/site-18ac9c2704ce.min.css"
permalink: "/blog/index.html"
---
<main class="ss-main" id="main-content" role="main">

  <!-- HERO SECTION -->
  <section class="ss-blog-hero py-5">
    <div class="container ss-container">
      <div class="ss-blog-hero__content text-center mx-auto" style="max-width: 760px;">
        <span class="ss-eyebrow">Sensei Sandy BJJ Guides</span>
        <h1 class="display-5 fw-bold mb-3 mt-2">Read the guides that help you start.</h1>
        <p class="lead mb-4" style="color: var(--ss-muted);">Simple words for your first steps on the mat. Learn what to wear, how class runs, and when to start.</p>
        <div class="d-flex flex-wrap justify-content-center gap-3">
          <a class="ss-btn ss-btn-primary" href="/free-bjj-intro-tannersville-ny">
            Reserve Your Free First Visit <span aria-hidden="true">↗</span>
          </a>
          <a class="ss-btn ss-btn-soft" href="sms:+19177368649?body=Hi%20Sandy%2C%20I%20have%20a%20question%20about%20starting%20BJJ">
            Text Sandy <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- BEST READS / QUICK START GUIDES -->
  <section class="ss-featured-reads py-4" aria-labelledby="featured-reads-title">
    <div class="container ss-container">
      <div class="d-flex justify-content-between align-items-end mb-3">
        <div>
          <span class="ss-eyebrow">Start Here</span>
          <h2 id="featured-reads-title" class="h3 mb-0 mt-1">Four quick reads for your first visit</h2>
        </div>
      </div>
      <div class="ss-featured-grid">
        <a class="ss-featured-card" href="/blog/exactly-what-happens-first-bjj-class-minute-by-minute">
          <span class="ss-featured-tag">First Visit</span>
          <strong>Your First Class Minute by Minute</strong>
          <p>See what happens from warm-up to partner drills. Calm pacing helps you start.</p>
          <span class="ss-featured-cta">Read Guide →</span>
        </a>
        <a class="ss-featured-card" href="/schedule">
          <span class="ss-featured-tag">Schedule</span>
          <strong>Find the Class That Fits Your Week</strong>
          <p>Youth classes meet at 5:00 PM. Adult classes meet at 6:00 PM. Saturday at 10:30 AM.</p>
          <span class="ss-featured-cta">View Times →</span>
        </a>
        <a class="ss-featured-card" href="/show-up-kit">
          <span class="ss-featured-tag">Show-Up Kit</span>
          <strong>What to Wear and What to Bring</strong>
          <p>Wear soft gym clothes. Bring a water bottle. We take care of the rest.</p>
          <span class="ss-featured-cta">See Kit →</span>
        </a>
        <a class="ss-featured-card" href="/bjj-glossary">
          <span class="ss-featured-tag">BJJ Words</span>
          <strong>Learn Everyday Words Before Class</strong>
          <p>Plain words for tap, guard, mount, and side control. Hear the terms early.</p>
          <span class="ss-featured-cta">Open Glossary →</span>
        </a>
      </div>
    </div>
  </section>

  <!-- MAIN BLOG DIRECTORY & SIDEBAR -->
  <section class="ss-directory-section py-5" id="all-guides">
    <div class="container ss-container">
      <div class="ss-blog-layout">

        <!-- LEFT COLUMN: SEARCH, FILTERS, AND POST GRID -->
        <div class="ss-blog-feed">
          <div class="ss-filter-bar mb-4">
            <div class="ss-search-wrap mb-3">
              <span class="ss-search-icon" aria-hidden="true">🔍</span>
              <input type="search" id="blog-search-input" class="ss-search-input" placeholder="Search guides by topic or word..." aria-label="Search all guides">
              <button type="button" id="blog-search-clear" class="ss-search-clear" aria-label="Clear search" style="display: none;">✕</button>
            </div>
            <div class="ss-category-pills" role="tablist" aria-label="Filter guides by category">
              <button type="button" class="ss-pill is-active" data-category="all" role="tab" aria-selected="true">All Guides (52)</button>
              <button type="button" class="ss-pill" data-category="first-class" role="tab" aria-selected="false">First Class</button>
              <button type="button" class="ss-pill" data-category="families" role="tab" aria-selected="false">Kids &amp; Families</button>
              <button type="button" class="ss-pill" data-category="adults" role="tab" aria-selected="false">Adult Fitness</button>
              <button type="button" class="ss-pill" data-category="local" role="tab" aria-selected="false">Local &amp; Schedule</button>
            </div>
            <div class="ss-search-feedback mt-2" aria-live="polite">
              <span id="blog-count-text">Showing all 52 guides</span>
            </div>
          </div>

          <!-- POST CARDS GRID -->
          <div class="ss-post-grid" id="blog-post-grid">
            ${cardsHtml}
          </div>

          <div id="blog-empty-state" class="ss-empty-state text-center py-5" style="display: none;">
            <p class="h5 mb-2">Looking for a different topic?</p>
            <p class="text-muted mb-3">Try another word or clear your search to see every guide.</p>
            <button type="button" class="ss-btn ss-btn-soft" id="blog-reset-filter-btn">Show All Guides</button>
          </div>
        </div>

        <!-- RIGHT SIDEBAR -->
        <aside class="ss-blog-sidebar" aria-label="Helpful links and schedule">
          
          <!-- FREE VISIT CARD -->
          <div class="ss-sidebar-card ss-sidebar-card--accent">
            <span class="ss-eyebrow">Beginner Lane</span>
            <h3 class="h4 mt-1 mb-2">Try Your First Class Free</h3>
            <p class="small text-muted mb-3">Tour the studio, meet Coach Sandy, and learn at your own pace with helpful partners.</p>
            <a class="ss-btn ss-btn-primary w-100" href="/free-bjj-intro-tannersville-ny">
              Reserve Free First Visit ↗
            </a>
          </div>

          <!-- DIRECT TEXT CARD -->
          <div class="ss-sidebar-card">
            <span class="ss-eyebrow">Direct Line</span>
            <h3 class="h5 mt-1 mb-2">Have a Quick Question?</h3>
            <p class="small text-muted mb-3">Sandy answers texts personally. Ask about classes, gear, or family routines.</p>
            <a class="ss-btn ss-btn-soft w-100" href="sms:+19177368649?body=Hi%20Sandy%2C%20I%20have%20a%20question%20about%20starting%20BJJ">
              Text (917) 736-8649 →
            </a>
          </div>

          <!-- SCHEDULE SNAPSHOT -->
          <div class="ss-sidebar-card">
            <span class="ss-eyebrow">Class Times</span>
            <h3 class="h5 mt-1 mb-2">Weekly Rhythm</h3>
            <div class="ss-schedule-mini mb-3">
              <div class="ss-schedule-mini-row">
                <strong>Youth &amp; Teens:</strong>
                <span>5:00 PM (Mon-Wed-Fri)</span>
              </div>
              <div class="ss-schedule-mini-row">
                <strong>Adults (Gi):</strong>
                <span>6:00 PM (Mon-Wed-Fri)</span>
              </div>
              <div class="ss-schedule-mini-row">
                <strong>Saturday No-Gi:</strong>
                <span>10:30 AM (Adults)</span>
              </div>
            </div>
            <a class="ss-card-link" href="/schedule">View Full Schedule →</a>
          </div>

          <!-- HELPFUL TOPICS -->
          <div class="ss-sidebar-card">
            <span class="ss-eyebrow">Explore More</span>
            <h3 class="h5 mt-1 mb-3">Helpful Pages</h3>
            <ul class="ss-sidebar-links list-unstyled mb-0">
              <li><a href="/bjj-classes/kids-tannersville-ny">Kids Jiu-Jitsu →</a></li>
              <li><a href="/bjj-classes/teens-tannersville-ny">Teens Jiu-Jitsu →</a></li>
              <li><a href="/bjj-classes/adults-tannersville-ny">Adult Classes →</a></li>
              <li><a href="/parent-resources">Parent Guide →</a></li>
              <li><a href="/bjj-glossary">BJJ Glossary →</a></li>
              <li><a href="/how-class-works">How Class Works →</a></li>
            </ul>
          </div>

        </aside>

      </div>
    </div>
  </section>

  <!-- SCHEDULE PREVIEW SECTION -->
  <section class="schedule-teaser py-4 my-4" style="background: var(--ss-surface2); border-radius: 16px; margin-inline: auto; max-width: 1000px; padding: 2.5rem 2rem;">
    <div class="container text-center">
      <span class="ss-eyebrow">Schedule Preview</span>
      <h2 class="h3 mb-3 mt-1">Most students start after school, evenings, or Saturday morning.</h2>
      <p style="color: var(--ss-muted); max-width: 700px; margin-inline: auto; margin-bottom: 1.5rem; line-height: 1.6;">
        Youth/Teen classes run at 5:00 PM: No-Gi Monday and Wednesday, Gi Tuesday and Friday.<br>
        Adult classes run at 6:00 PM: Gi Monday, Tuesday, Wednesday, and Friday.<br>
        Saturday Adult No-Gi meets at 10:30 AM.
      </p>
      <div class="d-flex flex-wrap justify-content-center gap-3">
        <a class="ss-btn ss-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Your Free First Visit</a>
        <a class="ss-btn ss-btn-soft" href="/schedule">View Full Schedule</a>
      </div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="ss-final-cta py-5">
    <div class="container text-center">
      <span class="ss-eyebrow">Ready When You Are</span>
      <h2 class="display-6 fw-bold mb-3 mt-1">Start calm. Train smart.</h2>
      <p class="lead mb-4" style="color: var(--ss-muted); max-width: 600px; margin-inline: auto;">Tour the studio, ask questions, map your goal, then choose your first small-group class.</p>
      <div class="d-flex flex-wrap justify-content-center gap-3">
        <a class="ss-btn ss-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Your Free First Visit ↗</a>
        <a class="ss-btn ss-btn-soft" href="sms:+19177368649?body=Hi%20Sandy%2C%20I%20have%20a%20question%20about%20starting%20BJJ">Text Sandy →</a>
      </div>
    </div>
  </section>

  <!-- BREADCRUMB -->
  <!-- AUTO_BREADCRUMB_START -->
  <nav aria-label="Breadcrumb" class="container py-3">
    <a href="/">Home</a> → <span>Blog</span>
  </nav>
  <!-- AUTO_BREADCRUMB_END -->

</main>

<script>
(() => {
  const searchInput = document.getElementById('blog-search-input');
  const clearBtn = document.getElementById('blog-search-clear');
  const pills = document.querySelectorAll('.ss-category-pills .ss-pill');
  const cards = document.querySelectorAll('#blog-post-grid .ss-post-card');
  const countText = document.getElementById('blog-count-text');
  const emptyState = document.getElementById('blog-empty-state');
  const resetBtn = document.getElementById('blog-reset-filter-btn');

  let activeCategory = 'all';
  let searchTerm = '';

  function filterPosts() {
    let visibleCount = 0;
    const term = searchTerm.trim().toLowerCase();

    cards.forEach(card => {
      const cardCat = card.dataset.category || '';
      const cardSearch = card.dataset.search || '';

      const matchesCat = (activeCategory === 'all' || cardCat === activeCategory);
      const matchesSearch = (!term || cardSearch.includes(term));

      if (matchesCat && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countText) {
      if (term || activeCategory !== 'all') {
        countText.textContent = 'Showing ' + visibleCount + ' of ' + cards.length + ' guides';
      } else {
        countText.textContent = 'Showing all ' + cards.length + ' guides';
      }
    }

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      if (clearBtn) clearBtn.style.display = searchTerm ? 'inline-block' : 'none';
      filterPosts();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      searchTerm = '';
      clearBtn.style.display = 'none';
      filterPosts();
    });
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => {
        p.classList.remove('is-active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('is-active');
      pill.setAttribute('aria-selected', 'true');
      activeCategory = pill.dataset.category || 'all';
      filterPosts();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchTerm = '';
      if (clearBtn) clearBtn.style.display = 'none';
      activeCategory = 'all';
      pills.forEach(p => {
        const isAll = p.dataset.category === 'all';
        p.classList.toggle('is-active', isAll);
        p.setAttribute('aria-selected', isAll ? 'true' : 'false');
      });
      filterPosts();
    });
  }
})();
</script>
`;
}

const html = generateBlogHtml();
fs.writeFileSync('src/blog/index.html', html);
console.log('Generated src/blog/index.html successfully');
