import express from 'express';
import { prisma } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateTestSubmission } from '../middleware/validation.js';
import { analyzeTestAnswers } from '../utils/ai.js';

const router = express.Router();

// POST /test/submit
router.post('/submit', authenticateToken, requireRole(['USER']), validateTestSubmission, async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user.id;

    // Analyze test answers using AI
    const analysis = await analyzeTestAnswers(answers);

    // Calculate a basic score based on answer patterns
    const score = calculateTestScore(answers);

    // Create or update test result
    const testResult = await prisma.testResult.upsert({
      where: {
        userId: userId
      },
      update: {
        answers,
        score,
        completed: true,
        updatedAt: new Date()
      },
      create: {
        userId,
        answers,
        score,
        completed: true
      }
    });

    res.json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        testResult: {
          id: testResult.id,
          score: testResult.score,
          completed: testResult.completed,
          createdAt: testResult.createdAt
        },
        analysis
      }
    });
  } catch (error) {
    console.error('Test submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /test/status
router.get('/status', authenticateToken, requireRole(['USER']), async (req, res) => {
  try {
    const userId = req.user.id;

    const testResult = await prisma.testResult.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        hasCompletedTest: testResult?.completed || false,
        lastTestDate: testResult?.createdAt || null,
        score: testResult?.score || null
      }
    });
  } catch (error) {
    console.error('Test status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /test/questions
router.get('/questions', authenticateToken, requireRole(['USER']), async (req, res) => {
  try {
    // Sample career assessment questions
    const questions = [
      {
        id: 1,
        question: "How do you prefer to spend your free time?",
        type: "multiple_choice",
        options: [
          { value: "reading", label: "Reading books or articles" },
          { value: "socializing", label: "Meeting with friends and family" },
          { value: "creative", label: "Creating something (art, music, writing)" },
          { value: "technical", label: "Working with technology or solving problems" },
          { value: "outdoor", label: "Outdoor activities and sports" }
        ]
      },
      {
        id: 2,
        question: "What type of work environment do you prefer?",
        type: "multiple_choice",
        options: [
          { value: "structured", label: "Highly structured with clear rules" },
          { value: "flexible", label: "Flexible and adaptable" },
          { value: "creative", label: "Creative and innovative" },
          { value: "fast_paced", label: "Fast-paced and dynamic" },
          { value: "quiet", label: "Quiet and focused" }
        ]
      },
      {
        id: 3,
        question: "How do you handle stress and pressure?",
        type: "multiple_choice",
        options: [
          { value: "planning", label: "I plan ahead and stay organized" },
          { value: "adapting", label: "I adapt quickly to changing situations" },
          { value: "collaborating", label: "I work with others to find solutions" },
          { value: "analyzing", label: "I analyze the problem systematically" },
          { value: "taking_breaks", label: "I take breaks and maintain work-life balance" }
        ]
      },
      {
        id: 4,
        question: "What motivates you most in your work?",
        type: "multiple_choice",
        options: [
          { value: "recognition", label: "Recognition and appreciation" },
          { value: "learning", label: "Learning new skills and knowledge" },
          { value: "helping_others", label: "Helping others and making a difference" },
          { value: "achievement", label: "Achieving goals and seeing results" },
          { value: "creativity", label: "Creative expression and innovation" }
        ]
      },
      {
        id: 5,
        question: "What are your strongest skills? (Select all that apply)",
        type: "checkbox",
        options: [
          { value: "communication", label: "Communication and interpersonal skills" },
          { value: "analytical", label: "Analytical and problem-solving skills" },
          { value: "creative", label: "Creative and artistic skills" },
          { value: "technical", label: "Technical and computer skills" },
          { value: "leadership", label: "Leadership and management skills" },
          { value: "organization", label: "Organization and planning skills" }
        ]
      },
      {
        id: 6,
        question: "What is your preferred learning style?",
        type: "multiple_choice",
        options: [
          { value: "visual", label: "Visual (diagrams, charts, videos)" },
          { value: "auditory", label: "Auditory (listening, discussions)" },
          { value: "kinesthetic", label: "Hands-on (practical experience)" },
          { value: "reading", label: "Reading and writing" },
          { value: "mixed", label: "A combination of different methods" }
        ]
      },
      {
        id: 7,
        question: "What type of problems do you enjoy solving?",
        type: "multiple_choice",
        options: [
          { value: "technical", label: "Technical and logical problems" },
          { value: "people", label: "People and relationship problems" },
          { value: "creative", label: "Creative and design problems" },
          { value: "business", label: "Business and strategic problems" },
          { value: "research", label: "Research and analytical problems" }
        ]
      },
      {
        id: 8,
        question: "How do you prefer to work with others?",
        type: "multiple_choice",
        options: [
          { value: "team_leader", label: "Leading and coordinating teams" },
          { value: "team_member", label: "Working as part of a team" },
          { value: "collaborator", label: "Collaborating with others on equal terms" },
          { value: "independent", label: "Working independently" },
          { value: "mentor", label: "Teaching and mentoring others" }
        ]
      },
      {
        id: 9,
        question: "What are your career goals for the next 5 years?",
        type: "text",
        placeholder: "Describe your career aspirations..."
      },
      {
        id: 10,
        question: "What industries interest you most? (Select all that apply)",
        type: "checkbox",
        options: [
          { value: "technology", label: "Technology and IT" },
          { value: "healthcare", label: "Healthcare and Medicine" },
          { value: "finance", label: "Finance and Banking" },
          { value: "education", label: "Education and Training" },
          { value: "marketing", label: "Marketing and Advertising" },
          { value: "engineering", label: "Engineering and Manufacturing" },
          { value: "creative", label: "Creative Arts and Media" },
          { value: "government", label: "Government and Public Service" }
        ]
      }
    ];

    res.json({
      success: true,
      data: {
        questions,
        totalQuestions: questions.length
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to calculate test score
function calculateTestScore(answers) {
  let score = 0;
  const totalQuestions = 10;
  
  // Simple scoring logic - can be enhanced based on specific requirements
  answers.forEach((answer, index) => {
    if (answer && answer.value) {
      // Basic scoring: each answered question gets points
      score += 10;
    }
  });
  
  return Math.min(100, score);
}

export default router; 