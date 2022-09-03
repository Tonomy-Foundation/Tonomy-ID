import create from 'zustand';


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