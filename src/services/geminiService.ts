import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzePrescription(imagesBase64: string[]): Promise<AnalysisResult> {
  const prompt = `
    Bạn là một chuyên gia Dược lâm sàng và giám định BHYT tại Việt Nam.
    Nhiệm vụ: Phân tích các ảnh được cung cấp. ĐÂY LÀ CÁC PHẦN CỦA CÙNG MỘT ĐƠN THUỐC (hoặc cùng một đợt điều trị của một bệnh nhân).
    Hãy kết hợp thông tin từ tất cả các ảnh để trích xuất đầy đủ:
    - Danh sách chẩn đoán và toàn bộ mã ICD-10 có trong đơn.
    - Danh sách các loại thuốc, hàm lượng và liều dùng.

    Quy tắc đối chiếu BHYT:
    1. Kiểm tra sự phù hợp giữa Thuốc và Chẩn đoán (Mã ICD-10). Toàn bộ mã ICD-10 trích xuất được từ mọi ảnh đều có thể dùng để đối chiếu cho bất kỳ thuốc nào trong đơn.
    2. Dựa trên Thông tư 20/2022/TT-BYT.
    3. Trả về kết quả dưới dạng JSON theo cấu trúc sau:
    {
      "diagnosis": "Tên chẩn đoán tổng hợp từ tất cả các phần của đơn",
      "icdCodes": ["Mã ICD trích xuất 1", "Mã ICD trích xuất 2"],
      "items": [
        {
          "medicineName": "Tên thuốc",
          "dosage": "Liều dùng",
          "icdInPrescription": "Mã ICD tương ứng trong đơn (nếu có ghi cạnh thuốc hoặc suy luận từ chẩn đoán chung)",
          "bhytStatus": "valid" | "warning" | "risk",
          "riskDetail": "Lý do cụ thể tại sao có nguy cơ xuất toán (ví dụ: Thuốc 'A' không có mã ICD phù hợp trong danh sách mã 'B, C' đã trích xuất)",
          "suggestedIcd": "Gợi ý mã ICD-10 đúng để hợp lý hóa thanh toán"
        }
      ],
      "summary": "Tổng kết ngắn gọn về tính hợp lệ BHYT của đơn thuốc này"
    }

    Lưu ý quan trọng: 
    - bhytStatus: 'valid' (Hợp lệ), 'warning' (Cần kiểm tra), 'risk' (Nguy cơ xuất toán).
    - Phản hồi CHỈ bao gồm mã JSON, không thêm văn bản thừa.
  `;

  try {
    const inlineData = imagesBase64.map(base64 => ({
      inlineData: {
        data: base64.split(",")[1],
        mimeType: "image/jpeg",
      },
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        ...inlineData.map(data => ({
          inlineData: data.inlineData
        }))
      ],
    });

    const responseText = response.text || "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AnalysisResult;
    }
    throw new Error("Không thể phân tích dữ liệu từ AI");
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}
