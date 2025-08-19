import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { formatShortDateInArabic } from "@/utils/dateUtils";

interface Template {
  id: string;
  name: string;
  specialty: string;
  contentType: string;
  text: string;
  imageUrl: string;
  createdAt: string;
}

interface TemplateLibraryProps {
  onLoadTemplate: (template: Template) => void;
}

export const TemplateLibrary = ({ onLoadTemplate }: TemplateLibraryProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const savedTemplates = localStorage.getItem("social-content-templates");
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  };

  const saveTemplate = (template: Omit<Template, "id" | "createdAt">) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem("social-content-templates", JSON.stringify(updatedTemplates));
    toast.success("تم حفظ النموذج بنجاح!");
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(t => t.id !== id);
    setTemplates(updatedTemplates);
    localStorage.setItem("social-content-templates", JSON.stringify(updatedTemplates));
    toast.success("تم حذف النموذج");
  };

  const loadTemplate = (template: Template) => {
    onLoadTemplate(template);
    toast.success("تم تحميل النموذج");
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="text-primary">مكتبة النماذج المحفوظة</CardTitle>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            لا توجد نماذج محفوظة حتى الآن
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{template.name}</h4>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {template.specialty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.contentType}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadTemplate(template)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {template.imageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden border">
                    <img 
                      src={template.imageUrl} 
                      alt="Template preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.text}
                </p>
                
                <div className="text-xs text-muted-foreground">
                  {formatShortDateInArabic(template.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};