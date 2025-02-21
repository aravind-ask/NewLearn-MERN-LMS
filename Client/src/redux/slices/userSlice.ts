import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { courseApi } from "../services/courseApi";

// Async Thunks for API Calls
export const fetchCart = createAsyncThunk("user/fetchCart", async () => {
  const response = await courseApi.endpoints.getCart.initiate();
  return response.data;
});

export const fetchWishlist = createAsyncThunk(
  "user/fetchWishlist",
  async () => {
    const response = await courseApi.endpoints.getWishlist.initiate();
    return response.data;
  }
);

const initialState = {
  cart: [],
  wishlist: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Local state updates (optional, if needed)
    addToCart: (state, action) => {
      const course = action.payload;
      if (!state.cart.find((item) => item._id === course._id)) {
        state.cart.push(course);
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item._id !== action.payload);
    },
    addToWishlist: (state, action) => {
      const course = action.payload;
      if (!state.wishlist.find((item) => item._id === course._id)) {
        state.wishlist.push(course);
      }
    },
    removeFromWishlist: (state, action) => {
      state.wishlist = state.wishlist.filter(
        (item) => item._id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchWishlist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.wishlist = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { addToCart, removeFromCart, addToWishlist, removeFromWishlist } =
  userSlice.actions;

export default userSlice.reducer;
