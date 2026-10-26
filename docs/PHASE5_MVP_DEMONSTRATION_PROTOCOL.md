# Phase 5 MVP Demonstration Protocol

**Purpose:** Structured 20-30 minute demonstration using synthetic-data dashboard to validate user comprehension, usefulness, and institutional fit

**Target Audience:** PhilHealth benefit development teams, implementation/monitoring teams, regional offices  
**Format:** Individual or small group (2-3 participants)  
**Setting:** In-person or video call with screen sharing  
**Materials:** Live dashboard access, demonstration script, feedback survey

---

## Demonstration Structure

### Total Duration: 25-30 minutes

1. **Introduction (3 minutes)**
2. **Problem Context (2 minutes)**
3. **Synthetic Data Caveat (2 minutes)**
4. **Dashboard Walkthrough (12-15 minutes)**
   - Executive Overview (2 min)
   - Facility Participation Cascade (2 min)
   - Claims Processing Cascade (2 min)
   - Financial Reimbursement Analysis (3 min)
   - Regional Comparisons (2 min)
   - Diagnostic Recommendations (3 min)
5. **Scenario Comparison (3-5 minutes)**
6. **Open Discussion and Questions (5 minutes)**
7. **Feedback Collection (3 minutes)**

---

## Section 1: Introduction (3 minutes)

### Script

"Thank you for taking the time to meet with me today. My name is [NAME], and I'm exploring a diagnostic tool concept for monitoring health benefit implementation.

The purpose of today's session is to:
- Show you a prototype dashboard
- Get your feedback on whether this type of information would be useful in your work
- Learn about your current benefit monitoring practices

This is purely exploratory—I'm not selling anything, and there's no pressure to adopt or support this tool. Your honest feedback is extremely valuable.

Before we begin: Do you have any questions about the purpose of this session or how we'll use your feedback?"

### Key Points
- Frame as research/learning, not sales
- Emphasize honest feedback is desired
- Clarify no commitment expected
- Obtain verbal consent for feedback collection

---

## Section 2: Problem Context (2 minutes)

### Script

"Health insurance institutions like PhilHealth often introduce new benefit packages—such as outpatient mental health services, primary care packages, or Z benefits. The policy is approved, facilities are informed, and implementation begins.

However, translating policy into actual service delivery can be challenging. Implementation may stall at multiple stages:
- Eligible facilities may not complete accreditation
- Accredited facilities may not file claims
- Submitted claims may experience processing delays
- Approved claims may experience reimbursement delays
- Regional implementation may vary dramatically

The question we're exploring is: **Can a dashboard help implementation teams quickly identify where rollout is stalling and prioritize areas for investigation?**

Does this general problem resonate with your experience?"

### Key Points
- Establish problem context before showing solution
- Use specific PhilHealth benefit examples (mental health, Z benefits)
- Frame as "exploring" not "solving" (validate problem first)
- Invite participant to confirm or correct problem description

### Observation Notes
- Does participant confirm this is a real problem?
- Does participant share specific examples of implementation challenges?
- Does participant mention existing tools or approaches for monitoring?

---

## Section 3: Synthetic Data Caveat (2 minutes)

### Script

"Before I show you the dashboard, an important caveat: **All the data you're about to see is entirely fabricated.** This is NOT real PhilHealth data.

The facilities, claims, amounts, dates, and regions are all synthetic—created for demonstration purposes. The performance patterns you'll see are illustrative scenarios designed to demonstrate how the diagnostic logic works.

Why am I showing you fabricated data?
- We want to validate whether this TYPE of information would be useful before requesting access to real PhilHealth data.
- Synthetic data lets us demonstrate the concept without data access barriers.
- We're asking you to imagine: If this were real data from your benefit program, would this be useful?

There's a permanent warning banner on the dashboard that you'll see throughout—it says 'SYNTHETIC DEMONSTRATION DATA—NOT ACTUAL PHILHEALTH PERFORMANCE.' That's intentional and cannot be dismissed.

