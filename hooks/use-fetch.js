"use client";

import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cb(...args);
      // Handle graceful server action errors returned as { success: false, error }
      if (response && response.success === false && response.error) {
        const err = new Error(response.error);
        setError(err);
        toast.error(response.error);
        setData(undefined);
      } else {
        setData(response);
        setError(null);
      }
      return response;
    } catch (err) {
      setError(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
