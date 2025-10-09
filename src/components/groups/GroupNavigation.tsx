import { NavLink } from 'react-router-dom';
import type { GroupRecord } from '@/features/groups/api';

export interface GroupNavigationProps {
  groups: GroupRecord[];
  isLoading: boolean;
  currentGroupId?: string;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'active' : '';

export const GroupNavigation = ({ groups, isLoading, currentGroupId }: GroupNavigationProps) => {
  return (
    <>
      <li>
        <NavLink to="/" className={`${navLinkClass} btn-mobile justify-start`} end>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          All coupons
        </NavLink>
      </li>
      
      <li className="menu-title">
        <span className="text-base-content/70 font-medium">Groups</span>
      </li>
      
      {isLoading ? (
        <li className="p-4">
          <span className="loading loading-spinner loading-sm"></span>
          <span className="ml-2 text-sm text-base-content/70">Loading groups…</span>
        </li>
      ) : null}
      
      {groups?.map((group) => (
        <li key={group.id}>
          <NavLink to={`/groups/${group.id}`} className={`${navLinkClass} btn-mobile justify-start`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {group.name}
          </NavLink>
        </li>
      ))}
      
      {groups?.length === 0 && !isLoading ? (
        <li className="p-4 text-sm text-base-content/70">No groups yet.</li>
      ) : null}
    </>
  );
};