Does that make sense? Any questions before we dive in?"

### Key Points
- Explicitly acknowledge synthetic data BEFORE showing dashboard
- Explain rationale for synthetic data (validation before data access)
- Set expectation: evaluate conceptual usefulness, not data accuracy
- Permanent warning banner is intentional (not a bug)

### Observation Notes
- Does participant understand the synthetic data limitation?
- Does participant express concerns about evaluating usefulness without real data?
- Does participant ask about eventual real data integration?

---

## Section 4: Dashboard Walkthrough (12-15 minutes)

### 4.1 Executive Overview (2 minutes)

**[Load MODERATE scenario]**

### Script

"This is the Executive Overview section. It provides a high-level summary of benefit implementation status.

Let me walk you through the key metrics:

**Facility Participation:**
- 1,500 eligible facilities in the illustrative population
- 521 accredited (35% accreditation rate)
- 363 filing claims (70% of accredited facilities)
- 306 receiving payments (84% of claiming facilities)

**Claims Processing:**
- 1,943 total claims in this scenario
- 1,943 adjudicated (100% adjudication rate)
- 1,408 approved (72% approval rate)
- ₱14.4M approved amount

**Financial Performance:**
- ₱8.7M disbursed (60% of approved amount)
- ₱5.8M outstanding (approved but not yet paid)

**Payment Processing Time:**
- Average 22 days from approval to payment

Based on just this overview, what stands out to you? What would you want to investigate further?"

### Key Points
- Walk through numbers slowly (not overwhelming)
- Highlight key metrics: accreditation rate, claiming rate, disbursement ratio
- Pause for participant reaction before moving to next section
- Ask open-ended question: "What stands out to you?"

### Observation Notes
- Does participant immediately understand the metrics?
- Does participant identify a potential bottleneck (e.g., 60% disbursement)?
- Does participant ask for additional context or definitions?
- Does participant compare to expected performance (benchmarks)?

---

### 4.2 Facility Participation Cascade (2 minutes)

**[Scroll to Facility Cascade section]**

### Script

"This cascade shows how facilities move through implementation stages.

We start with 1,500 eligible facilities. At each stage, some facilities drop out:
- **Accreditation Stage:** 521 facilities completed accreditation (979 dropoff)
- **Claiming Stage:** 363 facilities filed at least one claim (158 dropoff)
- **Payment Stage:** 306 facilities received at least one payment (57 dropoff)

The percentages show conversion rates at each stage.

Important: These are facility counts, not claim counts. So when we say '363 facilities filing claims,' that could be thousands of claims across those facilities.

What do you notice about the dropoffs? Where would you focus attention?"

### Key Points
- Emphasize this is a facility funnel (not claim funnel)
- Highlight dropoff counts (979, 158, 57)
- Ask participant to interpret: where is the biggest problem?

### Observation Notes
- Does participant understand the cascade concept?
- Does participant identify the 979 accreditation dropoff as significant?
- Does participant distinguish facility counts from claim counts?

---

### 4.3 Claims Processing Cascade (2 minutes)

**[Scroll to Claims Cascade section]**

### Script

"This cascade shows the claim lifecycle from submission to payment.

- 1,943 total claims submitted
- 1,943 adjudicated (all claims have been reviewed)
- 1,408 approved (72% approval rate)
- 846 paid (60% of approved claims have been paid)

Notice the distinction:
- **Approval** means PhilHealth has agreed to pay the claim
- **Paid** means the money has actually been disbursed to the facility

The gap between approved (1,408 claims) and paid (846 claims) represents 562 claims that are approved but not yet paid—that's the reimbursement bottleneck.

Does this distinction—approved versus paid—align with how you think about claims processing?"

### Key Points
- Clarify approved ≠ paid (critical distinction)
- Highlight 562 claims approved but not paid
- Validate terminology with participant

