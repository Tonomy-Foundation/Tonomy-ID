import create from 'zustand';

// TODO change this to be an instance of User class when we have implemented the RNKeyStore
interface UserState {
  username: string | null;
  isLoggedIn: () => boolean;
}


const useUserStore = create<UserState>((set, get) => ({
  username: null, // start by getting the username from tonomy prisitant storage


  // Todo return true if username is not empty
  isLoggedIn: () => {
    return get().username !== null;
  }

}));



export default useUserStore;