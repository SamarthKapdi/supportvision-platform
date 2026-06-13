import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';

interface Props {
  inviteToken: string;
}

export const InviteLink: React.FC<Props> = ({ inviteToken }) => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/join/${inviteToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-300">Share this link with your customer to invite them to the session.</p>
      
      <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700">
        <input 
          type="text" 
          value={link} 
          readOnly 
          className="flex-1 bg-transparent border-none text-sm text-slate-300 px-3 focus:outline-none focus:ring-0"
        />
        <Button variant="secondary" size="icon" onClick={handleCopy} title="Copy Link">
          {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
        </Button>
      </div>
      
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700/50">
        <Button 
          variant="ghost" 
          onClick={() => window.open(link, '_blank')}
          icon={<ExternalLink size={16} />}
        >
          Open Link
        </Button>
      </div>
    </div>
  );
};
