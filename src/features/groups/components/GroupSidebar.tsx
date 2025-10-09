import { FormEvent, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useGroups, useCreateGroup, useJoinGroup, useLeaveGroup } from '../hooks/useGroups';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'active' : '';

export const GroupSidebar = () => {
  const { data: groups, isLoading } = useGroups();
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
    <ul className="menu bg-base-200 w-56 min-h-full">
      <li>
        <NavLink to="/" className={navLinkClass} end>
          All coupons
        </NavLink>
      </li>
      <li className="menu-title">Groups</li>
      {isLoading ? <p className="p-4">Loading groups…</p> : null}
      {groups?.map((group) => (
        <li key={group.id}>
          <NavLink to={`/groups/${group.id}`} className={navLinkClass}>
            {group.name}
          </NavLink>
        </li>
      ))}
      {groups?.length === 0 && !isLoading ? <p className="p-4">No groups yet.</p> : null}
      <li className="menu-title">Actions</li>
      <li>
        <details open>
          <summary>Create group</summary>
          <form onSubmit={handleCreateGroup} className="p-2 bg-base-100">
            <input
              type="text"
              placeholder="Group name"
              className="input input-bordered w-full max-w-xs"
              value={newGroupName}
              onChange={(event) => setNewGroupName(event.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm mt-2" disabled={createGroupMutation.isPending}>
              {createGroupMutation.isPending ? 'Creating…' : 'Create'}
            </button>
          </form>
        </details>
      </li>
      <li>
        <details open>
          <summary>Join group</summary>
          <form onSubmit={handleJoinGroup} className="p-2 bg-base-100">
            <input
              type="text"
              placeholder="Join code"
              className="input input-bordered w-full max-w-xs"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
            />
            <button type="submit" className="btn btn-primary btn-sm mt-2" disabled={joinGroupMutation.isPending}>
              {joinGroupMutation.isPending ? 'Joining…' : 'Join'}
            </button>
          </form>
        </details>
      </li>
      {message ? <div role="alert" className="alert alert-success"><p>{message}</p></div> : null}
      {error ? <div role="alert" className="alert alert-error"><p>{error}</p></div> : null}
    </ul>
  );
};