### Observation Notes
- Does participant immediately grasp approved vs paid distinction?
- Does participant mention this is a known issue in their context?
- Does participant ask about rejection reasons or pending claims?

---

### 4.4 Financial Reimbursement Analysis (3 minutes)

**[Scroll to Financial Calculations section]**

### Script

"This section focuses on the financial side of reimbursement.

**Key Metrics:**
- ₱24.0M total billed by facilities
- ₱14.4M approved by PhilHealth (60% approval rate)
- ₱8.7M disbursed (paid out to facilities)
- **₱5.8M outstanding** (approved but not yet disbursed)

The **disbursement ratio** is 60%—meaning only 60% of approved amounts have been paid.

What does this tell us?
- Facilities are filing claims (₱24M billed)
- PhilHealth is approving a reasonable portion (₱14.4M, 60%)
- But **reimbursement is lagging**: only ₱8.7M has actually reached facilities

The outstanding ₱5.8M represents cash flow problems for facilities. They've delivered services, claims are approved, but payment hasn't arrived.

We also see payment processing time: average 22 days from approval to payment, but 1,106 claims are missing payment dates (57% of approved claims).

In your experience, is a 60% disbursement ratio concerning? What would you consider a healthy target?"

### Key Points
- Focus on outstanding amount (₱5.8M approved but not paid)
- Explain disbursement ratio (60% in this scenario)
- Ask participant to assess severity (is 60% good or bad?)
- Invite participant to share benchmarks or targets

### Observation Notes
- Does participant react strongly to 60% disbursement ratio?
- Does participant mention this matches or differs from their experience?
- Does participant know what a "good" disbursement ratio should be?
- Does participant identify payment processing time as a concern?

---

### 4.5 Regional Comparisons (2 minutes)

**[Scroll to Regional Comparison section]**

### Script

"This section shows regional performance variations.

[Point to table or chart]

Notice the disbursement ratios range from 48% (Region VIII) to 71% (NCR). Some regions have many more facilities without payment than others.

This suggests implementation is not uniform across the country. Regions like VIII and BARMM may need additional support, while NCR and IV-A are performing better.

Is regional variation something you currently track? Would this type of comparison be useful for resource allocation or regional support decisions?"

### Key Points
- Highlight range of regional performance (48%-71%)
- Suggest implications (some regions need support)
- Ask whether regional comparisons are useful

### Observation Notes
- Does participant engage with regional data?
- Does participant mention specific regions with known challenges?
- Does participant confirm or question regional patterns?

---

### 4.6 Diagnostic Recommendations (3 minutes)

**[Scroll to Diagnostic Insights section]**

### Script

"Based on the performance data, the dashboard generates diagnostic recommendations.

For this MODERATE scenario, two recommendations are triggered:

**1. MODERATE REIMBURSEMENT BOTTLENECK (Severity: High)**
- 60% disbursement ratio (target: 70%+)
- ₱5.8M outstanding
- Recommended Action: Investigate reimbursement processes, prioritize disbursement of outstanding amounts

**2. FACILITIES NOT RECEIVING PAYMENT (Severity: Moderate)**
- 57 facilities have approved claims but have received zero payments
- Recommended Action: Identify systemic barriers preventing payment to these facilities

These recommendations are generated automatically based on predefined thresholds. For example:
- If disbursement ratio < 70%, trigger moderate reimbursement bottleneck alert
- If facilities without payment ≥ 50, trigger facilities-not-receiving-payment alert

A few important clarifications:
- These recommendations identify WHAT the problem is (low disbursement, facilities without payment)
- They do NOT explain WHY (budget constraints, banking issues, documentation errors)
- They do NOT prescribe HOW to fix it (that requires investigation)

Think of these as prioritization flags: "This area warrants further investigation."

Do these recommendations seem useful? Are the thresholds (70% disbursement, 50 facilities) reasonable? What would you want to see in addition to these recommendations?"

