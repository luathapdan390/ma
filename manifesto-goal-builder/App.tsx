
import React, { useState, useRef } from 'react';
import { GoalFormState, SenseType } from './types';
import { generateGoalPicture, generateSpeech, decodeAudioData, createWavFile } from './geminiService';

const App: React.FC = () => {
  const [formData, setFormData] = useState<GoalFormState>({
    targetDate: '31/01/2026',
    fullName: 'Hồng Linh',
    profitGoal: '60,000,000',
    bankAccount: 'BIDV 777',
    moneySound: 'ting ting',
    location: 'Khách sạn Emissary Central Hotel & Spa Hà Nội',
    dominantSense: 'Nghe',
    companion: 'con trai',
    companionAge: '17 tuổi',
    companionActivity: 'đang thưởng thức món tôm hùm siêu đỉnh',
    congratulators: 'doanh nhân Lê Trường, doanh nhân Hồng Nga, chủ tịch Đoàn Mai Ly',
    informalTitle: 'bạn',
    platform: 'Zoom Liên Minh',
    professionalTitle: 'doanh nhân Hồng Linh'
  });

  const [generatedText, setGeneratedText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setAudioUrl(null);
    try {
      const text = await generateGoalPicture(formData);
      setGeneratedText(text);
    } catch (error) {
      console.error("Error generating text:", error);
      alert("Đã có lỗi xảy ra khi tạo văn bản. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateAudio = async () => {
    if (!generatedText) return;
    setIsSpeaking(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const pcmData = await generateSpeech(generatedText);
      const audioBuffer = await decodeAudioData(pcmData, audioContextRef.current, 24000, 1);
      
      const wavBlob = createWavFile(audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (error) {
      console.error("Error generating audio:", error);
      alert("Đã có lỗi xảy ra khi tạo audio. Vui lòng thử lại.");
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleDownloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `Muc_Tieu_30_Ngay_${formData.fullName}.wav`;
      a.click();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-900 text-slate-100">
      <header className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent mb-4">
          Manifesto Goal Builder
        </h1>
        <p className="text-slate-400 text-lg">Kiến tạo bức tranh mục tiêu 30 ngày đầy cảm hứng</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <section className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-amber-400 mb-6 flex items-center">
            <span className="mr-2">📝</span> Thông Tin Mục Tiêu
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Ngày Đạt Mục Tiêu</label>
                <input
                  type="text"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 31/01/2026"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Họ Và Tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Hồng Linh"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Lợi Nhuận (VNĐ)</label>
                <input
                  type="text"
                  name="profitGoal"
                  value={formData.profitGoal}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 60,000,000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Tài Khoản Nhận</label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: BIDV 777"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Giây Phút Tiền Về</label>
                <input
                  type="text"
                  name="moneySound"
                  value={formData.moneySound}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: ting ting"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Ở Đâu (Địa điểm)</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ví dụ: Khách sạn Emissary Central..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Giác Quan Chủ Đạo</label>
                <select
                  name="dominantSense"
                  value={formData.dominantSense}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all appearance-none"
                >
                  {Object.values(SenseType).map(sense => (
                    <option key={sense} value={sense}>{sense}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Ở Với Ai</label>
                <input
                  type="text"
                  name="companion"
                  value={formData.companion}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: con trai"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Người Ấy Bao Nhiêu Tuổi</label>
                <input
                  type="text"
                  name="companionAge"
                  value={formData.companionAge}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 17 tuổi"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Người Ấy Đang Làm Gì</label>
                <input
                  type="text"
                  name="companionActivity"
                  value={formData.companionActivity}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: đang thưởng thức tôm hùm..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Ai Nhắn Tin Chúc Mừng</label>
              <input
                type="text"
                name="congratulators"
                value={formData.congratulators}
                onChange={handleInputChange}
                placeholder="Ví dụ: Lê Trường, Hồng Nga..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Họ Gọi Bạn Là Gì (Thân mật)</label>
                <input
                  type="text"
                  name="informalTitle"
                  value={formData.informalTitle}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: bạn"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Cộng Đồng Nhắn Tin</label>
                <input
                  type="text"
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Zoom Liên Minh"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Họ Gọi Bạn Là Gì (Chuyên nghiệp)</label>
              <input
                type="text"
                name="professionalTitle"
                value={formData.professionalTitle}
                onChange={handleInputChange}
                placeholder="Ví dụ: doanh nhân Hồng Linh"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-6 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang Khởi Tạo...</span>
                </>
              ) : (
                <>
                  <span>✨ Tạo Bức Tranh Mục Tiêu</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Output Section */}
        <section className="flex flex-col space-y-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm flex-grow relative">
            <h2 className="text-xl font-semibold text-amber-400 mb-6 flex items-center">
              <span className="mr-2">🖼️</span> Bức Tranh Mục Tiêu Của Bạn
            </h2>
            
            <div className="prose prose-invert max-w-none h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-slate-800">
              {generatedText ? (
                <div className="whitespace-pre-wrap leading-relaxed text-slate-300">
                  {generatedText}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 italic space-y-4">
                  <div className="text-5xl opacity-20">✨</div>
                  <p>Hãy điền thông tin và nhấn nút tạo để xem bức tranh của bạn</p>
                </div>
              )}
            </div>

            {generatedText && (
              <div className="mt-6 flex flex-wrap gap-4 pt-6 border-t border-slate-700">
                <button
                  onClick={handleCreateAudio}
                  disabled={isSpeaking}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  {isSpeaking ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Đang tạo Audio...</span>
                    </>
                  ) : (
                    <>
                      <span>🎧 Nghe Audio</span>
                    </>
                  )}
                </button>

                {audioUrl && (
                  <button
                    onClick={handleDownloadAudio}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <span>📥 Tải Audio</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-sm text-amber-200 leading-relaxed italic">
            "Sức mạnh của tâm trí nằm ở hình ảnh và cảm xúc. Khi bạn viết xuống và nghe thấy bức tranh của mình hàng ngày, tiềm thức sẽ vận hành để biến nó thành sự thật."
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-20 pb-10 text-center text-slate-500 text-sm border-t border-slate-800 pt-8">
        <p>© 2024 Manifesto Goal Builder. Phát triển bởi trí tuệ nhân tạo Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
