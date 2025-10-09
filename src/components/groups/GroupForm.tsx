import { FormEvent, useState } from 'react';
import { Button, Input, Alert } from '@/components/ui';

export interface GroupFormProps {
  onSubmit: (name: string) => Promise<void>;
  onJoin: (code: string) => Promise<void>;
  isCreating: boolean;
  isJoining: boolean;
  error: string | null;
  message: string | null;
}

export const GroupForm = ({ onSubmit, onJoin, isCreating, isJoining, error, message }: GroupFormProps) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const handleCreateGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newGroupName.trim()) return;
    
    await onSubmit(newGroupName.trim());
    setNewGroupName('');
  };

  const handleJoinGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!joinCode.trim()) return;
    
    await onJoin(joinCode.trim());
    setJoinCode('');
  };

  return (
    <div className="space-y-4">
      {message && (
        <Alert type="success" onClose={() => {}}>
          {message}
          {message.includes('Share code:') && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => {
                const code = message.split('Share code: ')[1];
                navigator.clipboard.writeText(code);
              }}
            >
              Copy code
            </Button>
          )}
        </Alert>
      )}
      
      {error && (
        <Alert type="error" onClose={() => {}}>
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        <details className="group">
          <summary className="btn-mobile justify-start">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create group
          </summary>
          <div className="p-4 bg-base-100 rounded-lg mt-2">
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <Input
                type="text"
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                fullWidth
              />
              <Button
                type="submit"
                size="sm"
                fullWidth
                loading={isCreating}
                disabled={isCreating}
              >
                {isCreating ? 'Creating…' : 'Create'}
              </Button>
            </form>
          </div>
        </details>

        <details className="group">
          <summary className="btn-mobile justify-start">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
            </svg>
            Join group
          </summary>
          <div className="p-4 bg-base-100 rounded-lg mt-2">
            <form onSubmit={handleJoinGroup} className="space-y-3">
              <Input
                type="text"
                placeholder="Join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                fullWidth
              />
              <Button
                type="submit"
                size="sm"
                fullWidth
                loading={isJoining}
                disabled={isJoining}
              >
                {isJoining ? 'Joining…' : 'Join'}
              </Button>
            </form>
          </div>
        </details>
      </div>
    </div>
  );
};
