import React from 'react';
import { FacebookWebhookSetup } from '@/components/FacebookWebhookSetup';
import { FacebookWebhookFlowDiagram } from '@/components/FacebookWebhookFlowDiagram';
import { WebhookTester } from '@/components/WebhookTester';
import { WebhookDiagnostic } from '@/components/WebhookDiagnostic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const WebhookSetupPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">إعداد Webhook</TabsTrigger>
          <TabsTrigger value="flow">مخطط التدفق</TabsTrigger>
          <TabsTrigger value="test">اختبار Webhook</TabsTrigger>
          <TabsTrigger value="diagnostic">تشخيص المشاكل</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="space-y-6">
          <FacebookWebhookSetup />
        </TabsContent>
        
        <TabsContent value="flow" className="space-y-6">
          <FacebookWebhookFlowDiagram />
        </TabsContent>
        
        <TabsContent value="test" className="space-y-6">
          <WebhookTester />
        </TabsContent>
        
        <TabsContent value="diagnostic" className="space-y-6">
          <WebhookDiagnostic />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebhookSetupPage;