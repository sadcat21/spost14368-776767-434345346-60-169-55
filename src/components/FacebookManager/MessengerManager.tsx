
import { useState, useEffect } from "react";
import { geminiApiManager } from "../../utils/geminiApiManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Sparkles, RefreshCw, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatShortDateInArabic } from "@/utils/dateUtils";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

interface Conversation {
  id: string;
  participants: {
    data: Array<{
      name: string;
      email: string;
      id: string;
    }>;
  };
  updated_time: string;
  message_count: number;
}

interface Message {
  id: string;
  message?: string;
  from: {
    name: string;
    id: string;
  };
  created_time: string;
  to?: {
    data: Array<{
      name: string;
      id: string;
    }>;
  };
}

interface MessengerManagerProps {
  selectedPage: FacebookPage;
}

export const MessengerManager = ({ selectedPage }: MessengerManagerProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, [selectedPage]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages();
    }
  }, [selectedConversationId]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${selectedPage.id}/conversations?access_token=${selectedPage.access_token}&fields=participants,updated_time,message_count&limit=20`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      setConversations(data.data || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("فشل في تحميل المحادثات");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversationId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${selectedConversationId}/messages?access_token=${selectedPage.access_token}&fields=id,message,from,created_time,to&limit=20`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      // Sort messages by creation time (newest first, then reverse for display)
      const sortedMessages = (data.data || []).sort((a: Message, b: Message) => 
        new Date(a.created_time).getTime() - new Date(b.created_time).getTime()
      );
      
      setMessages(sortedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("فشل في تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!replyMessage.trim() || !selectedConversationId) {
      toast.error("يرجى كتابة رسالة");
      return;
    }

    setSending(true);
    try {
      // Get recipient ID from conversation
      const conversation = conversations.find(c => c.id === selectedConversationId);
      const recipient = conversation?.participants.data.find(p => p.id !== selectedPage.id);
      
      if (!recipient) {
        throw new Error("لم يتم العثور على المستلم");
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient: { id: recipient.id },
            message: { text: replyMessage },
            access_token: selectedPage.access_token
          })
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("تم إرسال الرسالة بنجاح!");
      setReplyMessage("");
      loadMessages(); // Refresh messages

    } catch (error) {
      console.error("Send message error:", error);
      toast.error("فشل في إرسال الرسالة: " + (error as Error).message);
    } finally {
      setSending(false);
    }
  };

  const generateSmartReply = async (lastMessage: string) => {
    setGenerating(true);
    try {
      const response = await geminiApiManager.makeRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ 
                text: `اكتب رداً احترافياً ومهذباً على هذه الرسالة من عميل في صفحة أعمال على فيسبوك. يجب أن يكون الرد باللغة العربية، مختصر، ودود ومفيد لخدمة العملاء:\n\n"${lastMessage}"\n\nالرد يجب أن يكون مناسب لخدمة العملاء التجارية وأن يحافظ على العلاقة الإيجابية مع العميل.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const generatedReply = data.candidates[0].content.parts[0].text;
      
      setReplyMessage(generatedReply);
      toast.success("تم توليد رد ذكي!");

    } catch (error) {
      console.error("Error generating reply:", error);
      toast.error("فشل في توليد الرد الذكي");
    } finally {
      setGenerating(false);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const getConversationName = (conversation: Conversation) => {
    const participant = conversation.participants.data.find(p => p.id !== selectedPage.id);
    return participant?.name || "مستخدم غير معروف";
  };

  const isFromPage = (message: Message) => {
    return message.from.id === selectedPage.id;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <MessageCircle className="h-5 w-5" />
              إدارة رسائل Messenger
            </div>
            <Button variant="outline" size="sm" onClick={loadConversations} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
            {/* Conversations List */}
            <div className="space-y-2">
              <Label>المحادثات</Label>
              <ScrollArea className="h-80 border rounded-lg p-2">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">جاري التحميل...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">لا توجد محادثات</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversationId === conversation.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                        onClick={() => setSelectedConversationId(conversation.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 mt-1" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {getConversationName(conversation)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {conversation.message_count} رسالة
                                </Badge>
                                <span className="text-xs opacity-75">
                                  {formatShortDateInArabic(conversation.updated_time)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Messages Area */}
            <div className="lg:col-span-2 space-y-4">
              {selectedConversationId ? (
                <>
                  {/* Messages List */}
                  <div>
                    <Label>المحادثة مع {selectedConversation && getConversationName(selectedConversation)}</Label>
                    <ScrollArea className="h-64 border rounded-lg p-3 mt-2">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground">لا توجد رسائل</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${isFromPage(message) ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                                  isFromPage(message)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">
                                  {message.message || "رسالة غير نصية"}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3 opacity-50" />
                                  <span className="text-xs opacity-75">
                                    {new Date(message.created_time).toLocaleTimeString('en-US')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {/* Reply Section */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const lastMessage = messages.filter(m => !isFromPage(m)).pop();
                          if (lastMessage?.message) {
                            generateSmartReply(lastMessage.message);
                          }
                        }}
                        disabled={generating || messages.length === 0}
                        className="flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        {generating ? "جاري التوليد..." : "رد ذكي"}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="اكتب رسالتك هنا..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={sending || !replyMessage.trim()}
                        className="flex items-center gap-1"
                      >
                        <Send className="h-4 w-4" />
                        {sending ? "جاري الإرسال..." : "إرسال"}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>اختر محادثة لعرض الرسائل</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