### Key Points
- Explain recommendations are automatically generated (rule-based)
- Clarify recommendations identify problems, not causes or solutions
- Invite feedback on thresholds and usefulness
- Emphasize these are prioritization flags, not prescriptions

### Observation Notes
- Does participant find recommendations credible?
- Does participant agree with severity levels?
- Does participant suggest different thresholds or additional recommendations?
- Does participant articulate what they would do based on recommendations?

---

## Section 5: Scenario Comparison (3-5 minutes)

**[Switch to HIGH scenario]**

### Script

"Let me now show you a different scenario—this one represents a more severe bottleneck pattern.

**HIGH Bottleneck Scenario:**
- 514 accredited facilities
- ₱14.7M approved
- ₱7.6M disbursed (only **51% disbursement ratio**)
- **₱7.2M outstanding** (approved but not paid)
- 66 facilities without payment
- 43 claims partially paid

Compare this to the MODERATE scenario we just saw:
- MODERATE: 60% disbursement, ₱5.8M outstanding
- HIGH: 51% disbursement, ₱7.2M outstanding

In the HIGH scenario, the dashboard now triggers a **CRITICAL REIMBURSEMENT BOTTLENECK** alert.

Notice how the recommendations escalate:
- MODERATE scenario → 'Investigate reimbursement processes'
- HIGH scenario → 'CRITICAL: Urgent action required. Substantial claims approved but not reimbursed.'

The dashboard also flags:
- 66 facilities without payment (vs 57 in MODERATE)
- 43 partially paid claims (new alert)

**Question for you:** If you saw this HIGH scenario for a benefit you were monitoring, what would you do? Who would you escalate this to? What additional information would you need?"

### Key Points
- Demonstrate scenario differences (MODERATE vs HIGH)
- Show how recommendations escalate with severity
- Ask participant to articulate decision-making based on scenario

