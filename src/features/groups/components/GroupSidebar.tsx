import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGroups, useCreateGroup, useJoinGroup, useLeaveGroup } from '../hooks/useGroups';
import { GroupNavigation } from '@/components/groups/GroupNavigation';
import { GroupForm } from '@/components/groups/GroupForm';
import { Button } from '@/components/ui';

export const GroupSidebar = () => {
  const { data: groups, isLoading } = useGroups();
  const createGroupMutation = useCreateGroup();
  const joinGroupMutation = useJoinGroup();
  const leaveGroupMutation = useLeaveGroup();
  const { groupId } = useParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGroup = async (name: string) => {
    setError(null);
    setMessage(null);

    try {
      const created = await createGroupMutation.mutateAsync(name);
      setMessage(
        `Group "${created.name}" created. Share code: ${created.join_code}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create group.');
    }
  };

  const handleJoinGroup = async (code: string) => {
    setError(null);
    setMessage(null);

    try {
      const joined = await joinGroupMutation.mutateAsync(code);
      setMessage(`Joined ${joined.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to join group.');
    }
  };

  const handleLeaveGroup = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to leave ${name}?`)) return;
    setError(null);
    setMessage(null);

    try {
      await leaveGroupMutation.mutateAsync(id);
      setMessage(`Left ${name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to leave group.');
    }
  };

  return (
    <div className="sidebar-friendly w-64 min-h-full">
      <div className="p-4 border-b border-base-300">
        <h2 className="text-lg font-semibold text-base-content">Navigation</h2>
      </div>

      <ul className="menu p-4">
        <GroupNavigation 
          groups={groups || []} 
          isLoading={isLoading} 
          currentGroupId={groupId} 
        />
        
        <li className="menu-title">
          <span className="text-base-content/70 font-medium">Actions</span>
        </li>
        
        <li>
          <GroupForm
            onSubmit={handleCreateGroup}
            onJoin={handleJoinGroup}
            isCreating={createGroupMutation.isPending}
            isJoining={joinGroupMutation.isPending}
            error={error}
            message={message}
          />
        </li>
        
        {groupId && (
          <li>
            <Button 
              variant="error"
              size="sm"
              fullWidth
              onClick={() => handleLeaveGroup(groupId, groups?.find(g => g.id === groupId)?.name ?? '')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Leave group
            </Button>
          </li>
        )}
      </ul>
    </div>
  );
};