import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import { initialize, User } from 'tonomy-id-sdk';
import Storage from '../utils/storage';

// TODO change this to be an instance of User class when we have implemented the RNKeyStore
interface UserState {
  username: string | null;
  user: User;
  isLoggedIn: () => boolean;
}


const useUserStore = create<UserState>((set, get) => ({
  username: null, // start by getting the username from tonomy prisitant storage
  user: initialize(new RNKeyManager(), new Storage()),

  // Todo return true if username is not empty
  isLoggedIn: () => {
    return get().username !== null;
  }

}));



export default useUserStore;