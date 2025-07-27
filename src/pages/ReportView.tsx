import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, FileText, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function ReportView() {
  const { userId } = useParams();
  const [careerReport, setCareerReport] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { userProfile: currentUserProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchReportAndProfile();
    }
  }, [userId]);

  const fetchReportAndProfile = async () => {
    if (!userId) return;

    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      // Fetch career report
      const { data: report, error: reportError } = await supabase
        .from('career_reports')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (reportError) throw reportError;
      setCareerReport(report);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentUserProfile?.role === 'mentor') {
      navigate('/mentor/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!careerReport || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Report Not Found</CardTitle>
            <CardDescription>
              The requested career report could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reportData = careerReport.report_data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">Career Report</h1>
            <span className="text-muted-foreground">for {userProfile.full_name}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-primary" />
                <CardTitle>User Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {userProfile.full_name}</p>
                  <p><strong>Email:</strong> {userProfile.email}</p>
                </div>
                <div>
                  <p><strong>Joined:</strong> {new Date(userProfile.created_at).toLocaleDateString()}</p>
                  <p><strong>Report Generated:</strong> {new Date(careerReport.generated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Report Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Personalized Career Report</CardTitle>
              </div>
              <CardDescription>
                AI-generated career insights based on assessment and profile
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Recommended Careers */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle>Recommended Careers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.recommended_careers?.map((career: string, index: number) => (
                    <Badge key={index} variant="secondary" className="block w-fit">
                      {career}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personality Type */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Personality Type</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{reportData.personality_type}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reportData.strengths?.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Areas for Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {reportData.areas_for_growth?.map((area: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Recommended Next Steps</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {reportData.next_steps?.map((step: string, index: number) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}