### Observation Notes
- Does participant clearly distinguish MODERATE vs HIGH severity?
- Does participant describe concrete actions they would take?
- Does participant mention escalation paths or institutional processes?
- Does participant identify information gaps (what else they'd need)?

---

**[Switch to LOW scenario]**

### Script (Optional, if time permits)

"For completeness, here's a LOW bottleneck scenario:
- 71% disbursement ratio
- ₱4.6M outstanding
- 59 facilities without payment

This still triggers alerts (MODERATE bottleneck, facilities without payment), but the severity is lower. This might represent normal operational friction rather than a systemic crisis.

The idea is the dashboard adapts its urgency to the severity of the pattern.

Does this make sense? Would graduated severity levels be useful, or would you prefer simpler yes/no alerts?"

### Key Points
- Briefly show LOW scenario (if time permits)
- Demonstrate graduated severity (LOW, MODERATE, HIGH)
- Ask participant about usefulness of severity levels

---

## Section 6: Open Discussion and Questions (5 minutes)

### Guiding Questions

1. **Usefulness:** "Based on what you've seen, how would this dashboard be useful (or not useful) in your work?"

2. **Comparison to Existing Tools:** "How does this compare to monitoring tools you currently use for benefit implementation?"

3. **Decision-Making:** "If you had access to this dashboard with real PhilHealth data, what would you do differently in your work?"

4. **Missing Features:** "What's missing that would make this more useful? What additional indicators, filters, or views would you want?"

5. **Credibility:** "Do the recommendations seem credible? Are the thresholds (70% disbursement, 50 facilities without payment) reasonable?"

6. **Adoption:** "If this tool were refined and used real PhilHealth data, would you be interested in piloting it?"

7. **Institutional Fit:** "What barriers do you foresee to adopting a tool like this at PhilHealth? (Data access, approvals, organizational priorities, etc.)"

### Facilitator Notes
- Let participant speak freely—don't defend design decisions
- Probe for specifics: "Can you tell me more about that?"
- Ask follow-up questions: "Why is that important to you?"
- Take detailed notes on requests, concerns, and reactions

### Observation Notes
- Does participant articulate clear use cases?
- Does participant compare to existing tools (positive or negative)?
- Does participant express enthusiasm or skepticism?
- Does participant identify insurmountable barriers?

---

## Section 7: Feedback Collection (3 minutes)

### Post-Demonstration Survey (Administered Verbally or via Form)

**1. Usefulness:** "On a scale of 1-5, how useful would a dashboard like this be in your work?"
- 1 = Not at all useful
- 2 = Slightly useful
- 3 = Moderately useful
- 4 = Very useful
- 5 = Extremely useful

**2. Clarity:** "On a scale of 1-5, how easy was it to understand the dashboard?"
- 1 = Very difficult to understand
- 2 = Somewhat difficult
- 3 = Neutral
- 4 = Somewhat easy
- 5 = Very easy

**3. Credibility:** "On a scale of 1-5, how credible are the diagnostic recommendations?"
- 1 = Not at all credible
- 2 = Slightly credible
- 3 = Moderately credible
- 4 = Very credible
- 5 = Extremely credible

**4. Actionability:** "On a scale of 1-5, how actionable are the insights provided?"
- 1 = Not actionable (unclear what to do)
- 2 = Slightly actionable
- 3 = Moderately actionable
- 4 = Very actionable
- 5 = Extremely actionable (clear next steps)

**5. Pilot Interest:** "Would you be interested in piloting this tool if it used real PhilHealth data?"
- Yes, definitely
- Yes, possibly (depending on [specify conditions])
- Neutral / unsure
- No, probably not
- No, definitely not

**6. Open Feedback:** "What's the single most important thing we should improve or add to make this more useful?"

[Record verbatim response]

**7. Information Gaps:** "Does this dashboard address an information gap you currently experience, or does it duplicate existing tools?"
- Addresses a significant information gap
- Addresses a minor information gap
- Neutral
- Partially duplicates existing tools
- Completely duplicates existing tools

**8. Demographic Information:**
- Role/Title: __________
- Team/Department: __________
- Years of Experience: __________
- Region (if applicable): __________

---

## Closing Script

"Thank you so much for your time and honest feedback. This has been incredibly valuable.

A few next steps:
- I'll synthesize feedback from all demonstrations and interviews
- If you're interested, I can share a summary of findings with you
- If you expressed interest in a pilot, I'll follow up once we've completed the validation phase

Do you have any final questions for me?

[If appropriate:] Would you be willing to introduce me to colleagues who might also have valuable perspectives on benefit implementation monitoring?"

### Key Points
- Express genuine gratitude
- Clarify next steps (no immediate commitment)
- Offer to share findings (value exchange)
- Request referrals (if appropriate)

---

## Facilitator Preparation Checklist

### Before the Demonstration:

- [ ] Dashboard loaded and tested (MODERATE scenario default)
- [ ] Internet connection stable (if video call)
- [ ] Screen sharing tested (if remote)
- [ ] Feedback survey printed or digital form ready
- [ ] Note-taking materials prepared
- [ ] Participant background researched (role, team, responsibilities)

### Materials Needed:

- [ ] Live dashboard access (URL or local server)
- [ ] Demonstration script (this document)
- [ ] Feedback survey form
- [ ] Note-taking template
- [ ] Backup plan (if internet fails, have screenshots)

### After the Demonstration:

- [ ] Save detailed notes (observations, quotes, reactions)
- [ ] Record feedback survey responses
- [ ] Send thank-you email
- [ ] Update participant tracking spreadsheet
- [ ] Flag high-value insights for synthesis

---

## Common Questions and Responses

**Q: "Is this data from our mental health benefit program?"**  
**A:** "No, all the data is synthetic—entirely fabricated. We're using illustrative scenarios to demonstrate the concept before requesting real PhilHealth data."

**Q: "Why are the thresholds 70% for disbursement and 50 facilities without payment?"**  
**A:** "Those are illustrative starting points. We'd calibrate them based on real PhilHealth performance baselines and policy targets if this tool moved forward. What thresholds would make sense to you?"

**Q: "Can we drill down to specific facilities or claims?"**  
**A:** "Not in the current version—it's national and regional level only. Would facility-level drill-down be important for your use case?"

**Q: "How often would data be updated?"**  
**A:** "That would depend on PhilHealth's data infrastructure. Ideally, data would be updated weekly or monthly. What frequency would be useful?"

**Q: "We already have a dashboard that shows claims volumes. How is this different?"**  
**A:** "That's great context. Tell me more about your existing dashboard—what does it show, and what's missing that this might address? Or does this duplicate what you already have?"

**Q: "Can this predict future bottlenecks or recommend specific interventions?"**  
**A:** "Not currently. The current version identifies where bottlenecks exist (diagnostic), but doesn't predict future problems or prescribe solutions. Would predictive capability be valuable?"

**Q: "What about patient outcomes or clinical quality?"**  
**A:** "This dashboard focuses on administrative processes—facility participation, claims, reimbursement. It doesn't measure patient access or clinical outcomes. Those would require different data sources like patient surveys or health records."

**Q: "How much would this cost to implement?"**  
**A:** "We're in the validation phase, so cost hasn't been determined. Right now we're just assessing whether this type of tool would be useful before building out infrastructure."

---

## Success Indicators for a Good Demonstration

**Positive Signals:**
- ✅ Participant immediately understands dashboard purpose
- ✅ Participant identifies meaningful bottlenecks from scenarios
- ✅ Participant articulates specific use cases ("I would use this to...")
- ✅ Participant asks detailed questions about features or data
- ✅ Participant compares favorably to existing tools (or identifies gaps)
- ✅ Participant expresses interest in piloting with real data
- ✅ Participant offers to introduce other stakeholders

**Neutral Signals:**
- ⚠️ Participant understands but is uncertain about usefulness
- ⚠️ Participant identifies missing features (opportunity for refinement)
- ⚠️ Participant wants to see real data before assessing value
- ⚠️ Participant uncertain about institutional adoption barriers

**Negative Signals:**
- ❌ Participant struggles to understand dashboard purpose or metrics
- ❌ Participant cannot identify actionable insights
- ❌ Participant states "we already have this"
- ❌ Participant identifies insurmountable barriers (data access, organizational resistance)
- ❌ Participant expresses skepticism about value proposition
- ❌ Participant disengages or appears uninterested

---

## Documentation Template for Each Demonstration

**Participant Information:**
- Name: __________
- Role/Title: __________
- Team/Department: __________
- Date: __________
- Duration: __________

**Observation Notes:**

*Section 2 - Problem Context:*
- Did participant confirm implementation bottlenecks are a real problem?
- Did participant share specific examples?

*Section 4 - Dashboard Walkthrough:*
- Which sections did participant engage with most?
- What questions did participant ask?
- What bottlenecks did participant identify?

*Section 5 - Scenario Comparison:*
- Did participant distinguish scenario severity?
- What actions would participant take based on HIGH scenario?

*Section 6 - Open Discussion:*
- How did participant describe usefulness?
- What comparisons to existing tools did participant make?
- What missing features did participant request?
- What institutional barriers did participant mention?

**Quantitative Feedback:**
- Usefulness: __/5
- Clarity: __/5
- Credibility: __/5
- Actionability: __/5
- Pilot Interest: Yes / Maybe / No
- Information Gap: Addresses gap / Duplicates tools

**Key Quotes:**
- [Record verbatim statements about usefulness, concerns, requests]

**Follow-Up Actions:**
- [ ] Send thank-you email
- [ ] Request referrals (if appropriate)
- [ ] Share findings summary (if participant interested)

---

**END OF MVP DEMONSTRATION PROTOCOL**

**Document Status:** ✅ COMPLETE  
**Next Document:** PHASE5_STAKEHOLDER_INTERVIEW_GUIDE.md
