import { configureStore } from "@reduxjs/toolkit";
import { adminProductsReducer } from "./features/admin-products/adminProductsSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      adminProducts: adminProductsReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
