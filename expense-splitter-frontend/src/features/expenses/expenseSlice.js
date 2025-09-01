// src/features/expenses/expenseSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/';

const initialState = {
  expenses: [],
  balances: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

const getToken = (thunkAPI) => thunkAPI.getState().auth.token;

// Get expenses for a group
export const getExpensesForGroup = createAsyncThunk('expenses/getForGroup', async (groupId, thunkAPI) => {
  try {
    const token = getToken(thunkAPI);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}groups/${groupId}/expenses`, config);
    return response.data.data;
  } catch (error) {
    const message = (error.response?.data?.error) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get balances for a group
export const getGroupBalances = createAsyncThunk('expenses/getBalances', async (groupId, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}groups/${groupId}/balances`, config);
      return response.data.data;
    } catch (error)      {
      const message = (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  });

// Add new expense
export const addExpense = createAsyncThunk('expenses/add', async (expenseData, thunkAPI) => {
    try {
        const token = getToken(thunkAPI);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post(API_URL + 'expenses', expenseData, config);
        // After adding, dispatch actions to refresh both expenses and balances
        thunkAPI.dispatch(getExpensesForGroup(expenseData.group));
        thunkAPI.dispatch(getGroupBalances(expenseData.group));
        return response.data.data;
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});


export const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getExpensesForGroup.pending, (state) => { state.isLoading = true; })
      .addCase(getExpensesForGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.expenses = action.payload;
      })
      .addCase(getExpensesForGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getGroupBalances.pending, (state) => { /* No loading change to avoid flicker */ })
      .addCase(getGroupBalances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.balances = action.payload;
      })
      .addCase(getGroupBalances.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addExpense.pending, (state) => { state.isLoading = true; })
      .addCase(addExpense.fulfilled, (state, action) => {
        // We don't need to manually update state here because the dispatches above will trigger a refresh
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = expenseSlice.actions;
export default expenseSlice.reducer;
