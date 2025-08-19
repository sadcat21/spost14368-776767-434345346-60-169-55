import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface TextExtractorProps {
  imageUrl?: string;
  onExtractedText?: (text: string) => void;
}

const contentTypes = [
  { value: "information", label: "معلومة" },
  { value: "quiz", label: "كويز" },
  { value: "question", label: "سؤال" },
  { value: "story", label: "قصة" },
  { value: "tip", label: "نصيحة" },
  { value: "fact", label: "حقيقة" },
  { value: "quote", label: "اقتباس" }
];

export const TextExtractor = ({ imageUrl, onExtractedText }: TextExtractorProps) => {
  const [extractedText, setExtractedText] = useState("");
  const [contentType, setContentType] = useState("information");
  const [isExtracting, setIsExtracting] = useState(false);
  const [markdownText, setMarkdownText] = useState("");

  const extractTextFromImage = async () => {
    if (!imageUrl) {
      toast.error("يرجى توفير رابط الصورة أولاً");
      return;
    }

    setIsExtracting(true);
    
    try {
      // Convert image to base64
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`فشل في تحميل الصورة: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/png;base64, prefix
        };
        reader.onerror = () => reject(new Error("فشل في قراءة الصورة"));
        reader.readAsDataURL(blob);
      });

      // استخدام Edge Function الآمنة
      const extractResponse = await fetch('https://msrtbumkztdwtoqysykf.supabase.co/functions/v1/gemini-text-extractor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          contentType: contentType
        })
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || `خطأ في الخدمة: ${extractResponse.status}`);
      }

      const data = await extractResponse.json();
      
      if (!data.success) {
        throw new Error(data.error || "فشل في استخراج النص");
      }
      
      setExtractedText(data.extractedText);
      setMarkdownText(data.markdownText);
      
      if (onExtractedText) {
        onExtractedText(data.markdownText);
      }
      
      toast.success("تم استخراج النص بنجاح!");
    } catch (error) {
      console.error("Error extracting text:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      toast.error(`فشل في استخراج النص: ${errorMessage}`);
    } finally {
      setIsExtracting(false);
    }
  };


  const getContentTypeLabel = (type: string) => {
    const typeObj = contentTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : "معلومة";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ النص");
  };

  const downloadAsMarkdown = () => {
    if (!markdownText) return;
    
    const blob = new Blob([markdownText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_text_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("تم تحميل الملف");
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          استخراج النص من الصورة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>نوع المحتوى</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع المحتوى" />
            </SelectTrigger>
            <SelectContent>
              {contentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={extractTextFromImage}
          disabled={isExtracting || !imageUrl}
          className="w-full bg-gradient-primary"
        >
          {isExtracting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري استخراج النص...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              استخراج النص
            </>
          )}
        </Button>

        {extractedText && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>النص المستخرج</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(extractedText)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={extractedText}
              readOnly
              rows={4}
              className="resize-none"
            />
          </div>
        )}

        {markdownText && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>النص بصيغة مارك دون</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(markdownText)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadAsMarkdown}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={markdownText}
              readOnly
              rows={8}
              className="resize-none font-mono text-sm"
              placeholder="سيظهر النص المنسق هنا..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};