import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAdmin, AlertNotification } from '../context/AdminRealtimeContext';
import {
  Sparkles,
  Archive,
  ArchiveRestore,
  Trash2,
  CheckSquare,
  Square,
  X,
  CheckCheck,
  Filter,
  ShoppingBag,
  PackageCheck,
  AlertTriangle,
  Tag
} from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    alerts,
    clearAlerts,
    markEventsRead,
    archiveAlert,
    bulkArchiveAlerts,
    deleteAlert,
    bulkDeleteAlerts
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Filter alerts by active vs archived
  const filteredAlerts = alerts.filter((a) => (activeTab === 'archived' ? Boolean(a.archived) : !a.archived));

  // Reset selected IDs when tab changes or alerts change
  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allSelected = filteredAlerts.length > 0 && selectedIds.length === filteredAlerts.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAlerts.map((a) => a.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkArchive = async (archived = true) => {
    if (selectedIds.length === 0) return;
    await bulkArchiveAlerts(selectedIds, archived);
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Permanently delete ${selectedIds.length} notification(s)? This cannot be undone.`)) {
      await bulkDeleteAlerts(selectedIds);
      setSelectedIds([]);
    }
  };

  const getItemIcon = (type: AlertNotification['type']) => {
    switch (type) {
      case 'order':
        return <PackageCheck className="w-4 h-4 text-emerald-stock" />;
      case 'bag':
        return <ShoppingBag className="w-4 h-4 text-cyan-400" />;
      case 'stock':
        return <AlertTriangle className="w-4 h-4 text-ruby-stock" />;
      case 'coupon':
        return <Tag className="w-4 h-4 text-gold" />;
      default:
        return <Sparkles className="w-4 h-4 text-gold" />;
    }
  };

  const content = (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: '72px',
        right: '24px',
        zIndex: 99999,
        background: '#12100E',
        border: '1px solid rgba(212, 175, 55, 0.45)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95)'
      }}
      className="w-[92vw] sm:w-[440px] max-h-[82vh] rounded-3xl flex flex-col overflow-hidden text-ivory font-sans animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-gold/20 flex items-center justify-between bg-espresso/90">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <h3 className="font-serif font-bold text-sm text-ivory tracking-wide">
            Live Activity Pings
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold/15 text-gold-light border border-gold/30">
            {filteredAlerts.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => markEventsRead()}
            className="text-[10px] text-ivory/60 hover:text-gold flex items-center gap-1 font-mono cursor-pointer"
            title="Mark all read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mark Read</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-obsidian border border-gold/20 text-ivory/60 hover:text-gold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs: Active vs Archived */}
      <div className="px-4 py-2 border-b border-gold/15 flex items-center justify-between bg-obsidian/60 text-xs">
        <div className="inline-flex p-1 rounded-xl bg-espresso border border-gold/20">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-gold text-obsidian font-bold shadow'
                : 'text-ivory/60 hover:text-ivory'
            }`}
          >
            Active ({alerts.filter((a) => !a.archived).length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'archived'
                ? 'bg-gold text-obsidian font-bold shadow'
                : 'text-ivory/60 hover:text-ivory'
            }`}
          >
            Archived ({alerts.filter((a) => a.archived).length})
          </button>
        </div>

        {filteredAlerts.length > 0 && (
          <button
            onClick={clearAlerts}
            className="text-[10px] font-mono text-ruby-stock/80 hover:text-ruby-stock hover:underline cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Bulk Action Controls Bar */}
      {filteredAlerts.length > 0 && (
        <div className="px-4 py-2 bg-espresso/50 border-b border-gold/10 flex items-center justify-between text-xs">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-2 text-ivory/80 hover:text-gold cursor-pointer font-mono text-[11px]"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-gold" />
            ) : (
              <Square className="w-4 h-4 text-ivory/40" />
            )}
            <span>
              {selectedIds.length > 0 ? `${selectedIds.length} Selected` : 'Select All'}
            </span>
          </button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <button
                onClick={() => handleBulkArchive(activeTab === 'active')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold/15 hover:bg-gold/25 border border-gold/30 text-gold-light text-[10px] font-mono cursor-pointer"
                title={activeTab === 'active' ? 'Archive selected' : 'Unarchive selected'}
              >
                {activeTab === 'active' ? (
                  <>
                    <Archive className="w-3 h-3" /> Archive
                  </>
                ) : (
                  <>
                    <ArchiveRestore className="w-3 h-3" /> Unarchive
                  </>
                )}
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ruby-stock/20 hover:bg-ruby-stock/30 border border-ruby-stock/40 text-ruby-stock text-[10px] font-mono cursor-pointer"
                title="Delete permanently"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notification List Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[55vh]">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-ivory/40 text-xs font-mono space-y-1">
            <p>No {activeTab} activity pings</p>
            <p className="text-[10px] text-ivory/30">New customer events stream here in real time</p>
          </div>
        ) : (
          filteredAlerts.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-gold/15 border-gold/60'
                    : 'bg-obsidian/80 border-gold/15 hover:border-gold/35'
                }`}
              >
                {/* Select Checkbox */}
                <button
                  onClick={() => handleToggleSelect(item.id)}
                  className="mt-0.5 text-ivory/50 hover:text-gold cursor-pointer flex-shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-gold" />
                  ) : (
                    <Square className="w-4 h-4 text-ivory/30" />
                  )}
                </button>

                {/* Icon */}
                <div className="w-8 h-8 rounded-xl bg-espresso border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getItemIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-bold text-xs text-gold truncate">
                      {item.title}
                    </span>
                    <span className="text-[9px] text-ivory/40 font-mono flex-shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-ivory/80 leading-snug mt-0.5 line-clamp-2">
                    {item.message}
                  </p>
                </div>

                {/* Row Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                  <button
                    onClick={() => archiveAlert(item.id, !item.archived)}
                    className="p-1 rounded-md text-ivory/40 hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                    title={item.archived ? 'Move to Active' : 'Archive'}
                  >
                    {item.archived ? (
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Permanently delete this activity ping?')) {
                        await deleteAlert(item.id);
                      }
                    }}
                    className="p-1 rounded-md text-ivory/40 hover:text-ruby-stock hover:bg-ruby-stock/10 transition-colors cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gold/15 bg-espresso/90 text-center text-[10px] text-ivory/50 font-mono">
        Real-Time Broadcaster Active • Synchronized on :8787
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};
