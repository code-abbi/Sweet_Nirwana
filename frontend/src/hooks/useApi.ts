import { useState, useEffect } from 'react';
import { Sweet, InventoryItem, Transaction, ApiError } from '../types';
import { apiService } from '../services/api';

// Custom hook for fetching sweets
export function useSweets() {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSweets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getSweets();
      setSweets(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  const refetch = () => {
    fetchSweets();
  };

  return {
    sweets,
    isLoading,
    error,
    refetch,
  };
}

// Custom hook for fetching inventory status
export function useInventoryStatus() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventoryStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getInventoryStatus();
      setInventory(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryStatus();
  }, []);

  const refetch = () => {
    fetchInventoryStatus();
  };

  return {
    inventory,
    isLoading,
    error,
    refetch,
  };
}

// Custom hook for fetching transactions
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getTransactionHistory();
      setTransactions(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const refetch = () => {
    fetchTransactions();
  };

  return {
    transactions,
    isLoading,
    error,
    refetch,
  };
}

// Custom hook for fetching low stock alerts
export function useLowStockAlerts() {
  const [alerts, setAlerts] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLowStockAlerts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getLowStockAlerts();
      setAlerts(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockAlerts();
  }, []);

  const refetch = () => {
    fetchLowStockAlerts();
  };

  return {
    alerts,
    isLoading,
    error,
    refetch,
  };
}

// Custom hook for generic API calls with loading state
export function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = () => {
    execute();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}