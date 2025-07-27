import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const questions = [
  {
    id: 1,
    question: "What type of work environment do you prefer?",
    options: [
      "Collaborative team environment",
      "Independent work with minimal supervision",
      "Dynamic, fast-paced environment",
      "Structured, organized environment"
    ]
  },
  {
    id: 2,
    question: "Which activity energizes you the most?",
    options: [
      "Solving complex problems",
      "Creating something new",
      "Helping and supporting others",
      "Leading and organizing projects"
    ]
  },
  {
    id: 3,
    question: "What motivates you most in a career?",
    options: [
      "Financial stability and growth",
      "Making a positive impact on society",
      "Personal growth and learning",
      "Recognition and achievement"
    ]
  },
  {
    id: 4,
    question: "How do you prefer to communicate?",
    options: [
      "Written communication (emails, reports)",
      "Face-to-face conversations",
      "Presentations to groups",
      "Visual/creative expression"
    ]
  },
  {
    id: 5,
    question: "What's your ideal work-life balance?",
    options: [
      "Clear separation between work and personal time",
      "Flexible schedule with remote work options",
      "Intense work periods followed by extended breaks",
      "Work that feels like a passion, less strict boundaries"
    ]
  }
];

export default function CareerTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('career_tests')
        .insert({
          user_id: user.id,
          answers: answers
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Career test completed successfully!",
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error submitting test:', error);
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnswered = answers[currentQ.id] !== undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Career Assessment Test</CardTitle>
          <CardDescription>
            Answer these questions to help us understand your career preferences
          </CardDescription>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
            <RadioGroup
              value={answers[currentQ.id] || ''}
              onValueChange={(value) => handleAnswer(currentQ.id, value)}
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!hasAnswered || loading}
              >
                {loading ? 'Submitting...' : 'Complete Test'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!hasAnswered}
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}