import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Facebook, Check } from 'lucide-react';
import { useFacebook } from '@/contexts/FacebookContext';

export const FacebookPagesDropdown = () => {
  const { pages, selectedPage, handlePageSelect, isConnected } = useFacebook();

  if (!isConnected || pages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Facebook className="h-4 w-4 text-blue-600" />
          {selectedPage ? selectedPage.name : 'اختر صفحة'}
          <Badge variant="secondary" className="text-xs">
            {pages.length}
          </Badge>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-center">
          الصفحات المتصلة ({pages.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {pages.map((page) => (
          <DropdownMenuItem
            key={page.id}
            onClick={() => handlePageSelect(page)}
            className="flex items-center gap-3 cursor-pointer"
          >
            {/* صورة الصفحة */}
            {page.picture?.data?.url && (
              <img 
                src={page.picture.data.url} 
                alt={page.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            
            {/* معلومات الصفحة */}
            <div className="flex-1">
              <div className="font-medium">{page.name}</div>
              <div className="text-xs text-muted-foreground">{page.category}</div>
            </div>
            
            {/* علامة الاختيار */}
            {selectedPage?.id === page.id && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FacebookPagesDropdown;