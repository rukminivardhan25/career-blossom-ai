import express from 'express';
import { prisma } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /dashboard
router.get('/', authenticateToken, requireRole(['USER']), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data with all related information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        testResults: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get career paths for recommendations
    const careerPaths = await prisma.careerPath.findMany({
      where: { isActive: true },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    // Calculate progress percentage
    let progressPercentage = 0;
    if (user.profile?.isCompleted) progressPercentage += 33;
    if (user.testResults.length > 0 && user.testResults[0].completed) progressPercentage += 33;
    if (user.reports.length > 0) progressPercentage += 34;

    // Prepare dashboard data
    const dashboardData = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      progress: {
        percentage: progressPercentage,
        steps: {
          profileCompleted: user.profile?.isCompleted || false,
          testCompleted: user.testResults.length > 0 && user.testResults[0].completed,
          reportGenerated: user.reports.length > 0
        }
      },
      testResult: user.testResults.length > 0 ? {
        score: user.testResults[0].score,
        completedAt: user.testResults[0].createdAt
      } : null,
      report: user.reports.length > 0 ? {
        id: user.reports[0].id,
        careerSuggestions: user.reports[0].careerSuggestions,
        skillGapAnalysis: user.reports[0].skillGapAnalysis,
        recommendations: user.reports[0].recommendations,
        strengths: user.reports[0].strengths,
        weaknesses: user.reports[0].weaknesses,
        opportunities: user.reports[0].opportunities,
        threats: user.reports[0].threats,
        createdAt: user.reports[0].createdAt
      } : null,
      careerPaths: careerPaths.map(path => ({
        id: path.id,
        title: path.title,
        description: path.description,
        skills: path.skills,
        salary: path.salary,
        growth: path.growth,
        demand: path.demand
      })),
      stats: {
        totalUsers: await prisma.user.count({ where: { role: 'USER' } }),
        totalReports: await prisma.report.count(),
        totalCareerPaths: await prisma.careerPath.count({ where: { isActive: true } })
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /dashboard/stats
router.get('/stats', authenticateToken, requireRole(['USER']), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user-specific stats
    const userStats = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            testResults: true,
            reports: true
          }
        }
      }
    });

    // Get global stats
    const globalStats = {
      totalUsers: await prisma.user.count({ where: { role: 'USER' } }),
      totalAdmins: await prisma.user.count({ where: { role: 'ADMIN' } }),
      totalProfiles: await prisma.profile.count({ where: { isCompleted: true } }),
      totalTests: await prisma.testResult.count({ where: { completed: true } }),
      totalReports: await prisma.report.count(),
      totalCareerPaths: await prisma.careerPath.count({ where: { isActive: true } })
    };

    res.json({
      success: true,
      data: {
        userStats: {
          testCount: userStats._count.testResults,
          reportCount: userStats._count.reports
        },
        globalStats
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /dashboard/recent-activity
router.get('/recent-activity', authenticateToken, requireRole(['USER']), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent activity for the user
    const recentActivity = [];

    // Get recent test results
    const recentTests = await prisma.testResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    recentTests.forEach(test => {
      recentActivity.push({
        type: 'test',
        action: 'Completed career assessment',
        date: test.createdAt,
        details: `Score: ${test.score}%`
      });
    });

    // Get recent reports
    const recentReports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    recentReports.forEach(report => {
      recentActivity.push({
        type: 'report',
        action: 'Generated career report',
        date: report.createdAt,
        details: `${report.careerSuggestions?.length || 0} career suggestions`
      });
    });

    // Get profile updates
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { updatedAt: true }
    });

    if (profile) {
      recentActivity.push({
        type: 'profile',
        action: 'Updated profile',
        date: profile.updatedAt,
        details: 'Profile information updated'
      });
    }

    // Sort by date and take top 10
    const sortedActivity = recentActivity
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        recentActivity: sortedActivity
      }
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 