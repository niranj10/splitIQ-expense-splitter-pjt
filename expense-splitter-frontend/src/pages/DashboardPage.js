import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getGroups, createGroup, reset } from '../features/groups/groupSlice';
import Modal from '../components/common/Modal';

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { groups, isLoading, isError, message } = useSelector(
    (state) => state.groups
  );

  useEffect(() => {
    if (isError) console.log(message);
    if (!user) navigate('/login');
    dispatch(getGroups());
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, isError, message, dispatch]);

  const handleCreateGroup = (e) => {
    e.preventDefault();
    dispatch(createGroup({ name: groupName, description: groupDescription }));
    setGroupName('');
    setGroupDescription('');
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <h2 className="text-xl text-primary dark:text-dark-primary">Loading...</h2>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-primary dark:text-dark-primary">Your Groups</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-opacity-80"
        >
          Create New Group
        </button>
      </div>

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link key={group._id} to={`/group/${group._id}`}>
              <div className="p-6 bg-white dark:bg-secondary rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all">
                <h3 className="text-xl font-bold text-secondary dark:text-dark-secondary">{group.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{group.description}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white dark:bg-secondary rounded-xl shadow-md">
          <p className="text-gray-500 dark:text-gray-400">You are not a member of any groups yet.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-xl font-bold mb-4 text-primary dark:text-dark-primary">Create a New Group</h3>
        <form onSubmit={handleCreateGroup}>
          <div className="mb-4">
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white dark:bg-secondary dark:text-dark-primary"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="groupDescription"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white dark:bg-secondary dark:text-dark-primary"
            />
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-opacity-80"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
