import express from 'express';
import { prisma } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateProfile } from '../middleware/validation.js';

const router = express.Router();

// POST /profile
router.post('/', authenticateToken, requireRole(['USER']), validateProfile, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      age,
      gender,
      education,
      experience,
      interests,
      skills,
      goals,
      location,
      phone
    } = req.body;

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        fullName,
        age: age ? parseInt(age) : null,
        gender,
        education,
        experience,
        interests: interests || [],
        skills: skills || [],
        goals,
        location,
        phone,
        isCompleted: true,
        updatedAt: new Date()
      },
      create: {
        userId,
        fullName,
        age: age ? parseInt(age) : null,
        gender,
        education,
        experience,
        interests: interests || [],
        skills: skills || [],
        goals,
        location,
        phone,
        isCompleted: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: {
          id: profile.id,
          fullName: profile.fullName,
          age: profile.age,
          gender: profile.gender,
          education: profile.education,
          experience: profile.experience,
          interests: profile.interests,
          skills: profile.skills,
          goals: profile.goals,
          location: profile.location,
          phone: profile.phone,
          isCompleted: profile.isCompleted,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /profile
router.get('/', authenticateToken, requireRole(['USER']), async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          fullName: profile.fullName,
          age: profile.age,
          gender: profile.gender,
          education: profile.education,
          experience: profile.experience,
          interests: profile.interests,
          skills: profile.skills,
          goals: profile.goals,
          location: profile.location,
          phone: profile.phone,
          avatar: profile.avatar,
          isCompleted: profile.isCompleted,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PATCH /profile
router.patch('/', authenticateToken, requireRole(['USER']), async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Convert age to number if provided
    if (updateData.age) {
      updateData.age = parseInt(updateData.age);
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: {
          id: profile.id,
          fullName: profile.fullName,
          age: profile.age,
          gender: profile.gender,
          education: profile.education,
          experience: profile.experience,
          interests: profile.interests,
          skills: profile.skills,
          goals: profile.goals,
          location: profile.location,
          phone: profile.phone,
          avatar: profile.avatar,
          isCompleted: profile.isCompleted,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Profile patch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /profile/status
router.get('/status', authenticateToken, requireRole(['USER']), async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        isCompleted: true,
        fullName: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: {
        hasProfile: !!profile,
        isCompleted: profile?.isCompleted || false,
        profileCreatedAt: profile?.createdAt || null,
        profileUpdatedAt: profile?.updatedAt || null
      }
    });
  } catch (error) {
    console.error('Profile status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 