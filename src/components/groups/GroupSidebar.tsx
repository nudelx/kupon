import { FormEvent, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useCreateGroup, useGroups, useJoinGroup, useLeaveGroup } from '@/hooks/useGroups';
import { ROUTES, buildGroupPath } from '@/routes/paths';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${isActive ? 'active ' : ''}btn-mobile justify-start`;

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
      setMessage(`Group "${created.name}" created. Share code: ${created.join_code}`);
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
    if (!window.confirm(`Are you sure you want to leave ${name}?`)) return;
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
    <div className="sidebar-friendly w-64 min-h-full">
      <div className="p-4 border-b border-base-300">
        <h2 className="text-lg font-semibold text-base-content">Navigation</h2>
      </div>

      {message ? (
        <div role="alert" className="alert alert-success mx-4 mt-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm">
            {message}
            {message.includes('Share code:') ? (
              <button
                className="btn btn-xs btn-ghost ml-2"
                onClick={() => {
                  const code = message.split('Share code: ')[1];
                  navigator.clipboard.writeText(code);
                }}
              >
                Copy code
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="alert alert-error mx-4 mt-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      ) : null}

      <ul className="menu p-4">
        <li>
          <NavLink to={ROUTES.HOME} className={navLinkClass} end>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            All coupons
          </NavLink>
        </li>

        <li className="menu-title">
          <span className="text-base-content/70 font-medium">Groups</span>
        </li>

        {isLoading ? (
          <li className="p-4">
            <span className="loading loading-spinner loading-sm" />
            <span className="ml-2 text-sm text-base-content/70">Loading groups…</span>
          </li>
        ) : null}

        {groups?.map((group) => (
          <li key={group.id}>
            <NavLink to={buildGroupPath(group.id)} className={navLinkClass}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {group.name}
            </NavLink>
          </li>
        ))}

        {groups?.length === 0 && !isLoading ? (
          <li className="p-4 text-sm text-base-content/70">No groups yet.</li>
        ) : null}

        <li className="menu-title">
          <span className="text-base-content/70 font-medium">Actions</span>
        </li>

        <li>
          <details className="group">
            <summary className="btn-mobile justify-start">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create group
            </summary>
            <div className="p-4 bg-base-100 rounded-lg mt-2">
              <form onSubmit={handleCreateGroup} className="space-y-3">
                <input
                  type="text"
                  placeholder="Group name"
                  className="input input-bordered input-mobile w-full"
                  value={newGroupName}
                  onChange={(event) => setNewGroupName(event.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm w-full" disabled={createGroupMutation.isPending}>
                  {createGroupMutation.isPending ? 'Creating…' : 'Create'}
                </button>
              </form>
            </div>
          </details>
        </li>

        <li>
          <details className="group">
            <summary className="btn-mobile justify-start">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Join group
            </summary>
            <div className="p-4 bg-base-100 rounded-lg mt-2">
              <form onSubmit={handleJoinGroup} className="space-y-3">
                <input
                  type="text"
                  placeholder="Join code"
                  className="input input-bordered input-mobile w-full"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                />
                <button type="submit" className="btn btn-primary btn-sm w-full" disabled={joinGroupMutation.isPending}>
                  {joinGroupMutation.isPending ? 'Joining…' : 'Join'}
                </button>
              </form>
            </div>
          </details>
        </li>

        {groupId ? (
          <li>
            <button
              className="btn btn-error btn-sm w-full justify-start"
              onClick={() => handleLeaveGroup(groupId, groups?.find((group) => group.id === groupId)?.name ?? '')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Leave group
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
};
