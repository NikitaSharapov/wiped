
export interface Message {
  id: string;
  text: string;
  created: string;
}

export interface User {
  id: string;
  avatar: string;
  name: string;
}

export interface MessageWithUser extends Message {
  expand: {
    user: User;
  };
}

export interface AuthRecord {
  avatar:
  string,
  collectionId: string,
  collectionName: string,
  created: string,
  email: string,
  emailVisibility: boolean,
  id: string,
  name: string,
  updated: string,
  username: string,
  verified: boolean

}