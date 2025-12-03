
import React, { useState } from 'react';
import { CoffeeRecommendation, Cafe } from '../types';
import { Button } from './Button';
import { RotateCcw, Link, Check, Music, Utensils, Sparkles, Instagram, MapPin, Star, Clock } from 'lucide-react';

interface ResultProps {
  persona: CoffeeRecommendation;
  cafes: Cafe[];
  musicVideoId: string | null;
  onRetake: () => void;
}

// Custom Kakao Icon component
const KakaoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3C5.925 3 1 6.925 1 11.775C1 14.65 2.875 17.2 5.675 18.725C5.45 19.55 4.975 21.325 4.925 21.45C4.85 21.65 5.075 21.775 5.25 21.65C5.875 21.225 8.9 19.125 9.775 18.525C10.5 18.625 11.225 18.675 12 18.675C18.075 18.675 23 14.75 23 9.9C23 5.05 18.075 3 12 3Z"/>
  </svg>
);

export const Result: React.FC<ResultProps> = ({ persona, cafes, musicVideoId, onRetake }) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Prompt logic
  const finalVisualPrompt = `${persona.visualPrompt}, 3d render, cute character design, pixar style, soft lighting, 8k resolution, white background, single character, centered --no text`;
  const encodedPrompt = encodeURIComponent(finalVisualPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.random()}`;

  // Sanitize the URL
  const shareUrl = window.location.origin + window.location.pathname;
  
  const shareText = `[오늘의 커피] 오늘 나에게 딱 맞는 커피는? ☕\n\n${persona.coffeeName}: "${persona.tagline}"\n\n추천 받으러 가기 👇`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInstagramShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("링크가 복사되었습니다! 인스타그램 스토리에 공유해보세요.");
    } catch (err) {
      showToast("링크 복사에 실패했습니다.");
    }
  };

  const handleKakaoShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '오늘의 커피',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast("링크가 복사되었습니다! 카카오톡에 붙여넣기 해보세요.");
      } catch (err) {
        showToast("브라우저가 공유 기능을 지원하지 않습니다.");
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("링크가 클립보드에 복사되었습니다.");
    } catch (err) {
      alert('링크를 복사해주세요: ' + shareUrl);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 animate-fade-in-up relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-800 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-fade-in whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      {/* Character Card */}
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-amber-900/10 relative">
        
        {/* Decorative background element */}
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-amber-100 to-white z-0"></div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col items-center pt-8 pb-8 px-6">
          
          {/* Badge */}
          <div className="bg-amber-800 text-amber-50 font-bold px-4 py-1 rounded-full text-sm tracking-wider mb-4 shadow-md">
            Today's Pick
          </div>

          {/* Character Image */}
          <div className="relative w-64 h-64 mb-6 group">
            <div className="absolute inset-0 bg-amber-200 rounded-full opacity-20 blur-2xl animate-pulse"></div>
            <img 
              src={imageUrl} 
              alt={persona.coffeeName} 
              loading="lazy"
              className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 ease-out group-hover:scale-110"
            />
          </div>

          {/* Title Section */}
          <h1 className="text-3xl font-black text-stone-800 mb-2 text-center leading-tight break-keep">
            {persona.coffeeName}
          </h1>
          <p className="text-amber-700 font-bold text-center italic mb-6 text-lg break-keep">
            "{persona.tagline}"
          </p>

          {/* Traits */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {persona.traits.map((trait, i) => (
              <span key={i} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-sm font-bold border border-stone-200 shadow-sm">
                #{trait}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 w-full mb-8 shadow-inner">
            <p className="text-stone-700 leading-relaxed text-sm md:text-base break-keep text-center">
              {persona.description}
            </p>
          </div>

          {/* Stats / Styles */}
          <div className="w-full mb-8">
             <div className="flex items-center gap-2 mb-2 text-stone-400 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Today's Advice
             </div>
             <div className="bg-amber-50 text-amber-900 px-4 py-3 rounded-xl border border-amber-100 font-medium text-sm text-center break-keep">
               {persona.brewingStyle}
             </div>
          </div>

          {/* Pairing Section */}
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            {/* Snack Pairing */}
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex flex-col items-center text-center">
               <div className="bg-white p-2 rounded-full text-orange-500 shadow-sm mb-2">
                 <Utensils className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold text-orange-800 uppercase mb-1">With Snack</span>
               <span className="text-stone-800 font-bold text-sm break-keep leading-tight">
                 {persona.snackPairing}
               </span>
            </div>
            
            {/* Music Pairing */}
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex flex-col items-center text-center">
               <div className="bg-white p-2 rounded-full text-indigo-500 shadow-sm mb-2">
                 <Music className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold text-indigo-800 uppercase mb-1">With Music</span>
               <span className="text-stone-800 font-bold text-sm break-keep leading-tight">
                 {persona.musicPairing}
               </span>
            </div>
          </div>

          {/* Music Player - Only if ID exists */}
          {musicVideoId && (
            <div className="w-full mb-8 animate-fade-in">
              <div className="flex items-center gap-2 mb-3 text-stone-400 text-xs font-bold uppercase tracking-widest">
                <Music className="w-3 h-3" /> Now Playing
              </div>
              <div className="rounded-xl overflow-hidden shadow-md bg-black w-full aspect-video relative">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${musicVideoId}?autoplay=1&mute=1&controls=1&origin=${window.location.origin}`}
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <p className="text-xs text-stone-400 mt-2 text-center">
                * 자동 재생이 차단될 경우 음소거로 재생됩니다. 소리를 켜주세요.
              </p>
            </div>
          )}
          
          {/* Cafe Recommendations */}
          {cafes.length > 0 && (
            <div className="w-full mb-8">
              <div className="flex items-center gap-2 mb-3 text-stone-400 text-xs font-bold uppercase tracking-widest">
                 <MapPin className="w-3 h-3" /> 추천 카페
              </div>
              <div className="space-y-3">
                {cafes.map((cafe, idx) => (
                  <a 
                    key={idx}
                    href={cafe.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col p-4 bg-white border-2 border-stone-100 rounded-xl hover:border-amber-400 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-bold text-stone-800 text-lg group-hover:text-amber-800 line-clamp-1">{cafe.name}</span>
                      {cafe.rating && (
                        <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-lg">
                          <Star className="w-3 h-3 text-yellow-600 fill-yellow-600 mr-1" />
                          <span className="text-xs font-bold text-yellow-700">{cafe.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-stone-500 text-xs mb-1">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{cafe.address}</span>
                    </div>

                    {cafe.openStatus && (
                      <div className="flex items-center text-stone-400 text-xs">
                        <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{cafe.openStatus}</span>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="w-full border-t border-stone-100 pt-6 flex flex-col items-center gap-4">
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">
              오늘의 추천 공유하기
            </p>
            <div className="flex gap-4">
              {/* Instagram Button */}
              <button 
                onClick={handleInstagramShare}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
                aria-label="Share on Instagram"
              >
                <Instagram className="w-6 h-6" />
              </button>

              {/* KakaoTalk Button */}
              <button 
                onClick={handleKakaoShare}
                className="w-12 h-12 rounded-full bg-[#FEE500] text-[#000000] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
                aria-label="Share on KakaoTalk"
              >
                <KakaoIcon className="w-6 h-6" />
              </button>

              {/* Copy Link Button */}
              <button 
                onClick={handleCopyLink}
                className="w-12 h-12 rounded-full bg-stone-100 text-stone-600 hover:bg-amber-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg relative"
                aria-label="Copy Link"
              >
                {copied ? <Check className="w-6 h-6" /> : <Link className="w-6 h-6" />}
              </button>
            </div>
            
            <div className="w-full mt-4">
              <Button onClick={onRetake} variant="primary" className="w-full shadow-amber-900/20 py-4">
                <div className="flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  내일 다시 하기
                </div>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
