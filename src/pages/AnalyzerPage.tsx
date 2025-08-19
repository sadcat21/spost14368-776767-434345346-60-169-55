import { InfographicAnalyzer } from "@/components/InfographicAnalyzer";
import { Settings } from "lucide-react";

const AnalyzerPage = () => {
  const handleUseTemplate = (content: string, imageUrl: string) => {
    // معالجة استخدام القالب
    console.log("Using template:", { content, imageUrl });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Settings className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">محلل المحتوى والصور</h1>
            <p className="text-muted-foreground">تحليل شامل للمحتوى البصري واستخراج البيانات</p>
          </div>
        </div>
      </div>
      
      <InfographicAnalyzer onUseTemplate={handleUseTemplate} />
    </div>
  );
};

export default AnalyzerPage;