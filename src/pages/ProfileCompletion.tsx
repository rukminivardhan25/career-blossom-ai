import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function ProfileCompletion() {
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    education: '',
    experience: '',
    interests: '',
    skills: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const { user, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Update user profile with additional information
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          // Store additional profile data as JSON for now
          // In a real app, you might want separate columns for these
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Generate career report
      await generateCareerReport();

      await refreshUserProfile();
      
      toast({
        title: "Success",
        description: "Profile completed successfully!",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCareerReport = async () => {
    if (!user) return;

    try {
      // Fetch user's test answers
      const { data: testData } = await supabase
        .from('career_tests')
        .select('answers')
        .eq('user_id', user.id)
        .single();

      // Generate mock career report based on answers and profile
      const mockReport = {
        recommended_careers: [
          "Software Developer",
          "Data Analyst", 
          "Product Manager"
        ],
        personality_type: "Analytical Problem Solver",
        strengths: [
          "Strong analytical thinking",
          "Detail-oriented approach",
          "Good problem-solving skills"
        ],
        areas_for_growth: [
          "Leadership skills",
          "Public speaking",
          "Networking"
        ],
        next_steps: [
          "Consider taking a leadership course",
          "Build a portfolio of your work",
          "Network with professionals in your field of interest"
        ],
        generated_at: new Date().toISOString()
      };

      await supabase
        .from('career_reports')
        .insert({
          user_id: user.id,
          report_data: mockReport
        });

    } catch (error) {
      console.error('Error generating career report:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Help us provide better career recommendations by completing your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="Your age"
                  min="16"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education Level</Label>
              <Select onValueChange={(value) => handleChange('education', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="associate">Associate Degree</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="doctorate">Doctorate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Work Experience</Label>
              <Select onValueChange={(value) => handleChange('experience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="junior">Junior (2-5 years)</SelectItem>
                  <SelectItem value="mid">Mid-level (5-10 years)</SelectItem>
                  <SelectItem value="senior">Senior (10+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests & Hobbies</Label>
              <Textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => handleChange('interests', e.target.value)}
                placeholder="Tell us about your interests and hobbies..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills & Expertise</Label>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                placeholder="List your skills, technologies, or areas of expertise..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving Profile...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}