import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ReviewResult {
  overallScore: number;
  logoReview: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  textReview: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  compositionReview: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  recommendations: string[];
}

interface GeminiReviewManagerProps {
  contentCanvasRef: React.RefObject<HTMLDivElement>;
}

const GeminiReviewManager: React.FC<GeminiReviewManagerProps> = ({
  contentCanvasRef
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);

  const captureCanvas = async (): Promise<string | null> => {
    if (!contentCanvasRef.current) {
      toast.error('لا يمكن العثور على اللوحة للتحليل');
      return null;
    }

    try {
      const canvas = await html2canvas(contentCanvasRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('خطأ في التقاط الصورة:', error);
      toast.error('فشل في التقاط صورة للتحليل');
      return null;
    }
  };

  const analyzeWithGemini = async (imageData: string): Promise<ReviewResult | null> => {
    try {
      const response = await fetch('/api/gemini-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          analysisType: 'comprehensive_review'
        })
      });

      if (!response.ok) {
        throw new Error('فشل في التحليل');
      }

      const result = await response.json();
      return result.review;
    } catch (error) {
      console.error('خطأ في التحليل:', error);
      return null;
    }
  };

  const handleReviewAnalysis = async () => {
    setIsAnalyzing(true);
    toast.info('جاري تحليل التعديلات...');

    try {
      const imageData = await captureCanvas();
      if (!imageData) {
        setIsAnalyzing(false);
        return;
      }

      const analysis = await analyzeWithGemini(imageData);
      
      if (analysis) {
        setReviewResult(analysis);
        toast.success('تم الانتهاء من تحليل التعديلات');
      } else {
        // محاكاة نتائج للتطوير
        const mockResult: ReviewResult = {
          overallScore: 85,
          logoReview: {
            score: 90,
            feedback: 'الشعار موضوع بشكل جيد وواضح',
            suggestions: ['تحسين التباين قليلاً', 'تجربة موضع أعلى قليلاً']
          },
          textReview: {
            score: 80,
            feedback: 'النص واضح ومقروء لكن يحتاج تحسين في الموضع',
            suggestions: ['تحريك النص إلى اليسار قليلاً', 'زيادة حجم الخط']
          },
          compositionReview: {
            score: 85,
            feedback: 'التركيب العام متوازن ومناسب',
            suggestions: ['تحسين التوزيع البصري', 'إضافة مساحة أكثر حول العناصر']
          },
          recommendations: [
            'التعديلات المطبقة جيدة بشكل عام',
            'يُنصح بتحسين موضع النص قليلاً',
            'الشعار في موضع ممتاز'
          ]
        };
        setReviewResult(mockResult);
        toast.success('تم الانتهاء من تحليل التعديلات (محاكاة)');
      }
    } catch (error) {
      console.error('خطأ في التحليل:', error);
      toast.error('فشل في تحليل التعديلات');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            مراجعة Gemini للتعديلات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleReviewAnalysis}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? 'جاري التحليل...' : 'تحليل ومراجعة التعديلات'}
          </Button>
        </CardContent>
      </Card>

      {reviewResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              نتائج المراجعة
              <Badge variant="outline" className={`${getScoreColor(reviewResult.overallScore)} flex items-center gap-1`}>
                {getScoreIcon(reviewResult.overallScore)}
                {reviewResult.overallScore}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* مراجعة الشعار */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">تقييم الشعار</h4>
                <Badge variant="outline" className={`${getScoreColor(reviewResult.logoReview.score)} flex items-center gap-1`}>
                  {getScoreIcon(reviewResult.logoReview.score)}
                  {reviewResult.logoReview.score}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{reviewResult.logoReview.feedback}</p>
              {reviewResult.logoReview.suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium">اقتراحات التحسين:</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                    {reviewResult.logoReview.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* مراجعة النص */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">تقييم النص</h4>
                <Badge variant="outline" className={`${getScoreColor(reviewResult.textReview.score)} flex items-center gap-1`}>
                  {getScoreIcon(reviewResult.textReview.score)}
                  {reviewResult.textReview.score}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{reviewResult.textReview.feedback}</p>
              {reviewResult.textReview.suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium">اقتراحات التحسين:</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                    {reviewResult.textReview.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* مراجعة التركيب */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">تقييم التركيب العام</h4>
                <Badge variant="outline" className={`${getScoreColor(reviewResult.compositionReview.score)} flex items-center gap-1`}>
                  {getScoreIcon(reviewResult.compositionReview.score)}
                  {reviewResult.compositionReview.score}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{reviewResult.compositionReview.feedback}</p>
              {reviewResult.compositionReview.suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium">اقتراحات التحسين:</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                    {reviewResult.compositionReview.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* التوصيات العامة */}
            {reviewResult.recommendations.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">التوصيات العامة</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  {reviewResult.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeminiReviewManager;