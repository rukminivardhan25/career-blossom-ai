import express from 'express';
import { prisma } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { generateCareerReport } from '../utils/ai.js';

const router = express.Router();

// POST /report/generate
router.post('/generate', authenticateToken, requireRole(['USER']), async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has completed test and profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        testResults: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user.profile?.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Profile must be completed before generating report'
      });
    }

    if (!user.testResults.length || !user.testResults[0].completed) {
      return res.status(400).json({
        success: false,
        message: 'Career test must be completed before generating report'
      });
    }

    // Check if report already exists
    const existingReport = await prisma.report.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Report already exists for this user'
      });
    }

    // Generate AI career report
    const aiReport = await generateCareerReport(
      user.testResults[0].answers,
      user.profile
    );

    // Save report to database
    const report = await prisma.report.create({
      data: {
        userId,
        careerSuggestions: aiReport.careerSuggestions,
        skillGapAnalysis: aiReport.skillGapAnalysis,
        recommendations: aiReport.recommendations,
        strengths: aiReport.strengths,
        weaknesses: aiReport.weaknesses,
        opportunities: aiReport.opportunities,
        threats: aiReport.threats
      }
    });

    res.json({
      success: true,
      message: 'Career report generated successfully',
      data: {
        report: {
          id: report.id,
          careerSuggestions: report.careerSuggestions,
          skillGapAnalysis: report.skillGapAnalysis,
          recommendations: report.recommendations,
          strengths: report.strengths,
          weaknesses: report.weaknesses,
          opportunities: report.opportunities,
          threats: report.threats,
          createdAt: report.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /report
router.get('/', authenticateToken, requireRole(['USER']), async (req, res) => {
  try {
    const userId = req.user.id;

    const report = await prisma.report.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No report found for this user'
      });
    }

    res.json({
      success: true,
      data: {
        report: {
          id: report.id,
          careerSuggestions: report.careerSuggestions,
          skillGapAnalysis: report.skillGapAnalysis,
          recommendations: report.recommendations,
          strengths: report.strengths,
          weaknesses: report.weaknesses,
          opportunities: report.opportunities,
          threats: report.threats,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /report/:userId (Admin only)
router.get('/:userId', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;

    const report = await prisma.report.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                fullName: true,
                age: true,
                education: true
              }
            }
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No report found for this user'
      });
    }

    res.json({
      success: true,
      data: {
        report: {
          id: report.id,
          user: report.user,
          careerSuggestions: report.careerSuggestions,
          skillGapAnalysis: report.skillGapAnalysis,
          recommendations: report.recommendations,
          strengths: report.strengths,
          weaknesses: report.weaknesses,
          opportunities: report.opportunities,
          threats: report.threats,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get report by userId error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /report/regenerate
router.post('/regenerate', authenticateToken, requireRole(['USER']), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        testResults: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user.profile?.isCompleted || !user.testResults.length || !user.testResults[0].completed) {
      return res.status(400).json({
        success: false,
        message: 'Profile and test must be completed before regenerating report'
      });
    }

    // Generate new AI report
    const aiReport = await generateCareerReport(
      user.testResults[0].answers,
      user.profile
    );

    // Update existing report or create new one
    const report = await prisma.report.upsert({
      where: {
        userId: userId
      },
      update: {
        careerSuggestions: aiReport.careerSuggestions,
        skillGapAnalysis: aiReport.skillGapAnalysis,
        recommendations: aiReport.recommendations,
        strengths: aiReport.strengths,
        weaknesses: aiReport.weaknesses,
        opportunities: aiReport.opportunities,
        threats: aiReport.threats,
        updatedAt: new Date()
      },
      create: {
        userId,
        careerSuggestions: aiReport.careerSuggestions,
        skillGapAnalysis: aiReport.skillGapAnalysis,
        recommendations: aiReport.recommendations,
        strengths: aiReport.strengths,
        weaknesses: aiReport.weaknesses,
        opportunities: aiReport.opportunities,
        threats: aiReport.threats
      }
    });

    res.json({
      success: true,
      message: 'Career report regenerated successfully',
      data: {
        report: {
          id: report.id,
          careerSuggestions: report.careerSuggestions,
          skillGapAnalysis: report.skillGapAnalysis,
          recommendations: report.recommendations,
          strengths: report.strengths,
          weaknesses: report.weaknesses,
          opportunities: report.opportunities,
          threats: report.threats,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Report regeneration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 