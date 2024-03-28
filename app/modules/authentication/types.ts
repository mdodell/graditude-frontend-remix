export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type Profile = {
  firstName: string;
  lastName: string;
};

export type SuccessfulAuthResponse = {
  account: {
    email: string;
    profile: Profile;
  };
} & Tokens;
