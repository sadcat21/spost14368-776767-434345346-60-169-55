import React from 'react';
import { Button } from "@/components/ui/button";
import { Activity, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EventsNavigationButton = () => {
  const navigate = useNavigate();

  return (
    <Button 
      onClick={() => navigate('/events')}
      className="flex items-center gap-2"
      variant="outline"
    >
      <Activity className="h-4 w-4" />
      عرض أحداث الصفحات
      <ExternalLink className="h-4 w-4" />
    </Button>
  );
};

export default EventsNavigationButton;