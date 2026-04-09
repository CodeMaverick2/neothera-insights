'use client';

import { ChevronDown, User, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface UserItem {
  id: string;
  name: string;
  skinType?: string;
  age?: number;
  programWeek?: number;
}

interface Props {
  users: UserItem[];
  selectedUserId: string;
  onSelect: (userId: string) => void;
}

export default function UserSelector({ users, selectedUserId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const selected = users.find(u => u.id === selectedUserId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  if (users.length <= 1) {
    return (
      <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-2.5">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <User size={14} className="text-primary" />
        </div>
        <span className="text-sm font-medium">{selected?.name || 'User'}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-2.5 hover:border-primary/40 hover:shadow-sm min-w-[200px]"
      >
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <User size={14} className="text-primary" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-medium">{selected?.name || 'Select user'}</p>
          {selected?.skinType && (
            <p className="text-xs text-muted">{selected.skinType} skin</p>
          )}
        </div>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fadeIn">
          {users.length > 5 && (
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2">
                <Search size={14} className="text-muted" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent text-sm outline-none flex-1"
                />
              </div>
            </div>
          )}
          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.map(user => (
              <button
                key={user.id}
                onClick={() => { onSelect(user.id); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-primary/5 ${
                  user.id === selectedUserId ? 'bg-primary/10' : ''
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  {(user.age || user.skinType) && (
                    <p className="text-xs text-muted">
                      {[user.age ? `Age ${user.age}` : '', user.skinType || ''].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>
                {user.id === selectedUserId && <div className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
