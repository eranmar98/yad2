export interface Token {
    token: string;
}

export interface IUser {
  _id: string  
  firstName: string;
  lastName: string;
  email: string;
  //password: string;
  phone: string;
  avatarUrl?: string;
}