import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import {
  createGroup,
  fetchGroupsForUser,
  joinGroupWithCode,
  leaveGroup,
} from "../api";
import type { GroupRecord } from "../api";

export const useGroups = () => {
  const { user, isSignedIn } = useAuth();
  const userId = user?.id;
  console.log("userId", userId);
  const query = useQuery<GroupRecord[]>({
    queryKey: ["groups", userId],
    queryFn: () => fetchGroupsForUser(userId as string),
    enabled: isSignedIn && Boolean(userId),
  });

  return query;
};

export const useCreateGroup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<GroupRecord, Error, string>({
    mutationFn: (name: string) => {
      if (!user) {
        throw new Error("You must be signed in to create a group.");
      }
      return createGroup({ name, ownerId: user.id });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["groups", user?.id] });
    },
  });
};

export const useJoinGroup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<GroupRecord, Error, string>({
    mutationFn: (code: string) => {
      if (!user) {
        throw new Error("You must be signed in to join a group.");
      }
      return joinGroupWithCode({ code, userId: user.id });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["groups", user?.id] });
    },
  });
};

export const useLeaveGroup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (groupId: string) => {
      if (!user) {
        throw new Error("You must be signed in to leave a group.");
      }
      return leaveGroup({ groupId, userId: user.id });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["groups", user?.id] });
    },
  });
};
