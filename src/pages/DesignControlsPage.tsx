import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shapes } from "lucide-react";
import { DesignControls } from "@/components/AdminTabs/DesignControls";
import { ContentPreview } from "@/components/ContentPreview";

interface DesignControlsPageProps {
  copySettings?: {
    livePreview?: boolean;
  };
}

const DesignControlsPage = ({ copySettings }: DesignControlsPageProps) => {
  const safeCopySettings = copySettings || { livePreview: true };
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Shapes className="h-5 w-5" />
            أدوات التصميم والأشكال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-medium text-primary mb-2">إعدادات الأشكال والتخطيط</h3>
            <p className="text-sm text-muted-foreground">
              تحكم شامل في الأشكال، التخطيط، الهوامش، توزيع النص، والمواضع المتطورة
            </p>
          </div>

          <div className="grid gap-6">
          <DesignControls
            shapeInversionSettings={{
              enabled: false,
              mode: 'normal',
              maskOpacity: 80,
              textPlacement: 'inside',
              maskBlur: 0,
              backgroundBlending: 'normal'
            }}
            advancedShapeSettings={{
              shapeType: 'rectangle',
              cornerRadius: 0,
              hasRoundedCorners: false,
              polygonSides: 6,
              polygonRotation: 0,
              curvatureStrength: 0,
              edgeSmoothness: 0,
              aspectRatio: 1,
              skewX: 0,
              skewY: 0
            }}
            shapeMarginSettings={{
              topMargin: 20,
              bottomMargin: 20,
              leftMargin: 20,
              rightMargin: 20,
              uniformMargin: true
            }}
            textDistributionSettings={{
              horizontalPosition: 50,
              verticalPosition: 50,
              textAreaWidth: 80,
              textAreaHeight: 60,
              autoDistribution: true,
              distributionStrategy: 'center',
              innerPadding: 15,
              avoidEdges: true,
              edgeBuffer: 20,
              shapeAware: true,
              dynamicSizing: true
            }}
            spaceLayoutSettings={{
              layoutPattern: 'half-split',
              textPosition: 'right',
              imagePosition: 'left',
              divisionStyle: 'curved',
              spacingRatio: 50
            }}
            setShapeInversionSettings={() => {}}
            setAdvancedShapeSettings={() => {}}
            setShapeMarginSettings={() => {}}
            setTextDistributionSettings={() => {}}
            setSpaceLayoutSettings={() => {}}
            layoutType="rectangle"
            triangleDirection="up"
            onLayoutChange={() => {}}
            onDirectionChange={() => {}}
          />
        </div>
      </CardContent>
    </Card>
    
    {/* LivePreview مع إمكانية الإخفاء/الإظهار */}
    {safeCopySettings.livePreview && (
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shapes className="h-4 w-4" />
            معاينة مباشرة - التصميم والأشكال
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ContentPreview 
            title="معاينة تحكم التصميم"
            className="w-full h-64"
            compact={true}
            showDeviceToggle={false}
            autoRefresh={true}
          />
        </CardContent>
      </Card>
    )}
  </div>
);
};

export default DesignControlsPage;