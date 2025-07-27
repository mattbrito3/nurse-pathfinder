import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FlashcardComponent } from '@/components/flashcards/FlashcardComponent';
import { useFlashcards } from '@/hooks/useFlashcards';
import { 
  ArrowLeft, 
  Pause, 
  Play, 
  SkipForward, 
  Trophy, 
  Clock, 
  Target,
  CheckCircle,
  XCircle,
  BarChart3,
  Home
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface StudySessionData {
  id: string;
  session_type: string;
  category_id: string | null;
  cards_studied: number;
  cards_correct: number;
  cards_incorrect: number;
  total_time_seconds: number;
  started_at: string;
}

interface StudyCard {
  flashcard_id: string;
  front: string;
  back: string;
  category_name: string;
  difficulty_level: number;
  mastery_level: number;
  times_seen: number;
}

const StudyPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { 
    submitResponse, 
    endStudySession,
    getStudyCards,
    isSubmittingResponse 
  } = useFlashcards();

  // State management
  const [sessionData, setSessionData] = useState<StudySessionData | null>(null);
  const [studyCards, setStudyCards] = useState<StudyCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    totalTime: 0
  });
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [startTime] = useState(Date.now());

  // Load session data and cards
  useEffect(() => {
    if (!sessionId) {
      navigate('/dashboard/flashcards');
      return;
    }

    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      // Get session info from localStorage or use defaults
      const sessionInfo = sessionStorage.getItem(`study_session_${sessionId}`);
      let sessionType: 'review' | 'learning' | 'practice' = 'learning';
      let categoryId: string | undefined;

      if (sessionInfo) {
        const parsed = JSON.parse(sessionInfo);
        sessionType = parsed.sessionType || 'learning'; // Changed from 'review' to 'learning'
        categoryId = parsed.categoryId;
        
        // 🔍 DEBUG: Log session type and category
        console.log('📚 STUDY SESSION DEBUG:', {
          sessionType,
          categoryId,
          sessionInfo: parsed
        });
      } else {
        // If no session info, default to learning
        sessionType = 'learning';
        console.log('📚 No session info found, defaulting to learning mode');
      }

      const isRandomExploration = !categoryId && sessionType === 'practice';

      // Create session data
      const session: StudySessionData = {
        id: sessionId!,
        session_type: sessionType,
        category_id: categoryId || null,
        cards_studied: 0,
        cards_correct: 0,
        cards_incorrect: 0,
        total_time_seconds: 0,
        started_at: new Date().toISOString()
      };

      setSessionData(session);
      
      // Load real cards from database
      const cards = await getStudyCards(sessionType, categoryId, 10);

      if (cards.length === 0) {
        // Fallback to mock data if no cards available
        const mockCards: StudyCard[] = [
          {
            flashcard_id: 'mock_1',
            front: 'Qual a dose usual de Paracetamol para adultos?',
            back: '500-1000mg a cada 6-8h, máximo 4g/dia',
            category_name: 'Farmacologia',
            difficulty_level: 2,
            mastery_level: 0,
            times_seen: 0
          },
          {
            flashcard_id: 'mock_2',
            front: 'Quantas câmaras tem o coração humano?',
            back: '4 câmaras: 2 átrios (direito e esquerdo) e 2 ventrículos (direito e esquerdo)',
            category_name: 'Anatomia',
            difficulty_level: 1,
            mastery_level: 1,
            times_seen: 2
          }
        ];
        setStudyCards(mockCards);
      } else {
        setStudyCards(cards);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      console.error('🚨 Detailed error:', JSON.stringify(error, null, 2));
      // Don't auto-redirect, show error state instead
      setStudyCards([]);
    }
  };

  const handleCardResponse = async (quality: number, responseTime: number) => {
    if (!sessionId || !currentCard) return;

    try {
      const wasCorrect = quality >= 3;
      
      // Submit response
      await submitResponse({
        flashcardId: currentCard.flashcard_id,
        response: {
          quality,
          response_time_ms: responseTime,
          was_correct: wasCorrect,
          review_type: 'scheduled'
        },
        sessionId
      });

      // Update session stats
      setSessionStats(prev => ({
        correct: prev.correct + (wasCorrect ? 1 : 0),
        incorrect: prev.incorrect + (wasCorrect ? 0 : 1),
        totalTime: prev.totalTime + responseTime
      }));

      // Move to next card or complete session with small delay
      setTimeout(() => {
        if (currentCardIndex < studyCards.length - 1) {
          console.log('📈 Avançando para próximo card:', currentCardIndex + 1);
          setCurrentCardIndex(prev => prev + 1);
        } else {
          console.log('🏁 Finalizando sessão');
          completeSession();
        }
      }, 300); // Small delay to ensure state reset
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const completeSession = async () => {
    if (!sessionId) return;

    try {
      await endStudySession(sessionId);
      setIsSessionComplete(true);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleSkipCard = () => {
    console.log('⏭️ Pulando card:', currentCardIndex);
    setTimeout(() => {
      if (currentCardIndex < studyCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        completeSession();
      }
    }, 100);
  };

  const currentCard = studyCards[currentCardIndex];
  const progress = studyCards.length > 0 ? ((currentCardIndex + 1) / studyCards.length) * 100 : 0;
  const accuracy = sessionStats.correct + sessionStats.incorrect > 0 
    ? (sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100 
    : 0;

  // Debug logging
  console.log('🎯 Current card index:', currentCardIndex);
  console.log('📚 Total cards:', studyCards.length);
  console.log('📄 Current card:', currentCard?.front);

  // Session completion screen
  if (isSessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-green-500 rounded-full w-fit">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Sessão Concluída! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{studyCards.length}</div>
                <div className="text-sm text-muted-foreground">Cartões Estudados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{sessionStats.correct}</div>
                <div className="text-sm text-muted-foreground">Corretas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{sessionStats.incorrect}</div>
                <div className="text-sm text-muted-foreground">Incorretas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{accuracy.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Precisão</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Precisão da sessão</span>
                <span>{accuracy.toFixed(1)}%</span>
              </div>
              <Progress value={accuracy} className="h-3" />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/dashboard/flashcards')}
                className="flex-1"
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Flashcards
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (!sessionData || !currentCard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando sessão de estudo...</p>
        </div>
      </div>
    );
  }

      return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard/flashcards')}
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair do Estudo</span>
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {sessionData.session_type === 'review' ? 'Revisão' : 'Aprendizado'}
              </Badge>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {currentCardIndex + 1}/{studyCards.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="h-3 w-3 sm:h-4 sm:w-4" /> : <Pause className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipCard}
            >
              <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Study Area */}
      <main className="container mx-auto px-4 py-8">
        {!isPaused ? (
          <FlashcardComponent
            key={`flashcard-${currentCardIndex}-${currentCard.flashcard_id}`}
            flashcard={{
              ...currentCard,
              id: currentCard.flashcard_id // Map flashcard_id to id
            }}
            onResponse={handleCardResponse}
            isLoading={isSubmittingResponse}
            sessionProgress={{
              current: currentCardIndex + 1,
              total: studyCards.length,
              correct: sessionStats.correct,
              incorrect: sessionStats.incorrect
            }}
          />
        ) : (
          // Pause screen
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="py-12">
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-500 rounded-full w-fit mx-auto">
                    <Pause className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Estudo Pausado
                    </h2>
                    <p className="text-gray-600">
                      Tome seu tempo. Clique em continuar quando estiver pronto.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {currentCardIndex + 1}/{studyCards.length}
                      </div>
                      <div className="text-xs text-gray-600">Progresso</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {sessionStats.correct}
                      </div>
                      <div className="text-xs text-gray-600">Corretas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">
                        {sessionStats.incorrect}
                      </div>
                      <div className="text-xs text-gray-600">Incorretas</div>
                    </div>
                  </div>

                  <Button onClick={() => setIsPaused(false)} size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Continuar Estudo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Progress Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur border-t p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Progresso da Sessão
            </span>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {sessionStats.correct}
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                {sessionStats.incorrect}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500" />
                {Math.floor((Date.now() - startTime) / 1000 / 60)}min
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default StudyPage;