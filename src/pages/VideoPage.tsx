import { useState } from "react";
import { VideoUploader } from "@/components/VideoUploader";
import { VideoPreviewSection } from "@/components/VideoPreviewSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Upload, Play } from "lucide-react";

const VideoPage = () => {
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>("");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-primary text-right">
              <Video className="h-6 w-6" />
              إدارة الفيديو
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  رفع الفيديو
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  معاينة ومعالجة
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <VideoUploader 
                  onVideoUploaded={setUploadedVideoUrl}
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <VideoPreviewSection 
                  videoUrl={uploadedVideoUrl}
                  videoThumbnail=""
                  videoPageUrl=""
                  isVisible={true}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoPage;