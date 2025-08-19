import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * 
 * Delays the execution of a value update until after a specified delay.
 * Useful for search inputs, API calls, and other operations where you want
 * to wait until the user stops typing.
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - The delay in milliseconds (default: 500ms)
 * @returns {any} The debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // Perform search API call
 *     searchAPI(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timeout if value changes before delay is reached
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebounceCallback Hook
 * 
 * Debounces a callback function instead of a value.
 * Useful when you want to debounce function execution rather than value changes.
 * 
 * @param {Function} callback - The function to debounce
 * @param {number} delay - The delay in milliseconds (default: 500ms)
 * @param {Array} deps - Dependency array for the callback
 * @returns {Function} The debounced callback function
 * 
 * @example
 * const debouncedSearch = useDebounceCallback((term) => {
 *   searchAPI(term);
 * }, 500, []);
 * 
 * const handleInputChange = (e) => {
 *   debouncedSearch(e.target.value);
 * };
 */
export function useDebounceCallback(callback, delay = 500, deps = []) {
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const debouncedCallback = (...args) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);

    setDebounceTimer(newTimer);
  };

  return debouncedCallback;
}

/**
 * useAsyncDebounce Hook
 * 
 * Debounces async operations and provides loading state.
 * Useful for API calls with loading indicators.
 * 
 * @param {Function} asyncFn - The async function to debounce
 * @param {number} delay - The delay in milliseconds (default: 500ms)
 * @returns {Object} Object containing the debounced function, loading state, and error
 * 
 * @example
 * const { debouncedFn: debouncedSearch, loading, error } = useAsyncDebounce(
 *   async (term) => {
 *     const result = await searchAPI(term);
 *     setSearchResults(result);
 *   },
 *   500
 * );
 * 
 * const handleSearch = (term) => {
 *   debouncedSearch(term);
 * };
 */
export function useAsyncDebounce(asyncFn, delay = 500) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const debouncedFn = async (...args) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const newTimer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        await asyncFn(...args);
      } catch (err) {
        setError(err);
        console.error('Debounced async function error:', err);
      } finally {
        setLoading(false);
      }
    }, delay);

    setDebounceTimer(newTimer);
  };

  const cancel = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
    setLoading(false);
  };

  return {
    debouncedFn,
    loading,
    error,
    cancel
  };
}

export default useDebounce;
