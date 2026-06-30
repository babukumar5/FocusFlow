const QUEUE_KEY = 'focusflow_sync_queue';

// Get current queued requests
export const getQueue = () => {
  try {
    const queue = localStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (e) {
    console.error('Error reading sync queue from localStorage', e);
    return [];
  }
};

// Save queue to localStorage
const saveQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Error saving sync queue to localStorage', e);
  }
};

// Add a request to the queue
export const enqueueMutation = (url, method, body, token) => {
  const queue = getQueue();
  queue.push({
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    url,
    method,
    body,
    token,
    timestamp: Date.now()
  });
  saveQueue(queue);
};

// Clear the entire queue
export const clearQueue = () => {
  saveQueue([]);
};

// Synchronize all queued mutations to the backend
export const synchronizeQueue = async () => {
  if (!navigator.onLine) return { success: false, reason: 'Still offline' };
  
  const queue = getQueue();
  if (queue.length === 0) return { success: true, count: 0 };

  console.log(`FocusFlow Sync: Attempting to synchronize ${queue.length} offline mutations...`);
  
  let successCount = 0;
  const remaining = [];

  for (const item of queue) {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (item.token) {
        headers['Authorization'] = `Bearer ${item.token}`;
      }

      const res = await fetch(item.url, {
        method: item.method,
        headers,
        body: item.body ? JSON.stringify(item.body) : undefined
      });

      if (res.ok) {
        successCount++;
      } else {
        // If it failed due to server validations (4xx), do not retry (discard/log error)
        if (res.status >= 500) {
          remaining.push(item); // Server error, retry later
        } else {
          console.error(`Sync discard (client error ${res.status}):`, item);
        }
      }
    } catch (error) {
      console.error('Sync failed due to network error, pausing queue processing:', error);
      remaining.push(item); // Put back to retry later
      saveQueue([...remaining, ...queue.slice(successCount + remaining.length)]);
      return { success: false, reason: 'Network error during sync' };
    }
  }

  saveQueue(remaining);
  console.log(`FocusFlow Sync: Completed syncing ${successCount} mutations.`);
  return { success: true, count: successCount };
};

// Setup dynamic listener for network status changes
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    synchronizeQueue().catch(err => console.error('Auto-sync execution failed', err));
  });
}
