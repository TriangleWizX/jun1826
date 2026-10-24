# Hormozi Grand Slam Offer Specification: Alley Bootcamp Scale-Verified Weight Loss Goal Guarantee

**Document ID**: `docs/ws-hormozi-bootcamp-offer.md`  
**Workstream**: `ws-hormozi-offer` (DoD: `DOD-HORM-OFFER`)  
**Methodology**: Alex Hormozi's *$100M Offers*, *Gym Launch Secrets*, and *The Hormozi Orchestra*  
**Academy**: Sensei Sandy BJJ (6045 Main Street, Tannersville, NY)

---

## 1. Executive Strategy & Market Diagnosis

### The Commodity Problem (Gym Launch Secrets Ch. 01)
Before this offer, Alley Bootcamp was presented primarily as workout units:
- "Tuesday 6:30 AM Bootcamp (Strength), Thursday 6:30 AM Bootcamp (Engine), 40 minutes, $25 drop-in or $144 for 8 sessions."
In fitness economics, selling "sessions" or "workouts" traps the gym in commodity pricing where clients evaluate the purchase based on time spent sweating rather than the life-changing outcome achieved.

### The Grand Slam Transformation
By integrating the gym scale and establishing a **Scale-Verified Weight Loss Goal Guarantee**, Alley Bootcamp transforms from an hourly outdoor workout into an **Accountability-Driven Body Transformation Sprint**:
- **Dream Outcome**: Shed 5 to 10 pounds of unwanted weight, build lean mountain legs and core stamina, and feel light, energized, and capable.
- **The Golden Anchor**: The studio scale located right at 6045 Main Street.
- **The Vehicle**: 40-minute high-yield coached circuit using the boardwalk alley steps, kettlebells, Bulgarian bag, balance tools, and the indoor studio weather backup.
- **The Guarantee**: A conditional results guarantee that removes all perceived risk from the prospective student.

---

## 2. The Hormozi Value Equation Deconstruction

$$\text{Value} = \frac{\text{Dream Outcome} \times \text{Perceived Likelihood of Achievement}}{\text{Time Delay} \times \text{Effort \& Sacrifice}}$$

### 1. Dream Outcome ($\uparrow$ Maximized)
- Visible reduction in body fat and inches around the waist.
- Mountain-ready endurance for Catskills hiking, skiing at Hunter and Windham, and active daily life.
- Quiet confidence, elevated morning energy, and better sleep.

### 2. Perceived Likelihood of Achievement ($\uparrow$ Maximized)
- **Direct Black Belt Coaching**: Sandy (1st-degree BJJ black belt) personally coaches every session and tailors each exercise to the student's current movement baseline.
- **Small-Group Cap (Max 8)**: Personal oversight; no student gets lost in a packed room.
- **Studio Scale Tracking**: Private, objective, weekly weigh-ins on the gym scale eliminate guesswork and prove tangible biological progress.
- **Scale-Verified Goal Guarantee**: Sandy assumes the financial risk. If the student does the work and does not reach the goal, Sandy continues coaching them for free.

### 3. Time Delay ($\downarrow$ Minimized)
- **40-Minute Efficiency**: Sessions run 6:30 AM to 7:10 AM, allowing students to complete their strength and engine work and return home before family or work responsibilities begin.
- **Fast First Win (Gym Launch Secrets Ch. 16)**: Baseline scale weigh-in and initial movement check on Day 1 produce an immediate sense of momentum within the first 72 hours.
- **4-Week Sprint**: An 8-session pass maps directly to a focused 4-week body transformation cycle (2 sessions per week: Tuesday Strength + Thursday Engine).

### 4. Effort & Sacrifice ($\downarrow$ Minimized)
- **Beginner Lane Movement**: Simple, progressive movements (kettlebell deadlifts, step carries, balance ball drills) with zero punishing exhaustion.
- **Simple Whole-Food Plate Balance**: No calorie-counting apps, macro math, or starvation; just straightforward positive whole-food guidelines.
- **Weather Assurance**: If rain or snow hits the mountain, sessions seamlessly shift into the clean, heated indoor BJJ studio. Your class always happens.

---

## 3. The Studio Scale Protocol (The Golden Anchor)

Alex Hormozi emphasizes that accountability requires an objective, shared measurement tool. The gym scale at 6045 Main Street serves as the central anchor of the student experience:

```
[ Day 1: Private Baseline ] 
  Sandy records initial weight in the private studio log.
  Coach and student set a realistic 4-week goal (e.g., 5 to 8 lbs).
               ↓
[ Weeks 2–3: Weekly Check-in ]
  Fast, confidential 30-second weigh-in before or after class.
  Coach Sandy checks progress and offers positive tips.
               ↓
[ Week 4 / Session 8: Goal Weigh-in ]
  Final scale check-in celebrating achieved transformation.
  Outcome: Goal hit → Graduate or continue / Goal missed with full compliance → Free coaching until hit.
```

---

## 4. The 4-Condition Weight Loss Goal Guarantee Structure

Under Hormozi's conditional guarantee framework (*$100M Offers*), conditions protect the academy from bad-faith claims while systematically enforcing the exact habits required for student success:

1. **Condition 1 (Baseline Scale Check)**: Complete your confidential weigh-in on Sandy's gym scale on Day 1 to establish your starting weight and milestone target.
2. **Condition 2 (Attendance)**: Attend your 8 scheduled bootcamp sessions (Tuesday and Thursday mornings). If travel or sickness occurs, complete an approved makeup in the studio within the 5-week window.
3. **Condition 3 (Weekly Tracking)**: Step on the gym scale once each week before or after your morning workout.
4. **Condition 4 (Plate Balance)**: Follow Sandy's simple whole-food plate guidelines (plenty of water, lean protein, colorful vegetables, and wholesome fuel).

### The Risk-Reversal Promise:
> **"Hit your target on our gym scale, or Sandy coaches you for free until you do. If you complete your 8 sessions, check in weekly on our scale, and follow our simple plate guide without hitting your goal, we will continue coaching you at no extra charge until you reach it, or credit 100% of your tuition toward your ongoing academy training."**

---

## 5. Pricing Architecture & Canonical Data Alignment

The guarantee is anchored directly to the canonical 8-Session Pass:
- **Drop-in**: $25 (single class sampler, no guarantee)
- **Member Session**: $15 (active BJJ member rate)
- **4-Session Pass**: $80 ($20/session, flexibility pass)
- **8-Session Pass**: **$144** ($18/session) — **The Official Goal Guarantee Pass** (4-week transformation sprint)
- **Adult Annual Plan**: Included with membership

---

## 6. Copywriting & Compliance Parameters

To pass repo governance:
1. **Volatile Facts QA**: No hardcoded class times; use Nunjucks variables (`{{ bootcampSessions[0].time }}`).
2. **Banned Negative Words**: Strictly exclude "zero", "without", "no injuries", "stop", "don't", "won't", "never", "meathead", "punishing".
3. **Reading Level**: 3rd-grade reading level; short words (1–2 syllables); sentences under 8 words average.
4. **CTA**: Retain official SMS action `Text Sandy` with pre-filled body (`sms:+19177368649?body=Hi%20Sandy%2C%20tell%20me%20about%20the%20bootcamp%20weight%20loss%20guarantee%21`).
