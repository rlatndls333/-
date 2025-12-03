
import React, { useState } from 'react';
import { QUESTIONS } from './constants';
import { ScreenState, CoffeeRecommendation, UserSelection, Cafe } from './types';
import { Quiz } from './components/Quiz';
import { Result } from './components/Result';
import { Button } from './components/Button';
import { generateRecommendation, searchNearbyCafes, searchYoutubeId } from './services/geminiService';
import { Coffee, Loader2 } from 'lucide-react';

function App() {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.LANDING);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selection, setSelection] = useState<UserSelection>({ 
    mood: '', 
    weather: '', 
    situation: '', 
    physical: '',
    temp: '',
    caffeine: '',
    sweetness: '',
    flavor: '',
    texture: '',
    volume: '',
    pairing: '',
    vibe: ''
  });
  const [result, setResult] = useState<CoffeeRecommendation | null>(null);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [musicVideoId, setMusicVideoId] = useState<string | null>(null);

  const startQuiz = () => {
    setScreen(ScreenState.QUIZ);
    setCurrentQuestionIndex(0);
    setSelection({ 
      mood: '', 
      weather: '', 
      situation: '', 
      physical: '',
      temp: '',
      caffeine: '',
      sweetness: '',
      flavor: '',
      texture: '',
      volume: '',
      pairing: '',
      vibe: ''
    });
    setResult(null);
    setCafes([]);
    setMusicVideoId(null);
  };

  const handleAnswer = (value: string) => {
    const currentCategory = QUESTIONS[currentQuestionIndex].category;
    const nextSelection = { ...selection };

    switch (currentCategory) {
      case 'MOOD': nextSelection.mood = value; break;
      case 'WEATHER': nextSelection.weather = value; break;
      case 'SITUATION': nextSelection.situation = value; break;
      case 'PHYSICAL': nextSelection.physical = value; break;
      case 'TEMP': nextSelection.temp = value; break;
      case 'CAFFEINE': nextSelection.caffeine = value; break;
      case 'SWEETNESS': nextSelection.sweetness = value; break;
      case 'FLAVOR': nextSelection.flavor = value; break;
      case 'TEXTURE': nextSelection.texture = value; break;
      case 'VOLUME': nextSelection.volume = value; break;
      case 'PAIRING': nextSelection.pairing = value; break;
      case 'VIBE': nextSelection.vibe = value; break;
    }
    
    setSelection(nextSelection);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz(nextSelection);
    }
  };

  const getUserLocation = (): Promise<{lat: number, lng: number} | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Geolocation error or denied:", error);
          resolve(null);
        },
        { timeout: 5000 }
      );
    });
  };

  const finishQuiz = async (finalSelection: UserSelection) => {
    setScreen(ScreenState.LOADING);

    try {
      // 1. Generate Coffee Recommendation
      const recommendation = await generateRecommendation(finalSelection);
      setResult(recommendation);

      // 2. Parallel: Get location for cafes & search music video ID
      const locationPromise = getUserLocation();
      const musicPromise = searchYoutubeId(recommendation.musicPairing);
      
      const [location, videoId] = await Promise.all([locationPromise, musicPromise]);
      
      setMusicVideoId(videoId);

      // 3. Search Cafes if location available
      if (location) {
        const nearbyCafes = await searchNearbyCafes(location.lat, location.lng, recommendation.coffeeName);
        setCafes(nearbyCafes);
      } else {
        setCafes([]);
      }

      setScreen(ScreenState.RESULT);
    } catch (error) {
      console.error("Error generating recommendation:", error);
      setScreen(ScreenState.ERROR);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-sans text-stone-800">
      <main className="flex-grow flex flex-col relative container mx-auto px-4">
        {screen === ScreenState.LANDING && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div className="mb-6 p-6 bg-white rounded-full shadow-xl shadow-amber-900/10 transform hover:scale-105 transition-transform duration-300 ring-1 ring-amber-100">
              <Coffee className="w-16 h-16 text-amber-700" strokeWidth={1.5} />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-amber-950 mb-3 tracking-tight drop-shadow-sm break-keep">
              오커머?
            </h1>
            
            <p className="text-lg md:text-xl text-stone-500 font-medium mb-10 tracking-wide">
              오늘 커피 머먹징?
            </p>

            <p className="text-base text-stone-600 max-w-md mb-12 leading-relaxed font-light">
              오늘 당신의 기분과 날씨, 컨디션까지.<br />
              12가지 질문으로 나에게 딱 맞는 완벽한 한 잔을 찾아보세요.
            </p>
            
            <Button onClick={startQuiz} className="text-lg px-12 py-4 shadow-xl shadow-amber-900/20">
              추천받기
            </Button>
          </div>
        )}

        {screen === ScreenState.QUIZ && (
          <Quiz
            question={QUESTIONS[currentQuestionIndex]}
            currentStep={currentQuestionIndex}
            totalSteps={QUESTIONS.length}
            onAnswer={handleAnswer}
          />
        )}

        {screen === ScreenState.LOADING && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-pulse">
            <div className="relative mb-8">
              <Loader2 className="w-20 h-20 text-amber-600 animate-spin opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Coffee className="w-8 h-8 text-amber-700" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-900 mb-4">
              최고의 한 잔을 내리는 중...
            </h2>
            <p className="text-stone-500 text-lg">
              당신의 12가지 취향을 분석하고, 주변의 멋진 카페를 찾고 있습니다.
              <br/>
              <span className="text-sm text-stone-400 mt-2 block">(위치 권한을 허용하면 주변 카페를 추천해드립니다)</span>
            </p>
          </div>
        )}

        {screen === ScreenState.RESULT && result && (
          <Result
            persona={result}
            cafes={cafes}
            musicVideoId={musicVideoId}
            onRetake={startQuiz}
          />
        )}
        
        {screen === ScreenState.ERROR && (
           <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
             <h2 className="text-2xl font-bold text-stone-800 mb-4">오류가 발생했습니다.</h2>
             <Button onClick={startQuiz}>다시 시도하기</Button>
           </div>
        )}
      </main>
      
      <footer className="py-8 text-center text-stone-400 text-sm">
        <p>오커머? (Today's Coffee) © 2024</p>
        <p className="text-xs mt-1 opacity-70">Powered by Google Gemini</p>
      </footer>
    </div>
  );
}

export default App;
