import { GoogleGenAI, Type, Content } from "@google/genai";
import { QuizData, MathNews } from "../types";

let genAIInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (genAIInstance) return genAIInstance;

  // The API key must be obtained exclusively from the environment variable process.env.API_KEY
  genAIInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return genAIInstance;
};

// Fallback data when API Quota is exceeded
const FALLBACK_NEWS_ITEMS: MathNews[] = [
  {
    title: "Vẻ đẹp của Số Vô Tỉ",
    content: "Số Pi ($\\pi$) là một số vô tỉ nổi tiếng. Nó kéo dài vô tận và không bao giờ lặp lại quy luật. Bạn không thể viết chính xác số Pi dưới dạng phân số!",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80"
  },
  {
    title: "Định lý Pythagoras",
    content: "Trong một tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông ($a^2 + b^2 = c^2$). Đây là nền tảng của hình học phẳng.",
    imageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80"
  },
  {
    title: "Xác suất trong đời sống",
    content: "Khi tung một đồng xu, xác suất ra mặt ngửa là 50%. Lý thuyết xác suất giúp chúng ta dự đoán thời tiết, kết quả trò chơi và rủi ro đầu tư.",
    imageUrl: "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?w=800&q=80"
  },
  {
    title: "Hình học Fractal",
    content: "Nhiều vật thể trong tự nhiên như bông tuyết, bờ biển, mạch máu có cấu trúc Fractal - hình dạng lặp lại ở mọi quy mô.",
    imageUrl: "https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?w=800&q=80"
  },
  {
    title: "René Descartes và Hệ tọa độ",
    content: "Hệ trục tọa độ $Oxy$ giúp chúng ta biểu diễn các hình học bằng đại số. Nó được đặt theo tên nhà toán học lỗi lạc René Descartes.",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80"
  }
];

// Clean JSON string from Markdown code blocks often returned by LLMs
const cleanJsonString = (str: string): string => {
  if (!str) return "{}";
  let cleaned = str.trim();
  // Remove ```json and ``` wrapping
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned.trim();
};

