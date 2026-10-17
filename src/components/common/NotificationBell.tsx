import React, { useState } from 'react';
import { useLoan } from '@/contexts/LoanContext';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, FileText, ChevronRight, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markNotificationRead, currentUser } = useLoan();
  const [open, setOpen] = useState(false);

  const userNotifications = notifications.filter(
    (n) => n.userId === 'all' || (currentUser && (n.userId === currentUser.id || (n.phone && n.phone === currentUser.phone)))
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full text-foreground hover:bg-muted shrink-0"
          title="নোটিফিকেশন বার্তা"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute 1 top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-red-600 text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[calc(100vw-2rem)] max-w-sm sm:w-96 p-0 bg-card shadow-2xl border border-border rounded-2xl overflow-hidden z-50 mr-2 sm:mr-0" 
        align="end"
        sideOffset={6}
      >
        <div className="p-3 border-b flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm text-foreground">নোটিফিকেশন ইনবক্স</h4>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] font-bold text-primary bg-primary/10">
                {unreadCount}টি নতুন
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {userNotifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              কোনো নোটিফিকেশন পাওয়া যায়নি
            </div>
          ) : (
            userNotifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                  }}
                  className={`p-3 text-left transition-colors cursor-pointer hover:bg-muted/40 ${
                    isUnread ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'loan' ? (
                        <FileText className="w-4 h-4 text-emerald-600" />
                      ) : notif.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : notif.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Info className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs ${isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground/85'}`}>
                          {notif.title}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-muted-foreground/80 mt-1 block">
                        {notif.date}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-2.5 bg-muted/20 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground">
            অফিসিয়াল আপডেট ও অনুমোদন মেসেজ
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
