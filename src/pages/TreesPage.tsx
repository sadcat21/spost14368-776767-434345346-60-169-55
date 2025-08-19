import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trees, Layers, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TreesPage = () => {
  const [treeStructure, setTreeStructure] = useState([
    {
      id: 1,
      name: "المحتوى الرئيسي",
      type: "root",
      children: [
        { id: 2, name: "النص القصير", type: "text", status: "completed" },
        { id: 3, name: "النص الطويل", type: "text", status: "completed" },
        { id: 4, name: "الصورة", type: "media", status: "processing" }
      ]
    }
  ]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-primary text-right">
              <Trees className="h-6 w-6" />
              إدارة الأشجار والهياكل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center py-8">
                <GitBranch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">هيكل المحتوى التفاعلي</h3>
                <p className="text-muted-foreground mb-6">
                  إدارة وتنظيم المحتوى في شكل هيكل شجري تفاعلي
                </p>
                
                <div className="bg-muted/30 p-6 rounded-lg border-2 border-dashed">
                  <div className="space-y-4">
                    {treeStructure.map((node) => (
                      <div key={node.id} className="text-right">
                        <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" />
                            <span className="font-medium">{node.name}</span>
                          </div>
                          <Badge variant="secondary">{node.type}</Badge>
                        </div>
                        
                        <div className="mr-6 mt-2 space-y-2">
                          {node.children?.map((child) => (
                            <div key={child.id} className="flex items-center justify-between p-2 bg-muted/50 rounded border">
                              <span className="text-sm">{child.name}</span>
                              <Badge 
                                variant={child.status === "completed" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {child.status === "completed" ? "مكتمل" : "قيد المعالجة"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" size="lg">
                    <Trees className="mr-2 h-4 w-4" />
                    إنشاء هيكل جديد
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TreesPage;