export const generateQuiz = async (topic: string, description: string): Promise<QuizData> => {
  try {
    const ai = getAI();
    const prompt = `
      Tạo đề kiểm tra Toán 7 (Sách Kết nối tri thức) cho bài: "${topic} - ${description}".
      
      YÊU CẦU ĐẶC BIỆT VỀ FORMAT TOÁN HỌC:
      - Sử dụng định dạng LaTeX đặt trong dấu $ cho tất cả các công thức toán học.
      - Ví dụ: "Tính $\\frac{1}{2} + \\frac{3}{4}$" hoặc "Cho tam giác $\\Delta ABC$ vuông tại $A$".
      - Không dùng văn bản thường cho các ký hiệu toán học.
      
      Cấu trúc đề BẮT BUỘC như sau (Tổng 10 điểm):
      
      1. Phần 1: Trắc nghiệm (3.0 điểm). 
         - 12 câu hỏi. Mỗi câu 0.25đ.
         - Chọn 1 đáp án đúng trong 4 phương án A,B,C,D.
         - Kèm theo giải thích ngắn gọn (explanation) có sử dụng LaTeX.
         
      2. Phần 2: Đúng/Sai (4.0 điểm).
         - 4 câu hỏi lớn. Mỗi câu hỏi lớn gồm 1 đề dẫn và 4 ý con (a,b,c,d).
         - Yêu cầu: Đề dẫn phải là một TÌNH HUỐNG THỰC TẾ (ví dụ: lãi suất ngân hàng, đo đạc đất đai, tỉ lệ bản đồ, xác suất gieo xúc xắc...).
         - Mỗi ý con đúng được 0.25đ. Tổng 16 ý con.
         - Kèm theo giải thích cho từng ý (explanation) có sử dụng LaTeX.
         
      3. Phần 3: Trả lời ngắn (3.0 điểm).
         - 6 câu hỏi. Mỗi câu 0.5đ.
         - Yêu cầu: Câu hỏi phải là bài toán đố có yếu tố THỰC TẾ.
         - QUAN TRỌNG: Kết quả BẮT BUỘC phải là MỘT CON SỐ (Số tự nhiên, số hữu tỉ hoặc số thập phân).
         - Trường 'correctAnswer' CHỈ ĐƯỢC CHỨA SỐ (ví dụ: "15", "2.5", "-10", "-3/4"), KHÔNG được chứa đơn vị hay chữ cái.
         - Kèm theo giải thích/cách giải (explanation) có sử dụng LaTeX.
         
      Yêu cầu chung:
      - Nội dung bám sát sách giáo khoa Kết nối tri thức Toán 7.
      - Câu hỏi đa dạng: Nhận biết, Thông hiểu, Vận dụng.
      - Trả về JSON thuần túy.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Bạn là chuyên gia soạn đề Toán 7. Trả về JSON hợp lệ. Sử dụng LaTeX ($...$) cho công thức toán.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            part1: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "question", "options", "correctAnswerIndex"]
              }
            },
            part2: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  stem: { type: Type.STRING },
                  statements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.INTEGER },
                        statement: { type: Type.STRING },
                        isTrue: { type: Type.BOOLEAN },
                        explanation: { type: Type.STRING }
                      },
                      required: ["id", "statement", "isTrue"]
                    }
                  }
                },
                required: ["id", "stem", "statements"]
              }
            },
            part3: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "question", "correctAnswer"]
              }
            }
          },
          required: ["topic", "part1", "part2", "part3"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanJsonString(response.text)) as QuizData;
    }
    throw new Error("Không nhận được dữ liệu từ Gemini");

  } catch (error) {
    console.error("Lỗi tạo đề:", error);
    throw error;
  }
};

export const generateMathNews = async (): Promise<MathNews> => {
  try {
    const ai = getAI();
    // Step 1: Generate Text Content
    const textPrompt = `
      Hãy tạo một bản tin ngắn thú vị về toán học dành cho học sinh lớp 7. 
      Nội dung có thể về: số vô tỉ, hình học phẳng, ứng dụng của xác suất, hoặc tiểu sử nhà toán học.
      Sử dụng LaTeX ($...$) cho các công thức toán học.
      
      Trả về JSON gồm:
      - title: Tiêu đề hấp dẫn.
      - content: Nội dung ngắn gọn (khoảng 3-4 câu).
      - imagePrompt: Một mô tả chi tiết bằng tiếng ANH để dùng cho AI vẽ ảnh minh họa (colorful, 3d render style, suitable for education).
    `;

    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: textPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }
          },
          required: ["title", "content", "imagePrompt"]
        }
      }
    });

    const newsData = JSON.parse(cleanJsonString(textResponse.text || "{}"));
    if (!newsData.title) throw new Error("Invalid news data");

    // Step 2: Generate Image using the prompt from Step 1
    let imageUrl: string | undefined = undefined;
    try {
      const imageResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: newsData.imagePrompt }],
        },
        config: {
          imageConfig: {
             aspectRatio: "16:9"
          }
        }
      });

      // Find image part
      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (imgError) {
      console.warn("Image generation failed (likely quota), skipping image.", imgError);
    }

    return {
      title: newsData.title,
      content: newsData.content,
      imageUrl: imageUrl
    };

  } catch (error: any) {
    const isQuotaError = error.status === 429 || error.message?.includes('quota') || error.message?.includes('429');
    if (isQuotaError) {
       console.warn("Gemini API Quota Exceeded for News. Using fallback content.");
    } else {
       console.error("Error generating news:", error);
    }

    const randomIndex = Math.floor(Math.random() * FALLBACK_NEWS_ITEMS.length);
    return FALLBACK_NEWS_ITEMS[randomIndex];
  }
};

export const getChatResponse = async (history: Content[], newMessage: string): Promise<string> => {
  try {
    const ai = getAI();
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `
          Bạn là "Gia Sư Toán 7" - một trợ lý ảo thân thiện, vui vẻ dành cho học sinh lớp 7 học sách "Kết nối tri thức với cuộc sống".
          
          Nhiệm vụ của bạn:
          1. Giải đáp thắc mắc về Toán học lớp 7.
          2. Nếu học sinh hỏi đáp án bài tập, KHÔNG ĐƯỢC trả lời ngay kết quả. Hãy gợi ý từng bước.
          3. SỬ DỤNG LATEX ($...$) cho mọi công thức toán học (phân số, số mũ, độ, ...).
          4. Luôn khích lệ, động viên tinh thần học tập.
          
          Lưu ý: Giữ câu trả lời ngắn gọn, súc tích (dưới 150 từ).
        `
      },
      history: history
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Xin lỗi, thầy chưa nghe rõ câu hỏi. Em nhắc lại được không? 😅";
  } catch (error) {
    console.error("Chat error:", error);
    return "Hệ thống đang bận một chút, em thử lại sau nhé!";
  }
};