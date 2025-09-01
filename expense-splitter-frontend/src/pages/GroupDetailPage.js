// src/pages/GroupDetailPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getExpensesForGroup, getGroupBalances, addExpense, reset as resetExpenses } from '../features/expenses/expenseSlice';
import { getGroupById, addMemberToGroup, deleteGroup, reset as resetGroups } from '../features/groups/groupSlice';
import Modal from '../components/common/Modal';
import axios from 'axios';

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  
  // Expense form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitMethod, setSplitMethod] = useState('equally');
  const [splits, setSplits] = useState([]);

  // Member form state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const { user, token } = useSelector((state) => state.auth);
  const { expenses, balances, isLoading: isExpensesLoading } = useSelector((state) => state.expenses);
  const { singleGroup, isLoading: isGroupsLoading } = useSelector((state) => state.groups);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(getGroupById(groupId));
      dispatch(getExpensesForGroup(groupId));
      dispatch(getGroupBalances(groupId));
    }
    return () => {
      dispatch(resetExpenses());
      dispatch(resetGroups());
    };
  }, [groupId, user, navigate, dispatch]);

  // Effect to initialize splits when modal opens or members change
  useEffect(() => {
    if (singleGroup?.members) {
        const initialSplits = singleGroup.members.map(member => ({
            user: member,
            value: 0,
        }));
        setSplits(initialSplits);
    }
  }, [singleGroup?.members, isExpenseModalOpen]);


  const handleSplitChange = (userId, value) => {
    setSplits(splits.map(split => split.user._id === userId ? { ...split, value: Number(value) } : split));
  };
  
  // Memoized calculation for split validation
  const totalSplitValue = useMemo(() => {
    return splits.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [splits]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    let split_details;

    if (splitMethod === 'equally') {
        const amountPerMember = Number(amount) / singleGroup.members.length;
        split_details = singleGroup.members.map(member => ({
            user: member._id,
            owes: amountPerMember,
        }));
    } else if (splitMethod === 'exact') {
        if (totalSplitValue !== Number(amount)) {
            alert('The sum of exact amounts must equal the total expense amount.');
            return;
        }
        split_details = splits.map(s => ({ user: s.user._id, owes: s.value }));
    } else if (splitMethod === 'shares') {
        const totalShares = totalSplitValue;
        if (totalShares === 0) {
            alert('Total shares cannot be zero.');
            return;
        }
        const valuePerShare = Number(amount) / totalShares;
        split_details = splits.map(s => ({ user: s.user._id, owes: s.value * valuePerShare, share: s.value }));
    }

    const expenseData = { description, amount: Number(amount), group: groupId, paidBy: user._id, split_method: splitMethod, split_details };
    dispatch(addExpense(expenseData))
      .unwrap()
      .then(() => {
        setIsExpenseModalOpen(false);
        setDescription('');
        setAmount('');
      });
  };

  const handleSearchUsers = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`http://localhost:5000/api/v1/users?search=${e.target.value}`, config);
        const existingMemberIds = singleGroup.members.map(m => m._id);
        const filteredResults = response.data.data.filter(u => !existingMemberIds.includes(u._id));
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Failed to search users', error);
      }
    } else {
      setSearchResults([]);
    }
  };
  
  const handleAddMember = () => {
    if (selectedUser) {
      dispatch(addMemberToGroup({ groupId, userId: selectedUser._id }))
        .unwrap()
        .then(() => {
            setIsMemberModalOpen(false);
            setSearchQuery('');
            setSearchResults([]);
            setSelectedUser(null);
        });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
        dispatch(deleteGroup(groupId))
            .unwrap()
            .then(() => {
                navigate('/');
            })
            .catch((error) => {
                alert(`Error deleting group: ${error}`);
            });
    }
  };

  const isLoading = isExpensesLoading || isGroupsLoading;

  if (isLoading && !singleGroup) {
    return <div className="flex justify-center items-center h-screen"><h2>Loading...</h2></div>;
  }

  if (!singleGroup) {
    return (
        <div className="p-8">
            <Link to="/" className="text-accent hover:text-secondary mb-4 inline-block">
                &larr; Back to Dashboard
            </Link>
            <h2 className="text-2xl">Group not found or you are not a member.</h2>
        </div>
    );
  }

  return (
    <div className="bg-background dark:bg-dark-background min-h-screen">
        <header className="bg-white dark:bg-primary shadow-sm">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div>
                    <Link to="/" className="text-sm text-gray-500 hover:text-accent mb-2 inline-block">
                        &larr; All Groups
                    </Link>
                    <h1 className="text-3xl font-bold text-primary dark:text-dark-primary">{singleGroup.name}</h1>
                </div>
                <div className="flex items-center">
                    <div className="flex -space-x-2 mr-4">
                        {singleGroup.members.map(member => (
                            <img key={member._id} src={member.avatar} alt={member.name} title={member.name} className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-light-accent"/>
                        ))}
                    </div>
                    <button onClick={() => setIsMemberModalOpen(true)} className="px-4 py-2 text-sm font-medium text-primary bg-light-accent rounded-md hover:bg-opacity-80 mr-2">
                        Add Member
                    </button>
                    <button onClick={() => setIsExpenseModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-secondary">
                        Add Expense
                    </button>
                </div>
            </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expenses Column */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-primary dark:text-dark-primary mb-4 px-4 sm:px-0">Expenses</h2>
                    {expenses.length > 0 ? (
                        <ul className="space-y-4">
                        {expenses.map((expense) => (
                            <li key={expense._id} className="p-4 bg-white dark:bg-secondary rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lg text-secondary dark:text-dark-secondary">{expense.description}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Paid by {expense.paidBy.name}</p>
                                </div>
                                <p className="font-bold text-xl text-primary dark:text-dark-primary">₹{expense.amount.toFixed(2)}</p>
                            </div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <div className="p-6 bg-white dark:bg-secondary rounded-xl shadow-md text-center text-gray-500 dark:text-gray-400">
                            <p>No expenses yet!</p>
                            <p className="text-sm">Click "Add Expense" to get started.</p>
                        </div>
                    )}
                </div>

                {/* Balances Column */}
                <div>
                    <h2 className="text-2xl font-bold text-primary dark:text-dark-primary mb-4">Balances</h2>
                    <div className="bg-white dark:bg-secondary rounded-xl shadow-md p-4">
                        {balances.length > 0 ? (
                            <ul className="space-y-3">
                            {balances.map((member) => (
                                <li key={member.email} className="flex justify-between items-center pb-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700 text-primary dark:text-dark-primary">
                                <span>{member.name}</span>
                                <span className={`font-semibold ${member.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {member.balance > 0 ? `Gets back ₹${member.balance.toFixed(2)}` : member.balance < 0 ? `Owes ₹${Math.abs(member.balance).toFixed(2)}` : `Settled up`}
                                </span>
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">Balances will appear here.</p>
                        )}
                    </div>
                    {user && singleGroup.createdBy === user._id && (
                        <div className="mt-6 text-center">
                            <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700">
                                Delete this group
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>

        <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)}>
            <h3 className="text-xl font-bold mb-4">Add a New Expense</h3>
            <form onSubmit={handleAddExpense}>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                    <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Split Method</label>
                    <div className="mt-2 flex space-x-4">
                        <label><input type="radio" value="equally" checked={splitMethod === 'equally'} onChange={(e) => setSplitMethod(e.target.value)} className="mr-1"/> Equally</label>
                        <label><input type="radio" value="exact" checked={splitMethod === 'exact'} onChange={(e) => setSplitMethod(e.target.value)} className="mr-1"/> By Exact Amounts</label>
                        <label><input type="radio" value="shares" checked={splitMethod === 'shares'} onChange={(e) => setSplitMethod(e.target.value)} className="mr-1"/> By Shares</label>
                    </div>
                </div>

                {splitMethod !== 'equally' && (
                    <div className="mb-4 border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-md font-semibold">{splitMethod === 'exact' ? 'Enter Amounts' : 'Enter Shares'}</h4>
                            <div className={`text-sm font-bold ${totalSplitValue === Number(amount) && splitMethod === 'exact' ? 'text-green-600' : 'text-gray-600'}`}>
                                Total: {totalSplitValue} {splitMethod === 'shares' ? 'shares' : `of ₹${amount || 0}`}
                            </div>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {splits.map(split => (
                                <div key={split.user._id} className="flex items-center justify-between">
                                    <label htmlFor={`split-${split.user._id}`}>{split.user.name}</label>
                                    <input type="number" id={`split-${split.user._id}`} value={split.value} onChange={(e) => handleSplitChange(split.user._id, e.target.value)} className="w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end mt-6">
                    <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-secondary">Add</button>
                </div>
            </form>
        </Modal>
        <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)}>
            <h3 className="text-xl font-bold mb-4">Add a Member</h3>
            <div>
                <label htmlFor="userSearch" className="block text-sm font-medium text-gray-700">Search for a user by name or email</label>
                <input type="text" id="userSearch" value={searchQuery} onChange={handleSearchUsers} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Start typing..."/>
            </div>
            <ul className="mt-4 max-h-40 overflow-y-auto">
                {searchResults.map(u => (
                    <li key={u._id} onClick={() => { setSelectedUser(u); setSearchQuery(u.name); setSearchResults([]); }} className="p-2 hover:bg-gray-100 cursor-pointer rounded-md">
                        {u.name} ({u.email})
                    </li>
                ))}
            </ul>
            <div className="flex justify-end mt-4">
                <button type="button" onClick={() => setIsMemberModalOpen(false)} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="button" onClick={handleAddMember} disabled={!selectedUser} className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-secondary disabled:bg-opacity-50">Add Member</button>
            </div>
        </Modal>
    </div>
  );
};

export default GroupDetailPage;
