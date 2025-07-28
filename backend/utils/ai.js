import OpenAI from 'openai';

// Initialize OpenAI client only if API key is available
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export const generateCareerReport = async (testAnswers, profile) => {
  const openai = getOpenAIClient();
  
  if (!openai) {
    console.log('OpenAI API key not configured, using fallback response');
    // Return fallback response when OpenAI is not configured
    return {
      careerSuggestions: [
        {
          title: "Software Developer",
          description: "Based on your technical interests and problem-solving skills",
          matchScore: 80,
          requirements: ["Programming", "Problem Solving", "Communication"],
          salary: "$60,000 - $120,000",
          growth: "High growth potential with continuous learning"
        },
        {
          title: "Data Analyst",
          description: "Your analytical thinking and attention to detail make this a great fit",
          matchScore: 75,
          requirements: ["Data Analysis", "Statistics", "Excel"],
          salary: "$50,000 - $90,000",
          growth: "Growing field with many opportunities"
        }
      ],
      skillGapAnalysis: {
        currentSkills: profile.skills || [],
        requiredSkills: ["Programming", "Data Analysis", "Communication"],
        missingSkills: ["Programming", "Data Analysis"],
        recommendedLearning: ["Python Programming", "Data Analysis Course"]
      },
      recommendations: [
        "Enroll in a programming bootcamp",
        "Take online courses in data analysis",
        "Build a portfolio of projects",
        "Network with professionals in your target field"
      ],
      strengths: ["Problem-solving", "Analytical thinking", "Attention to detail"],
      weaknesses: ["Limited technical skills", "Need for more experience"],
      opportunities: ["High demand for tech professionals", "Remote work opportunities"],
      threats: ["Competition from experienced developers", "Rapidly changing technology"]
    };
  }

  try {
    const prompt = `
    Based on the following career assessment test answers and user profile, generate a comprehensive career guidance report.
    
    Test Answers: ${JSON.stringify(testAnswers)}
    User Profile: ${JSON.stringify(profile)}
    
    Please provide a detailed analysis including:
    1. Career Suggestions (top 5 career paths with explanations)
    2. Skill Gap Analysis (current skills vs required skills)
    3. Recommendations (actionable steps)
    4. SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
    
    Format the response as JSON with the following structure:
    {
      "careerSuggestions": [
        {
          "title": "Career Title",
          "description": "Why this career fits",
          "matchScore": 85,
          "requirements": ["skill1", "skill2"],
          "salary": "Average salary range",
          "growth": "Growth potential"
        }
      ],
      "skillGapAnalysis": {
        "currentSkills": ["skill1", "skill2"],
        "requiredSkills": ["skill3", "skill4"],
        "missingSkills": ["skill3", "skill4"],
        "recommendedLearning": ["course1", "course2"]
      },
      "recommendations": [
        "Short-term action item 1",
        "Short-term action item 2",
        "Long-term goal 1",
        "Long-term goal 2"
      ],
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "opportunities": ["opportunity1", "opportunity2"],
      "threats": ["threat1", "threat2"]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional career counselor with expertise in career guidance and development. Provide practical, actionable advice based on assessment results."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('AI report generation error:', error);
    
    // Fallback response if AI fails
    return {
      careerSuggestions: [
        {
          title: "Software Developer",
          description: "Based on your technical interests and problem-solving skills",
          matchScore: 80,
          requirements: ["Programming", "Problem Solving", "Communication"],
          salary: "$60,000 - $120,000",
          growth: "High growth potential with continuous learning"
        },
        {
          title: "Data Analyst",
          description: "Your analytical thinking and attention to detail make this a great fit",
          matchScore: 75,
          requirements: ["Data Analysis", "Statistics", "Excel"],
          salary: "$50,000 - $90,000",
          growth: "Growing field with many opportunities"
        }
      ],
      skillGapAnalysis: {
        currentSkills: profile.skills || [],
        requiredSkills: ["Programming", "Data Analysis", "Communication"],
        missingSkills: ["Programming", "Data Analysis"],
        recommendedLearning: ["Python Programming", "Data Analysis Course"]
      },
      recommendations: [
        "Enroll in a programming bootcamp",
        "Practice data analysis with real projects",
        "Build a portfolio of your work",
        "Network with professionals in your target field"
      ],
      strengths: ["Problem Solving", "Attention to Detail"],
      weaknesses: ["Limited Technical Skills", "No Industry Experience"],
      opportunities: ["Remote Work Options", "High Demand Field"],
      threats: ["Competition", "Rapidly Changing Technology"]
    };
  }
};

export const analyzeTestAnswers = async (answers) => {
  const openai = getOpenAIClient();
  
  if (!openai) {
    console.log('OpenAI API key not configured, using fallback analysis');
    return {
      personalityTraits: ["Analytical", "Detail-oriented"],
      workPreferences: ["Structured environment", "Clear goals"],
      learningStyle: "Visual and hands-on",
      communicationStyle: "Direct and clear",
      leadershipPotential: "Moderate"
    };
  }

  try {
    const prompt = `
    Analyze the following career assessment test answers and provide insights about the person's:
    1. Personality traits
    2. Work preferences
    3. Learning style
    4. Communication style
    5. Leadership potential
    
    Test Answers: ${JSON.stringify(answers)}
    
    Provide a brief analysis in JSON format.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a career assessment expert. Analyze test answers to understand personality and work preferences."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Test analysis error:', error);
    return {
      personalityTraits: ["Analytical", "Detail-oriented"],
      workPreferences: ["Structured environment", "Clear goals"],
      learningStyle: "Visual and hands-on",
      communicationStyle: "Direct and clear",
      leadershipPotential: "Moderate"
    };
  }
}; 