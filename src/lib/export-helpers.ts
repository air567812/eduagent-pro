import { ToolType } from '@/types';

/**
 * Converts any structured educational result JSON into formatted Markdown.
 */
export function formatResultAsMarkdown(toolType: ToolType, data: any): string {
  if (!data) return '';

  let md = `# EduAgent Pro - Academic Report\n`;
  md += `*Generated on ${new Date().toLocaleDateString()} | Tool: ${toolType}*\n\n---\n\n`;

  switch (toolType) {
    case 'IMPORTANT_QUESTIONS': {
      md += `## ${data.title || 'Exam Questions'}\n\n`;
      if (Array.isArray(data.questions)) {
        data.questions.forEach((q: any, i: number) => {
          md += `### Question ${i + 1} [${q.marks} Marks | ${q.type} | Weight: ${q.syllabusWeightage}]\n`;
          md += `**Q:** ${q.question}\n\n`;
          md += `*Expected Length:* ${q.expectedLength}\n\n`;
          md += `**Model Answer:**\n> ${q.modelAnswer}\n\n`;
          if (q.keyGradingKeywords?.length) {
            md += `*Grading Keywords:* \`${q.keyGradingKeywords.join('`, `')}\`\n\n`;
          }
        });
      }
      break;
    }

    case 'SUMMARIZE_TOPIC': {
      md += `## ${data.topicTitle}\n\n`;
      md += `### Executive Summary\n${data.executiveSummary}\n\n`;
      if (data.coreConcepts?.length) {
        md += `### Core Concepts\n`;
        data.coreConcepts.forEach((c: any) => {
          md += `#### ${c.name}\n- **Definition:** ${c.definition}\n- **Example:** ${c.realWorldExample}\n\n`;
        });
      }
      if (data.formulasOrTheorems?.length) {
        md += `### Key Formulas & Theorems\n`;
        data.formulasOrTheorems.forEach((f: any) => {
          md += `- **${f.name}:** \`${f.formula}\`\n  - *Variables:* ${f.variables}\n  - *Application:* ${f.application}\n\n`;
        });
      }
      if (data.commonExamPitfalls?.length) {
        md += `### Common Exam Pitfalls to Avoid\n`;
        data.commonExamPitfalls.forEach((p: string) => {
          md += `- ⚠️ ${p}\n`;
        });
      }
      break;
    }

    case 'FLASHCARD_GENERATOR': {
      md += `## ${data.deckTitle} (${data.totalCards || data.cards?.length} Cards)\n\n`;
      if (Array.isArray(data.cards)) {
        data.cards.forEach((c: any, i: number) => {
          md += `### Card #${i + 1} [${c.difficulty} | ${c.tag}]\n`;
          md += `**Front:** ${c.front}\n\n`;
          md += `**Back:** ${c.back}\n\n`;
          if (c.hint) md += `*Hint:* ${c.hint}\n\n`;
        });
      }
      break;
    }

    case 'MCQ_GENERATOR': {
      md += `## ${data.testTitle}\n\n`;
      if (Array.isArray(data.mcqs)) {
        data.mcqs.forEach((m: any, i: number) => {
          md += `### ${i + 1}. ${m.question}\n`;
          const letters = ['A', 'B', 'C', 'D'];
          m.options?.forEach((opt: string, idx: number) => {
            const isCorrect = idx === m.correctOptionIndex ? ' **(Correct)**' : '';
            md += `- **[${letters[idx]}]** ${opt}${isCorrect}\n`;
          });
          md += `\n**Explanation:** ${m.detailedExplanation}\n\n`;
        });
      }
      break;
    }

    case 'EXPLAIN_TOPIC': {
      md += `## Feynman Explanation: ${data.conceptName}\n\n`;
      md += `### Explain Like I'm 5\n${data.explainLikeIm5}\n\n`;
      if (data.vividAnalogy) {
        md += `### Analogy: ${data.vividAnalogy.analogyTitle}\n${data.vividAnalogy.storyOrComparison}\n\n`;
      }
      if (data.stepByStepIntuition?.length) {
        md += `### Step-by-Step Intuition\n`;
        data.stepByStepIntuition.forEach((s: string) => (md += `- ${s}\n`));
        md += '\n';
      }
      break;
    }

    case 'PRACTICE_TEST_GENERATOR': {
      md += `## ${data.examTitle}\n`;
      md += `**Total Marks:** ${data.totalMarks} | **Duration:** ${data.durationMinutes} Minutes\n\n`;
      if (data.instructions?.length) {
        md += `### Instructions\n`;
        data.instructions.forEach((ins: string) => (md += `- ${ins}\n`));
        md += '\n';
      }
      data.sections?.forEach((sec: any) => {
        md += `### ${sec.sectionName} (${sec.sectionMarks} Marks)\n\n`;
        sec.questions?.forEach((q: any) => {
          md += `**Q${q.questionNumber} [${q.marks} Marks]:** ${q.prompt}\n\n`;
          md += `*Evaluation Criteria:* ${q.answerKeyOrCriteria}\n\n`;
        });
      } );
      break;
    }

    default: {
      md += `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
    }
  }

  return md;
}

/**
 * Downloads a string as a file in the browser.
 */
export function triggerBrowserDownload(filename: string, content: string, mimeType: string = 'text/plain') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
