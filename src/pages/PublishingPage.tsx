import { FacebookManager } from "@/components/FacebookManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Calendar, BarChart3 } from "lucide-react";
import { useGeneratedContent } from "@/contexts/GeneratedContentContext";

const PublishingPage = () => {
  const { generatedContent } = useGeneratedContent();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-primary text-right">
              <Send className="h-6 w-6" />
              النشر والجدولة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FacebookManager 
              generatedContent={generatedContent}
              isCompactView={false}
              isPreviewVisible={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublishingPage;