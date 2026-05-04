/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { Camera, Upload, ShieldAlert, CheckCircle, AlertTriangle, FileText, Loader2, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzePrescription } from './services/geminiService';
import { AnalysisResult } from './types';

export default function App() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
          setResult(null);
          setError(null);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (images.length === 1) setResult(null);
  };

  const runAnalysis = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzePrescription(images);
      setResult(data);
    } catch (err) {
      setError("Có lỗi xảy ra khi phân tích đơn thuốc. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'risk': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'risk': return <ShieldAlert className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldAlert className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">BHYT AI Check</h1>
              <p className="text-xs text-slate-500 font-medium">Kiểm soát xuất toán Dược lâm sàng</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-400">
            <span>Thông tư 20/2022/TT-BYT</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Phân tích Đa đơn thuốc</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Các phần của đơn thuốc ({images.length})</h2>
                {images.length > 0 && (
                   <button 
                    onClick={() => { setImages([]); setResult(null); }}
                    className="text-[10px] uppercase font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
                   >
                     <RefreshCcw className="w-3 h-3" /> Xóa tất cả
                   </button>
                )}
              </div>
              
              <div 
                className={`transition-all overflow-hidden ${
                  images.length > 0 ? '' : 'aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer flex flex-col items-center justify-center gap-4'
                }`}
                onClick={() => images.length === 0 && fileInputRef.current?.click()}
              >
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto p-1">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 group bg-black">
                        <img src={img} alt={`Part ${idx + 1}`} className="w-full h-full object-contain" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                          className="absolute top-2 right-2 bg-rose-500/80 hover:bg-rose-500 text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <RefreshCcw className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded backdrop-blur-sm">
                          Ảnh {idx + 1}
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[3/4] rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-2 text-slate-400"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Thêm ảnh</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="text-blue-600 w-8 h-8" />
                    </div>
                    <p className="text-slate-600 font-medium">Tải lên các tài liệu liên quan</p>
                    <p className="text-slate-400 text-sm mt-1">Chụp toàn bộ đơn hoặc từng phần</p>
                  </div>
                )}
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                multiple
                className="hidden" 
              />

              <div className="mt-6">
                <button 
                  disabled={images.length === 0 || loading}
                  onClick={runAnalysis}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 disabled:shadow-none"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                  PHÂN TÍCH ĐƠN THUỐC ({images.length} ẢNH)
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
            </section>

            <section className="bg-blue-900 text-blue-50 p-6 rounded-2xl shadow-xl">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-blue-300" />
                Lưu ý quan trọng
              </h3>
              <p className="text-sm leading-relaxed opacity-90">
                Ứng dụng sử dụng mô hình trí tuệ nhân tạo để hỗ trợ rà soát. Kết quả mang tính chất tham khảo cho Dược sĩ lâm sàng. Vui lòng đối chiếu với văn bản pháp luật hiện hành trước khi quyết định.
              </p>
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-4 text-center min-h-[500px]"
                >
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                  <div>
                    <h3 className="text-xl font-bold">Đang xử lý dữ liệu...</h3>
                    <p className="text-slate-500 mt-2">AI đang đọc văn bản, trích xuất ICD-10 và đối chiếu Thông tư 20</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Summary Card */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <FileText className="w-32 h-32" />
                    </div>
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Kết luận chẩn đoán</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.icdCodes.map((code, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 font-bold border border-blue-100 rounded-md text-sm">
                          {code}
                        </span>
                      ))}
                    </div>
                    <p className="text-xl font-bold text-slate-800 leading-tight mb-2">{result.diagnosis}</p>
                    <p className="text-slate-600 text-sm italic">"{result.summary}"</p>
                  </div>

                  {/* Desktop Table View */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h2 className="text-sm font-semibold text-slate-700">Chi tiết đối chiếu BHYT</h2>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hợp lệ
                        </div>
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Cảnh báo
                        </div>
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span> Nguy cơ
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white text-slate-400 text-[11px] uppercase font-bold tracking-widest border-b border-slate-100">
                            <th className="px-6 py-4">Tên thuốc & Liều dùng</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4">Nguy cơ/Lý do</th>
                            <th className="px-6 py-4">Gợi ý ICD</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {result.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-bold text-slate-800">{item.medicineName}</p>
                                <p className="text-xs text-slate-500 font-medium">{item.dosage}</p>
                                <p className="text-[10px] mt-1 text-blue-500 font-bold">Mã ICD: {item.icdInPrescription || 'N/A'}</p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(item.bhytStatus)}`}>
                                  {getStatusIcon(item.bhytStatus)}
                                  {item.bhytStatus === 'valid' ? 'Hợp lệ' : item.bhytStatus === 'warning' ? 'Cảnh báo' : 'Nguy cơ'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-600 leading-relaxed min-w-[200px]">
                                {item.riskDetail}
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-mono font-bold">
                                  {item.suggestedIcd}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 border-dashed flex flex-col items-center justify-center gap-4 text-center text-slate-400 min-h-[500px]">
                  <div className="bg-slate-50 p-6 rounded-full">
                    <FileText className="w-16 h-16 opacity-20" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-500">Chưa có dữ liệu phân tích</h3>
                    <p className="max-w-xs mx-auto mt-2">Vui lòng tải ảnh đơn thuốc lên ở khung bên trái để bắt đầu rà soát xuất toán BHYT.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      
      <footer className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-400 text-xs font-medium border-t border-slate-200 mt-12">
        &copy; 2024 Clinical AI Assistant - BHYT Check Engine.
        <p className="mt-2">Hỗ trợ Dược lâm sàng tối ưu hóa chi phí thanh toán Bảo hiểm Y tế.</p>
      </footer>
    </div>
  );
}
