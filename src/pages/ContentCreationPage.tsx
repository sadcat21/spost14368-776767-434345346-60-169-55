import { ContentGenerator } from "@/components/ContentGenerator";
import { ContentPreview } from "@/components/ContentPreview";

interface ContentCreationPageProps {
  copySettings?: {
    livePreview?: boolean;
  };
}

const ContentCreationPage = ({ copySettings }: ContentCreationPageProps) => {
  const safeCopySettings = copySettings || { livePreview: true };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* منطقة إنشاء المحتوى */}
      <div className="lg:col-span-2">
        <ContentGenerator />
      </div>
      {/* تم إزالة معاينة إنشاء المحتوى كما طلب المستخدم */}
    </div>
  );
};

export default ContentCreationPage;