import express from 'express';
import { prisma } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateCareerPath } from '../middleware/validation.js';

const router = express.Router();

// GET /admin/dashboard
router.get('/dashboard', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    // Get admin dashboard statistics
    const stats = {
      totalUsers: await prisma.user.count({ where: { role: 'USER' } }),
      totalAdmins: await prisma.user.count({ where: { role: 'ADMIN' } }),
      totalProfiles: await prisma.profile.count({ where: { isCompleted: true } }),
      totalTests: await prisma.testResult.count({ where: { completed: true } }),
      totalReports: await prisma.report.count(),
      totalCareerPaths: await prisma.careerPath.count({ where: { isActive: true } })
    };

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      where: { role: 'USER' },
      include: {
        profile: {
          select: {
            fullName: true,
            isCompleted: true
          }
        },
        _count: {
          select: {
            testResults: true,
            reports: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get recent reports
    const recentReports = await prisma.report.findMany({
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      data: {
        stats,
        recentUsers: recentUsers.map(user => ({
          id: user.id,
          email: user.email,
          fullName: user.profile?.fullName || 'N/A',
          profileCompleted: user.profile?.isCompleted || false,
          testCount: user._count.testResults,
          reportCount: user._count.reports,
          createdAt: user.createdAt
        })),
        recentReports: recentReports.map(report => ({
          id: report.id,
          userEmail: report.user.email,
          userName: report.user.profile?.fullName || 'N/A',
          careerSuggestionsCount: report.careerSuggestions?.length || 0,
          createdAt: report.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /admin/users
router.get('/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const searchFilter = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { fullName: { contains: search, mode: 'insensitive' } } }
      ]
    } : {};

    // Get users with pagination
    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
        ...searchFilter
      },
      include: {
        profile: {
          select: {
            fullName: true,
            age: true,
            education: true,
            isCompleted: true
          }
        },
        _count: {
          select: {
            testResults: true,
            reports: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    // Get total count for pagination
    const totalUsers = await prisma.user.count({
      where: {
        role: 'USER',
        ...searchFilter
      }
    });

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          fullName: user.profile?.fullName || 'N/A',
          age: user.profile?.age || 'N/A',
          education: user.profile?.education || 'N/A',
          profileCompleted: user.profile?.isCompleted || false,
          testCount: user._count.testResults,
          reportCount: user._count.reports,
          createdAt: user.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /admin/users/:userId
router.get('/users/:userId', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        testResults: {
          orderBy: { createdAt: 'desc' }
        },
        reports: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          profile: user.profile,
          testResults: user.testResults,
          reports: user.reports
        }
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /admin/careers
router.post('/careers', authenticateToken, requireRole(['ADMIN']), validateCareerPath, async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      skills,
      salary,
      growth,
      demand
    } = req.body;

    const careerPath = await prisma.careerPath.create({
      data: {
        title,
        description,
        requirements,
        skills,
        salary,
        growth,
        demand,
        createdBy: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Career path created successfully',
      data: {
        careerPath: {
          id: careerPath.id,
          title: careerPath.title,
          description: careerPath.description,
          requirements: careerPath.requirements,
          skills: careerPath.skills,
          salary: careerPath.salary,
          growth: careerPath.growth,
          demand: careerPath.demand,
          isActive: careerPath.isActive,
          createdAt: careerPath.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Create career path error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /admin/careers
router.get('/careers', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const searchFilter = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const careerPaths = await prisma.careerPath.findMany({
      where: searchFilter,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        createdByUser: {
          select: {
            email: true
          }
        }
      }
    });

    const totalCareerPaths = await prisma.careerPath.count({
      where: searchFilter
    });

    res.json({
      success: true,
      data: {
        careerPaths: careerPaths.map(path => ({
          id: path.id,
          title: path.title,
          description: path.description,
          requirements: path.requirements,
          skills: path.skills,
          salary: path.salary,
          growth: path.growth,
          demand: path.demand,
          isActive: path.isActive,
          createdBy: path.createdByUser?.email || 'Unknown',
          createdAt: path.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCareerPaths,
          totalPages: Math.ceil(totalCareerPaths / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get career paths error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /admin/careers/:id
router.put('/careers/:id', authenticateToken, requireRole(['ADMIN']), validateCareerPath, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      requirements,
      skills,
      salary,
      growth,
      demand,
      isActive
    } = req.body;

    const careerPath = await prisma.careerPath.update({
      where: { id },
      data: {
        title,
        description,
        requirements,
        skills,
        salary,
        growth,
        demand,
        isActive,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Career path updated successfully',
      data: {
        careerPath: {
          id: careerPath.id,
          title: careerPath.title,
          description: careerPath.description,
          requirements: careerPath.requirements,
          skills: careerPath.skills,
          salary: careerPath.salary,
          growth: careerPath.growth,
          demand: careerPath.demand,
          isActive: careerPath.isActive,
          updatedAt: careerPath.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update career path error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /admin/careers/:id
router.delete('/careers/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.careerPath.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Career path deleted successfully'
    });
  } catch (error) {
    console.error('Delete career path error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 