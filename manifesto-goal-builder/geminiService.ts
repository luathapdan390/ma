
import { GoogleGenAI, Modality } from "@google/genai";
import { GoalFormState } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGoalPicture = async (data: GoalFormState): Promise<string> => {
  const prompt = `
    Hãy viết một bức tranh mục tiêu tài chính 30 ngày đầy cảm hứng, sống động và ở thời hiện tại dựa trên các thông tin sau:
    - Ngày đạt mục tiêu: ${data.targetDate}
    - Tên: ${data.fullName}
    - Lợi nhuận: ${data.profitGoal} VNĐ
    - Tài khoản nhận tiền: ${data.bankAccount}
    - Giây phút tiền về: ${data.moneySound}
    - Ở đâu: ${data.location}
    - Giác quan chủ đạo: ${data.dominantSense}
    - Ở với ai: ${data.companion}
    - Tuổi của người ấy: ${data.companionAge}
    - Người ấy đang làm gì: ${data.companionActivity}
    - Ai nhắn tin chúc mừng: ${data.congratulators}
    - Họ gọi tôi là (xưng hô thân mật): ${data.informalTitle}
    - Nhắn tin vào đâu (cộng đồng): ${data.platform}
    - Họ gọi tôi là (danh hiệu chuyên nghiệp): ${data.professionalTitle}

    YÊU CẦU QUAN TRỌNG:
    - KHÔNG viết đoạn chào hỏi xã giao ở đầu. 
    - Bắt đầu TRỰC TIẾP vào nội dung bức tranh.
    - KHÔNG có các ký tự tiêu đề như "***" hay "BỨC TRANH MỤC TIÊU...".

    Yêu cầu cấu trúc bài viết:
    1. Mở đầu: "Hôm nay ngày ${data.targetDate}, tôi ${data.fullName} đang ở ${data.location} cùng với ${data.companion} ${data.companionAge} của mình. ${data.companion} đang ${data.companionActivity}..."
    2. Lồng ghép khéo léo 6 nhu cầu của Tony Robbins (Chắc chắn, Đa dạng, Ý nghĩa, Kết nối/Yêu thương, PHÁT TRIỂN, CỐNG HIẾN). Nhu cầu PHÁT TRIỂN thể hiện qua việc nâng cao tư duy, nhu cầu CỐNG HIẾN thể hiện qua việc giúp đỡ người khác.
    3. Mô tả sống động bằng 6 giác quan (Nhìn, Nghe, Ngửi, Nếm, Chạm, Cảm xúc). 
    4. Đặc biệt thêm 3 câu liên tiếp về giác quan chủ đạo (${data.dominantSense}). Ví dụ nếu là nghe: "Tôi nghe..., Tôi nghe..., Tôi nghe..."
    5. Khoảnh khắc cao trào: Tiếng ${data.moneySound} vang lên, mở điện thoại thấy thông báo từ tài khoản ${data.bankAccount}, tiền về đúng con số ${data.profitGoal} VNĐ.
    6. Những người sau đây nhắn tin chúc mừng: ${data.congratulators}. Trích dẫn lời chúc của họ gọi bạn là ${data.informalTitle} và ${data.professionalTitle}.
    7. Hành động gửi tin nhắn vào ${data.platform} và nhận hàng trăm lời chúc mừng dành cho ${data.professionalTitle}.
    8. Kết thúc bắt buộc (không được thay đổi): "Cảm ơn chủ tịch Liên Minh Câu Lạc Bộ Tri Thức và Sách thầy tài phiệt Mr. Eric Lê, cảm ơn chủ tịch Đoàn Mai Ly, Chủ tịch Khúc Quang Vương, cảm ơn Doanh Nhân Hồng Nga, cảm ơn doanh nhân Lê Trường, cảm ơn tiềm thức."

    Hãy viết bằng văn phong giàu cảm xúc, năng lượng cao, truyền cảm hứng.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
        thinkingConfig: { thinkingBudget: 2000 }
    }
  });

  return response.text || "";
};

export const generateSpeech = async (text: string): Promise<Uint8Array> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Đọc diễn cảm văn bản sau với giọng tràn đầy năng lượng và niềm tin: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Không thể tạo audio");
  
  return decodeBase64(base64Audio);
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
}

export function createWavFile(audioBuffer: AudioBuffer): Blob {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); 
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); 
    setUint16(1); 
    setUint16(numOfChan);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numOfChan); 
    setUint16(numOfChan * 2); 
    setUint16(16); 

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); 

    for (i = 0; i < audioBuffer.numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset])); 
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; 
            view.setInt16(pos, sample, true); 
            pos += 2;
        }
        offset++;
    }

    return new Blob([buffer], { type: "audio/wav" });

    function setUint16(data: number) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data: number) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}
