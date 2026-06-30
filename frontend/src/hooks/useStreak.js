import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useStreak = () => {
  const { user } = useContext(AuthContext);
  return {
    currentStreak: user?.streak?.currentStreak || 0,
    longestStreak: user?.streak?.longestStreak || 0,
    lastActiveDate: user?.streak?.lastActiveDate || null
  };
};

export default useStreak;
