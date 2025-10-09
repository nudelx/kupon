import { FormEvent, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useGroups, useCreateGroup, useJoinGroup, useLeaveGroup } from '../hooks/useGroups';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'sidebar-link active' : 'sidebar-link';

export const GroupSidebar = () => {
  const { data: groups, isLoading } = useGroups();
  console.log("groups", groups);
  const createGroupMutation = useCreateGroup();
  const joinGroupMutation = useJoinGroup();
  const leaveGroupMutation = useLeaveGroup();
  const { groupId } = useParams();
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newGroupName.trim()) {
      setError('Please provide a group name.');
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const created = await createGroupMutation.mutateAsync(newGroupName.trim());
      setMessage(`Group "${created.name}" created. Share code ${created.join_code}.`);
      setNewGroupName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create group.');
    }
  };

  const handleJoinGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!joinCode.trim()) {
      setError('Enter a join code to connect with your group.');
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const joined = await joinGroupMutation.mutateAsync(joinCode.trim());
      setMessage(`Joined ${joined.name}.`);
      setJoinCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to join group.');
    }
  };

  const handleLeaveGroup = async (id: string, name: string) => {
    setError(null);
    setMessage(null);
    try {
      await leaveGroupMutation.mutateAsync(id);
      setMessage(`You left ${name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to leave group.');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <NavLink to="/" className={navLinkClass} end>
          All coupons
        </NavLink>
      </div>
      <div className="sidebar-section">
        <h2>Groups</h2>
        {isLoading ? <p className="muted">Loading groups…</p> : null}
        <div className="sidebar-groups">
          {groups?.map((group) => (
            <div key={group.id} className={groupId === group.id ? 'group-tile active' : 'group-tile'}>
              <NavLink to={`/groups/${group.id}`} className="group-tile__link">
                <span>{group.name}</span>
                <small>Code: {group.join_code}</small>
              </NavLink>
              <button
                type="button"
                className="text-button"
                onClick={() => handleLeaveGroup(group.id, group.name)}
              >
                Leave
              </button>
            </div>
          ))}
          {groups?.length === 0 && !isLoading ? <p className="muted">No groups yet.</p> : null}
        </div>
      </div>
      <div className="sidebar-section">
        <form onSubmit={handleCreateGroup} className="sidebar-form">
          <h3>Create group</h3>
          <input
            value={newGroupName}
            onChange={(event) => setNewGroupName(event.target.value)}
            placeholder="Family name"
            aria-label="Group name"
          />
          <button type="submit" disabled={createGroupMutation.isPending}>
            {createGroupMutation.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
      </div>
      <div className="sidebar-section">
        <form onSubmit={handleJoinGroup} className="sidebar-form">
          <h3>Join group</h3>
          <input
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
            placeholder="Enter code"
            aria-label="Join code"
          />
          <button type="submit" disabled={joinGroupMutation.isPending}>
            {joinGroupMutation.isPending ? 'Joining…' : 'Join'}
          </button>
        </form>
      </div>
      {message ? <p className="feedback success">{message}</p> : null}
      {error ? <p className="feedback error">{error}</p> : null}
    </aside>
  );
};
