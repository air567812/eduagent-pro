# EduAgent Pro (AI-Powered Academic Productivity Platform)

EduAgent Pro is an enterprise-grade academic productivity SaaS engineered for students, educators, and institutions. Moving beyond generic chatbots, EduAgent Pro processes heterogeneous materials (PDFs, Word documents, and **up to 25 simultaneous images per session on the Free Tier**) and runs **15+ specialized educational AI tools** powered by OpenAI models (`gpt-4o`, `gpt-4o-mini`, vision OCR) with strict Zod structured outputs.

---

## 🌟 Key Features

1. **Multi-File & Multi-Image Ingestion (Strict Free Tier Limits):**
   - Drag-and-drop support for `.pdf`, `.docx`, `.png`, `.jpg`, `.jpeg`, `.webp`.
   - **Strict Free Plan Enforcement:** Exactly up to **25 images per session** enforced on both client and server layers.
   - Interactive visual thumbnails with drag & click reordering so students can sort handwritten lecture pages chronologically.
   - Simulated chunked upload with real-time progress bar and Vision OCR text preview.

2. **15+ Specialized AI Educational Tools:**
   - **Important Questions for Exams:** Subjective & objective questions calibrated by marks (2, 5, 10 marks), expected word counts, and grading rubrics.
   - **Summarize This Topic:** Executive summary, core principles, formulas with variable explanations, and common exam pitfalls.
   - **Summarize This Chapter:** Section-by-section breakdown with reading time estimates.
   - **Quick Summary:** 3-minute executive TL;DR and glossary.
   - **Detailed Academic Report:** Research report with citations and methodology.
   - **Important Points & Notes:** Extracted formulas, laws, and memory mnemonics.
   - **Question and Answer Generator:** Comprehensive Q&A model revision answers.
   - **MCQ Generator with Distractor Analysis:** 4-choice questions with answer keys and distractor rationales explaining why incorrect choices are wrong.
   - **Short and Long Answers:** Formatted specifically for standard university exam lengths.
   - **Revision Notes:** High-yield cheat sheets for the night before exams.
   - **Topic-Wise Learning Analysis:** Cognitive complexity, Bloom's Taxonomy ratings, and prerequisite trees.
   - **Explain This Topic (Feynman Technique):** ELI5 analogies, everyday real-world metaphors, and bridges to technical exam terminology.
   - **Flashcard Generator (Interactive & Anki):** Digital flashcard deck with interactive 3D card flipping (front/back), hints, and difficulty ratings.
   - **Practice Test Generator:** Timed mock exam with Section A/B/C breakdown and marking rubrics.
   - **Assignment and Report Assistant:** Thesis generation, structural outlining, and academic vocabulary.

3. **User Dashboard & Interactive Result Viewer:**
   - Daily AI request meters and session image gauges.
   - Interactive Study Mode: 3D flip card player for flashcards and interactive quiz simulator for MCQs.
   - Multi-format exports: Download Markdown (`.md`), formatted Word document (`.doc`), or print/save as PDF.
   - Bookmark and save results to custom study folders.

4. **Stripe Subscriptions & Automated Tier Management:**
   - 4 Tiers: Basic ($0), Pro ($19/mo), Premium ($49/mo), Institutional ($199/mo).
   - Stripe Checkout session creation (`/api/stripe/checkout`) and webhook listeners.
   - Simulated instant test upgrade for zero-friction local developer testing.

5. **Super Admin Console:**
   - Role-Based Access Control (`STUDENT`, `EDUCATOR`, `INSTITUTION_ADMIN`, `SUPER_ADMIN`).
   - Tenant user management with manual plan/role overrides.
   - Financial MRR analytics, active subscriber tracking, and OpenAI token consumption monitoring.
   - Dynamic system prompt hot-tuning without redeployment.
   - Real-time audit logs for security, uploads, and rate limits.

---

## 🚀 Quick Start Guide

### 1. Requirements
- Node.js LTS (v20+ or v24+)
- SQLite (included out-of-the-box in `prisma/dev.db`) or PostgreSQL

### 2. Launch the Application
Double-click `run.bat` or run in PowerShell:
```powershell
node ./node_modules/next/dist/bin/next dev -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Tier Privileges |
|---|---|---|---|
| **Student** | `student@eduagent.ai` | `demo123` | **Basic (Free)**: Up to 25 images/session, core tools |
| **Educator** | `educator@eduagent.ai` | `demo123` | **Pro ($19/mo)**: Up to 100 images, all 15 tools |
| **Super Admin** | `admin@eduagent.ai` | `Admin@123` | **Institutional**: Full platform console & metrics |

*(You can also click the quick one-click role switch buttons on the [Login Page](http://localhost:3000/login)).*
