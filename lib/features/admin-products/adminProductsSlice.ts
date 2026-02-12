import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SortBy = "name-asc" | "name-desc" | "price-asc" | "price-desc";

interface AdminProductsState {
  searchQuery: string;
  categoryId: string | null;
  priceMin: number | null;
  priceMax: number | null;
  sortBy: SortBy;
  page: number;
  pageSize: number;
}

const initialState: AdminProductsState = {
  searchQuery: "",
  categoryId: null,
  priceMin: null,
  priceMax: null,
  sortBy: "name-asc",
  page: 1,
  pageSize: 5,
};

const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.page = 1; // reset to first page on search change
    },
    setCategoryId(state, action: PayloadAction<string | null>) {
      state.categoryId = action.payload;
      state.page = 1;
    },
    setPriceRange(
      state,
      action: PayloadAction<{ min: number | null; max: number | null }>,
    ) {
      state.priceMin = action.payload.min;
      state.priceMax = action.payload.max;
      state.page = 1;
    },
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.sortBy = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setSearchQuery,
  setCategoryId,
  setPriceRange,
  setSortBy,
  setPage,
  resetFilters,
} = adminProductsSlice.actions;

export const adminProductsReducer = adminProductsSlice.reducer;
