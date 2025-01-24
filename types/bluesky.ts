export type GetProfiles = {
  profiles: {
    did: string;
    handle: string;
    displayName: string;
    description: string;
    avatar: string;
    banner: string;
    followersCount: number;
    followsCount: number;
    postsCount: number;
    associated: {
      lists: number;
      feedgens: number;
      starterPacks: number;
      labeler: boolean;
      chat: {
        allowIncoming: "all" | "none" | "following";
      };
    };
    joinedViaStarterPack: unknown;
    indexedAt: string;
    createdAt: string;
    viewer: unknown;
    labels: unknown;
    pinnedPost: unknown;
  }[];
};
