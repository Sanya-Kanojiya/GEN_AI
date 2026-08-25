// const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
// const { zodToJsonSchema } = require("zod-to-json-schema")  // in terminal -> npm i zod-to-json-schema

// const ai = new GoogleGenAI({  // ek instance create kr rhe h, where we have to give API key
//     apiKey: process.env.GOOGLE_GENAI_API_KEY
// })
const Groq = require("groq-sdk");
const puppeteer = require("puppeteer");




const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});


//AI ke liye schema create kr rhe
const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),

    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),

    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),

    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})



async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    // const prompt = `Generate an interview report for a candidate with the following details:
    //                     Resume: ${resume}
    //                     Self Description: ${selfDescription}
    //                     Job Description: ${jobDescription}`



const prompt = `
You are an expert technical interviewer and hiring manager.

Analyze the candidate's resume, self-description, and job description.

Generate a detailed interview preparation report.

IMPORTANT INSTRUCTIONS:
1. Return ONLY valid JSON.
2. Do NOT include markdown, code blocks, explanations, or extra text.
3. Do NOT wrap the JSON inside triple backticks.
4. Ensure every required field is present.
5. The output must exactly match the following JSON structure.

{
  "matchScore": number,
  "technicalQuestions": [
    {
      "question": string,
      "intention": string,
      "answer": string
    }
  ],
  "behavioralQuestions": [
    {
      "question": string,
      "intention": string,
      "answer": string
    }
  ],
  "skillGaps": [
    {
      "skill": string,
      "severity": "low" | "medium" | "high"
    }
  ],
  "preparationPlan": [
    {
      "day": number,
      "focus": string,
      "tasks": [string]
    }
  ],
  "title": string
}

GUIDELINES:
- Calculate a realistic match score between 0 and 100.
- Generate 5 technical interview questions relevant to the job.
- Generate 5 behavioral interview questions.
- Explain why each question is asked.
- Provide detailed, interview-ready answers.
- Identify important missing skills.
- Assign an appropriate severity (low, medium, or high) to each skill gap.
- Create a 7-day preparation plan with practical tasks for each day.
- The title should be the target job role.

Candidate Resume:
${resume}

Candidate Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

    // const response = await ai.models.generateContent({
    //     model: "gemini-3-flash-preview",
    //     contents:prompt,
    //     config: {
    //         responseMimeType: "application/json",
    //         responseSchema: zodToJsonSchema(interviewReportSchema),
    //     }
    // })

    // console.log(response.text)


    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.3,
        response_format: {
            type: "json_object",
        },
    });

    const data = JSON.parse(response.choices[0].message.content);

    // console.log(data);/
    console.log(JSON.stringify(data, null, 2));

    return interviewReportSchema.parse(data);


}

async function generatePdfFromHtml(htmlContent) {

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
        waitUntil: "networkidle0"
    });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    });

    await browser.close();

    return pdfBuffer;
}

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {

    const prompt = `
You are an expert professional resume writer.

Generate a professional ATS-friendly resume based on the following information.

Candidate Resume:
${resume}

Candidate Self Description:
${selfDescription}

Job Description:
${jobDescription}

Requirements:

1. Return ONLY valid JSON.
2. The JSON must contain only one field:
{
    "html": "HTML content"
}

3. Generate complete HTML for the resume.
4. The resume should be ATS-friendly.
5. Keep it professional and simple.
6. Keep it within 1-2 pages.
7. Tailor the resume according to the job description.
8. Highlight relevant skills, projects and experience.
9. Do not invent any information.
10. Use proper sections such as:
   - Summary
   - Skills
   - Experience
   - Projects
   - Education
   - Certifications

The HTML should be directly usable by Puppeteer to generate a PDF.
`;

    const response = await groq.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [
            {
                role: "user",
                content: prompt
            }
        ],

        temperature: 0.2,

        response_format: {
            type: "json_object"
        }
    });

    const data = JSON.parse(
        response.choices[0].message.content
    );

    const pdfBuffer = await generatePdfFromHtml(data.html);

    return pdfBuffer;
}


// module.exports = generateInterviewReport
module.exports = {
    generateInterviewReport,generateResumePdf
};