// src/features/groups/groupSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/groups/';

const initialState = {
  groups: [],
  singleGroup: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

const getToken = (thunkAPI) => thunkAPI.getState().auth.token;

export const getGroups = createAsyncThunk('groups/getAll', async (_, thunkAPI) => {
  try {
    const token = getToken(thunkAPI);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL, config);
    return response.data.data;
  } catch (error) {
    const message = (error.response?.data?.error) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getGroupById = createAsyncThunk('groups/getById', async (groupId, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_URL + groupId, config);
      return response.data.data;
    } catch (error) {
      const message = (error.response?.data?.error) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  });

export const createGroup = createAsyncThunk('groups/create', async (groupData, thunkAPI) => {
    try {
        const token = getToken(thunkAPI);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post(API_URL, groupData, config);
        return response.data.data;
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const addMemberToGroup = createAsyncThunk('groups/addMember', async ({ groupId, userId }, thunkAPI) => {
    try {
        const token = getToken(thunkAPI);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post(`${API_URL}${groupId}/members`, { userId }, config);
        return response.data.data;
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const deleteGroup = createAsyncThunk('groups/delete', async (groupId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(API_URL + groupId, config);
        return groupId; // Return the id to filter it out of the state
    } catch (error) {
        const message = (error.response?.data?.error) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    reset: (state) => {
        state.singleGroup = null;
        state.isError = false;
        state.isSuccess = false;
        state.isLoading = false;
        state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGroups.pending, (state) => { state.isLoading = true; })
      .addCase(getGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.groups = action.payload;
      })
      .addCase(getGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createGroup.pending, (state) => { state.isLoading = true; })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getGroupById.pending, (state) => { state.isLoading = true; })
      .addCase(getGroupById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.singleGroup = action.payload;
      })
      .addCase(getGroupById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addMemberToGroup.pending, (state) => { /* No loading state change to avoid UI flicker */ })
      .addCase(addMemberToGroup.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.singleGroup = action.payload;
        const index = state.groups.findIndex(g => g._id === action.payload._id);
        if (index !== -1) {
            state.groups[index] = action.payload;
        }
      })
      .addCase(addMemberToGroup.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteGroup.pending, (state) => { state.isLoading = true; })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.groups = state.groups.filter((group) => group._id !== action.payload);
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = groupSlice.actions;
export default groupSlice.reducer;
