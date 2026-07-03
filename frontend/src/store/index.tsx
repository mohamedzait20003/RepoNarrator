import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";

import { CreateGenSlice, type GenSlice } from "./slices/genSlice";
import { CreateUserSlice, type UserSlice } from "./slices/userSlice";

type StoreState = UserSlice & GenSlice;

export const useStore = create<StoreState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set) => ({
          ...CreateUserSlice(set),
          ...CreateGenSlice(set),
        }))
      ),
      {
        name: "reponarrator-store",
        partialize: (state) => ({
          accessToken: state.accessToken,
          userRole: state.userRole,
          isAuthenticated: state.isAuthenticated,
          userData: state.userData,
          mode: state.mode,
        }),
      }
    ),
    { name: "ReponarratorStore" }
  )
);
